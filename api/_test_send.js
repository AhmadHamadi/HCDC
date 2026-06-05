// Local test harness for api/send.js. Mocks nodemailer so NO email is sent.
// Run with: node api/_test_send.js
//
// This file is intentionally outside the Vercel function entry-point pattern
// (filename starts with underscore so Vercel won't expose it as a route).

const Module = require("module");
const path = require("path");

// ---- Mock nodemailer in the require cache before loading send.js ----
const sendMailCalls = [];
require.cache[require.resolve("nodemailer")] = {
  id: require.resolve("nodemailer"),
  filename: require.resolve("nodemailer"),
  loaded: true,
  exports: {
    createTransport: (opts) => ({
      _opts: opts,
      sendMail: async (msg) => {
        sendMailCalls.push({ opts, msg });
        return { messageId: "MOCK-" + Date.now() };
      },
    }),
  },
};

// ---- Tiny fake req/res ----
// Defaults model a REAL browser submission from our own page: a same-site
// Origin header + a timing token stamped ~6s ago (comfortably past the 2.5s
// minimum). Individual tests override these to exercise bot scenarios:
//   origin: null        -> no Origin header (e.g. direct curl POST)
//   stampToken: false   -> do not auto-add _t (combine with body._t to control)
function makeReq({
  method = "POST",
  body = {},
  headers = {},
  origin = "https://hamiltoncaredental.com",
  host = "hamiltoncaredental.com",
  stampToken = true,
} = {}) {
  // Encode body as application/x-www-form-urlencoded so readBody walks
  // the same path the production handler takes for browser submissions.
  const fullBody = { ...body };
  if (stampToken && fullBody._t === undefined) {
    fullBody._t = String(Date.now() - 6000); // loaded 6s ago -> passes timing trap
  }
  const raw = new URLSearchParams(fullBody).toString();
  const hdrs = { "content-type": "application/x-www-form-urlencoded", host, ...headers };
  if (origin !== null && hdrs.origin === undefined) hdrs.origin = origin;
  let dataCb = null;
  let endCb = null;
  return {
    method,
    headers: hdrs,
    body: null,  // force readBody to hit the stream path
    socket: { remoteAddress: "127.0.0.1" },
    on(event, cb) {
      if (event === "data") dataCb = cb;
      if (event === "end") endCb = cb;
      if (event === "end") setImmediate(() => { dataCb && dataCb(Buffer.from(raw)); endCb && endCb(); });
    },
  };
}

// Asserts a request was dropped SILENTLY: 303 to /thank-you/, and no email sent.
function expectSilentlyDropped(res, sendMailCalls) {
  if (res.statusCode !== 303) throw new Error("expected 303, got " + res.statusCode);
  if (!String(res.headers["location"]).endsWith("/thank-you/"))
    throw new Error("expected silent success redirect to /thank-you/, got " + res.headers["location"]);
  if (sendMailCalls.length !== 0) throw new Error("bot submission should NOT have sent email");
}
function makeRes() {
  const res = {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
    end(v) { if (v) this.body += v; this._ended = true; },
  };
  return res;
}

async function run(name, fn) {
  process.stdout.write("- " + name + " ... ");
  try {
    await fn();
    console.log("OK");
    return true;
  } catch (e) {
    console.log("FAIL");
    console.error("    " + e.message);
    return false;
  }
}

async function main() {
  // SMTP env vars must be set for the happy-path test to attempt a send.
  process.env.SMTP_HOST = process.env.SMTP_HOST || "smtp.example.com";
  process.env.SMTP_PORT = process.env.SMTP_PORT || "587";
  process.env.SMTP_USER = process.env.SMTP_USER || "no-reply@example.com";
  process.env.SMTP_PASS = process.env.SMTP_PASS || "test-password";
  // Pin the recipient for the happy-path test so it isn't sensitive to any
  // temporary redirect set in send.js. Production deploys read TO_EMAIL from
  // Vercel env vars and ignore the hardcoded fallback.
  process.env.TO_EMAIL = "office@hamiltoncaredental.com";

  const send = require("./send.js");
  let pass = 0, total = 0;

  total++; if (await run("GET request returns 405", async () => {
    const req = makeReq({ method: "GET" });
    const res = makeRes();
    await send(req, res);
    if (res.statusCode !== 405) throw new Error("got " + res.statusCode);
    if (!res.headers["allow"]) throw new Error("no Allow header");
  })) pass++;

  total++; if (await run("missing name+contact -> redirect with error", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: {} });
    const res = makeRes();
    await send(req, res);
    if (res.statusCode !== 303) throw new Error("got " + res.statusCode);
    if (!String(res.headers["location"]).includes("error=missing-fields")) throw new Error("wrong redirect: " + res.headers["location"]);
    if (sendMailCalls.length !== 0) throw new Error("should not have sent email");
  })) pass++;

  total++; if (await run("honeypot fired -> 303 to thank-you, no email", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: { name: "Bot", email: "bot@example.com", website: "https://spam.example" } });
    const res = makeRes();
    await send(req, res);
    if (res.statusCode !== 303) throw new Error("got " + res.statusCode);
    if (!String(res.headers["location"]).endsWith("/thank-you/")) throw new Error("wrong redirect");
    if (sendMailCalls.length !== 0) throw new Error("honeypot should NOT have sent email");
  })) pass++;

  total++; if (await run("valid appointment submission -> standard subject, organized body, redirects to thank-you", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: {
      name: "Jane Smith", email: "jane@example.com", phone: "289-555-0123",
      preferred_date: "2026-06-01",
      notes: "Routine cleaning, please.",
      _source: "homepage-appointment",
    }});
    const res = makeRes();
    await send(req, res);
    if (res.statusCode !== 303) throw new Error("status " + res.statusCode);
    if (!String(res.headers["location"]).endsWith("/thank-you/")) throw new Error("wrong redirect: " + res.headers["location"]);
    if (sendMailCalls.length !== 1) throw new Error("expected 1 sendMail, got " + sendMailCalls.length);
    const call = sendMailCalls[0];
    // Standard subject across every submission
    if (call.msg.subject !== "Appointment Request Submission") throw new Error("subject not standardized: " + call.msg.subject);
    // To address
    if (call.msg.to !== "office@hamiltoncaredental.com") throw new Error("wrong To: " + call.msg.to);
    // Body contains every relevant field
    if (!call.msg.text.includes("Jane Smith")) throw new Error("body missing name");
    if (!call.msg.text.includes("jane@example.com")) throw new Error("body missing email");
    if (!call.msg.text.includes("289-555-0123")) throw new Error("body missing phone");
    if (!call.msg.text.includes("2026-06-01")) throw new Error("body missing preferred date");
    if (!call.msg.text.includes("Routine cleaning")) throw new Error("body missing notes");
    if (!call.msg.text.includes("Homepage appointment form")) throw new Error("body missing friendly source label");
    if (!call.msg.text.toLowerCase().includes("new appointment request")) throw new Error("body missing heading");
    if (call.msg.text.toLowerCase().includes("patient referral")) throw new Error("non-referral body should not say Patient referral");
    // HTML body present too
    if (!call.msg.html || !call.msg.html.includes("Jane Smith")) throw new Error("HTML body missing or doesn't include name");
    if (!call.msg.html.toLowerCase().includes("new appointment request")) throw new Error("HTML body missing heading");
    // Reply-to set to patient
    if (!call.msg.replyTo.includes("jane@example.com")) throw new Error("replyTo wrong");
    // Transport
    if (call.opts.host !== "smtp.example.com") throw new Error("SMTP host wrong");
    if (call.opts.port !== 587) throw new Error("SMTP port wrong");
    if (call.opts.secure !== false) throw new Error("port 587 should be secure=false (STARTTLS)");
  })) pass++;

  total++; if (await run("valid referral submission -> labels referrer and referred separately", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: {
      name: "Alice Referrer", phone: "289-555-1111", email: "alice@example.com",
      referred_name: "Bob Newpatient", referred_contact: "bob@example.com",
      notes: "Bob has been wanting to come in.",
      _source: "referral-form",
    }});
    const res = makeRes();
    await send(req, res);
    if (res.statusCode !== 303) throw new Error("status " + res.statusCode);
    if (sendMailCalls.length !== 1) throw new Error("expected 1 sendMail");
    const t = sendMailCalls[0].msg.text;
    if (sendMailCalls[0].msg.subject !== "Appointment Request Submission") throw new Error("subject not standardized for referral");
    if (!t.toLowerCase().includes("new patient referral")) throw new Error("referral heading missing");
    if (!t.includes("Patient referral form")) throw new Error("referral source label missing");
    if (!t.includes("Referring patient")) throw new Error("missing referring-patient section heading");
    if (!t.includes("Patient being referred")) throw new Error("missing referred section heading");
    if (!t.includes("Alice Referrer")) throw new Error("referrer name missing");
    if (!t.includes("Bob Newpatient")) throw new Error("referred name missing");
    if (!t.includes("bob@example.com")) throw new Error("referred contact missing");
  })) pass++;

  total++; if (await run("phone-only contact accepted (no email)", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: { name: "John Doe", phone: "(289) 555-9999", _source: "contact-us-appointment" } });
    const res = makeRes();
    await send(req, res);
    if (res.statusCode !== 303) throw new Error("status " + res.statusCode);
    if (sendMailCalls.length !== 1) throw new Error("expected 1 sendMail, got " + sendMailCalls.length);
    if (sendMailCalls[0].msg.replyTo) throw new Error("replyTo should be undefined when no email");
    if (!sendMailCalls[0].msg.text.includes("Contact page appointment form")) throw new Error("source label wrong");
  })) pass++;

  total++; if (await run("CRLF in header fields is stripped (no header injection)", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: { name: "Eve\r\nBcc: attacker@evil", email: "eve@example.com", phone: "x" } });
    const res = makeRes();
    await send(req, res);
    const msg = sendMailCalls[0].msg;
    // What matters: nothing nodemailer treats as a header may contain CR or LF,
    // because that's what enables RFC-5322 header injection.
    for (const field of ["subject", "to", "from", "replyTo"]) {
      const v = msg[field];
      if (v && (v.includes("\r") || v.includes("\n"))) {
        throw new Error("CRLF in header field " + field + ": " + JSON.stringify(v));
      }
    }
    // The body is plain text and may legitimately contain the substring "Bcc:"
    // as part of the visitor's input; that's harmless because it isn't a header.
  })) pass++;

  total++; if (await run("port 465 -> secure SMTPS", async () => {
    sendMailCalls.length = 0;
    process.env.SMTP_PORT = "465";
    delete require.cache[require.resolve("./send.js")];
    const sendSmtps = require("./send.js");
    const req = makeReq({ body: { name: "Smtps", email: "x@y.com" } });
    const res = makeRes();
    await sendSmtps(req, res);
    if (sendMailCalls[0].opts.secure !== true) throw new Error("port 465 should be secure=true");
    process.env.SMTP_PORT = "587";  // restore
  })) pass++;

  total++; if (await run("missing SMTP env vars -> graceful redirect, no send", async () => {
    sendMailCalls.length = 0;
    delete require.cache[require.resolve("./send.js")];
    const old = process.env.SMTP_HOST;
    delete process.env.SMTP_HOST;
    const sendNoEnv = require("./send.js");
    const req = makeReq({ body: { name: "X", email: "x@y.com" } });
    const res = makeRes();
    await sendNoEnv(req, res);
    if (res.statusCode !== 303) throw new Error("status " + res.statusCode);
    if (!String(res.headers["location"]).includes("server-not-configured")) throw new Error("wrong redirect");
    if (sendMailCalls.length !== 0) throw new Error("should not send without env vars");
    process.env.SMTP_HOST = old;
  })) pass++;

  // =====================================================================
  // ANTI-SPAM LAYERS — real bot scenarios vs. a genuine human submission.
  // =====================================================================

  const validBody = {
    name: "Maria Lopez", email: "maria@gmail.com", phone: "289-555-0177",
    preferred_date: "2026-06-20", notes: "I'd like to book a cleaning, thanks.",
    _source: "contact-us-appointment",
  };

  // ---- Layer 1: Origin / Referer ----
  total++; if (await run("BOT: direct POST with no Origin and no Referer -> dropped silently", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: validBody, origin: null }); // no origin, no referer
    const res = makeRes();
    await send(req, res);
    expectSilentlyDropped(res, sendMailCalls);
  })) pass++;

  total++; if (await run("BOT: POST from a foreign origin -> dropped silently", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: validBody, origin: "https://spam-bot.example.ru" });
    const res = makeRes();
    await send(req, res);
    expectSilentlyDropped(res, sendMailCalls);
  })) pass++;

  total++; if (await run("HUMAN: Referer-only (no Origin) from our own page -> accepted", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: validBody, origin: null, headers: { referer: "https://hamiltoncaredental.com/contact-us/" } });
    const res = makeRes();
    await send(req, res);
    if (sendMailCalls.length !== 1) throw new Error("expected email to be sent, got " + sendMailCalls.length);
  })) pass++;

  total++; if (await run("HUMAN: Vercel preview deployment origin -> accepted", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: validBody, origin: "https://hcdc-git-main-acme.vercel.app", host: "hcdc-git-main-acme.vercel.app" });
    const res = makeRes();
    await send(req, res);
    if (sendMailCalls.length !== 1) throw new Error("expected email to be sent, got " + sendMailCalls.length);
  })) pass++;

  total++; if (await run("HUMAN: deployment served from a different host (Host header auto-allow) -> accepted", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: validBody, origin: "https://www.somenewdomain.test", host: "www.somenewdomain.test" });
    const res = makeRes();
    await send(req, res);
    if (sendMailCalls.length !== 1) throw new Error("Host-header self-allow failed; got " + sendMailCalls.length);
  })) pass++;

  // ---- Layer 2: Timing trap ----
  total++; if (await run("BOT: submission arrives < 2.5s after load -> dropped silently", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: { ...validBody, _t: String(Date.now() - 200) }, stampToken: false });
    const res = makeRes();
    await send(req, res);
    expectSilentlyDropped(res, sendMailCalls);
  })) pass++;

  total++; if (await run("HUMAN: valid origin but MISSING timing token (JS off / cached page) -> accepted", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: validBody, stampToken: false }); // no _t at all
    const res = makeRes();
    await send(req, res);
    if (sendMailCalls.length !== 1) throw new Error("missing-token human should pass; got " + sendMailCalls.length);
  })) pass++;

  // ---- Layer 4: Content filtering ----
  total++; if (await run("BOT: 2+ links in the message -> dropped silently", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: { ...validBody, notes: "Great site! Visit https://cheap-pills.ru and http://buy-now.xyz today" } });
    const res = makeRes();
    await send(req, res);
    expectSilentlyDropped(res, sendMailCalls);
  })) pass++;

  total++; if (await run("BOT: link/HTML stuffed in the name field -> dropped silently", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: { ...validBody, name: "Buy backlinks http://seo-spam.top" } });
    const res = makeRes();
    await send(req, res);
    expectSilentlyDropped(res, sendMailCalls);
  })) pass++;

  total++; if (await run("BOT: absurdly long name -> dropped silently", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: { ...validBody, name: "x".repeat(200) } });
    const res = makeRes();
    await send(req, res);
    expectSilentlyDropped(res, sendMailCalls);
  })) pass++;

  total++; if (await run("BOT: spam phrases across 2+ categories (SEO + crypto) -> dropped silently", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: { ...validBody, notes: "We provide SEO backlinks and crypto bitcoin investment opportunity for your clinic." } });
    const res = makeRes();
    await send(req, res);
    expectSilentlyDropped(res, sendMailCalls);
  })) pass++;

  total++; if (await run("HUMAN: a single spam-ish word does NOT block a real patient", async () => {
    sendMailCalls.length = 0;
    // "seo" appears (1 category only) inside a genuine question -> must go through.
    const req = makeReq({ body: { ...validBody, notes: "A friend who does SEO recommended your clinic. Can I book a checkup?" } });
    const res = makeRes();
    await send(req, res);
    if (sendMailCalls.length !== 1) throw new Error("single-category word wrongly blocked a real patient; got " + sendMailCalls.length);
  })) pass++;

  // ---- Full genuine human happy path through ALL layers ----
  total++; if (await run("HUMAN: genuine appointment (good origin, realistic timing, clean content) -> email sent", async () => {
    sendMailCalls.length = 0;
    const req = makeReq({ body: {
      name: "David Chen", phone: "(905) 555-2211", email: "david.chen@outlook.com",
      preferred_date: "2026-07-02", notes: "My daughter needs her first checkup. Mornings are best.",
      _source: "homepage-appointment",
    }});
    const res = makeRes();
    await send(req, res);
    if (res.statusCode !== 303) throw new Error("status " + res.statusCode);
    if (!String(res.headers["location"]).endsWith("/thank-you/")) throw new Error("wrong redirect");
    if (sendMailCalls.length !== 1) throw new Error("genuine submission was dropped; got " + sendMailCalls.length);
    if (!sendMailCalls[0].msg.text.includes("David Chen")) throw new Error("email missing patient name");
  })) pass++;

  console.log("\n" + pass + " / " + total + " tests passed");
  process.exit(pass === total ? 0 : 1);
}

main().catch((e) => { console.error(e); process.exit(2); });
