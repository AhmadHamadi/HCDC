// Vercel serverless function: receives the appointment / referral form POST,
// validates it, sends an email to office@hamiltoncaredental.com via SMTP,
// then 303-redirects the visitor to /thank-you/.
//
// All form submissions on the site (homepage appointment, contact-us
// appointment, referral form) reach this single endpoint and produce an
// email with a single, identical subject line so the front-desk inbox
// stays predictable. The form that was submitted, and which fields the
// visitor filled in, are clearly labelled in the email body.
//
// Required env vars (set in Vercel -> Project Settings -> Environment Variables):
//   SMTP_HOST   e.g. "mail.hamiltoncaredental.ca" or "smtp.gmail.com"
//   SMTP_PORT   e.g. "587" (STARTTLS) or "465" (SMTPS)
//   SMTP_USER   the mailbox username used to send (e.g. "no-reply@hamiltoncaredental.ca")
//   SMTP_PASS   the mailbox password / app password
//
// Optional env vars (have sensible defaults if you leave them out):
//   TO_EMAIL    defaults to "office@hamiltoncaredental.com"
//   FROM_EMAIL  defaults to SMTP_USER
//   SITE_URL    defaults to "https://hamiltoncaredental.com"

const nodemailer = require("nodemailer");

const TO_EMAIL = process.env.TO_EMAIL || "office@hamiltoncaredental.com";
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || "no-reply@hamiltoncaredental.ca";
const FROM_NAME = "Hamilton Care Dental website";
const SITE_URL = process.env.SITE_URL || "https://hamiltoncaredental.com";
const REDIRECT_OK = "/thank-you/";

// Uniform subject line so the front desk inbox has a predictable shape.
const EMAIL_SUBJECT = "Appointment Request Submission";

const safeStr = (v) => String(v == null ? "" : v).trim();
const stripCRLF = (v) => safeStr(v).replace(/[\r\n]+/g, " ").slice(0, 500);

function isValidEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function escapeHtml(s) {
  return safeStr(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Maps _source field -> friendly label for the receptionist.
function sourceLabel(src) {
  switch (src) {
    case "homepage-appointment":   return "Homepage appointment form";
    case "contact-us-appointment": return "Contact page appointment form";
    case "referral-form":          return "Patient referral form";
    default:                       return src || "Unknown";
  }
}

function isReferral(src) {
  return src === "referral-form";
}

// ---------------------------------------------------------------------------
// Anti-spam layers (server-side, no paid services / no API keys).
// Every bot rejection is returned as a SILENT success (303 -> /thank-you/) so
// bots get no feedback about which check caught them.
// ---------------------------------------------------------------------------

const SILENT_OK = (res) => {
  res.statusCode = 303;
  res.setHeader("Location", SITE_URL + REDIRECT_OK);
  return res.end();
};

// Pull a bare lowercased hostname out of an Origin, Referer, or Host value.
// Handles "https://host:443/path", "host:port", "user@host", etc.
function hostnameOf(value) {
  if (!value) return "";
  let s = String(value).trim();
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//i, ""); // strip scheme
  s = s.split("/")[0];                            // strip path
  s = s.split("@").pop();                         // strip userinfo
  s = s.replace(/^\[(.*)\]$/, "$1");              // strip IPv6 brackets
  s = s.split(":")[0];                            // strip port
  return s.toLowerCase();
}

// Layer 1 — Origin / Referer check.
// If the request carries an Origin or Referer, it must be one of our own pages;
// a FOREIGN host means a cross-site bot, so we drop it. We allow the deployment
// host AUTOMATICALLY via the request's own Host header (so this never breaks
// whatever domain the site is actually served from) plus the known production
// hosts and any Vercel preview (*.vercel.app).
//
// PATIENT-FRIENDLY: if there is NO Origin and NO Referer at all, we let it
// through. Some privacy browsers, in-app browsers (Instagram/Facebook), and
// corporate proxies strip both headers, and we don't want to block those real
// patients. The honeypot + timing + content layers still apply to them.
function originAllowed(req) {
  const origin = req.headers["origin"];
  const referer = req.headers["referer"] || req.headers["referrer"];
  // Prefer Origin (authoritative); fall back to Referer.
  const candidate = origin ? hostnameOf(origin) : referer ? hostnameOf(referer) : "";
  if (!candidate) return true; // neither header present -> favor real patients

  const allowed = new Set();
  const add = (h) => { const x = hostnameOf(h); if (x) allowed.add(x); };
  add(req.headers["host"]);          // the host this request actually arrived on
  add(process.env.VERCEL_URL);       // current Vercel deployment URL, if set
  add(process.env.SITE_URL);
  add(SITE_URL);
  add("hamiltoncaredental.com");
  add("www.hamiltoncaredental.com");

  if (allowed.has(candidate)) return true;
  if (candidate.endsWith(".vercel.app")) return true; // preview deployments
  return false;
}

// Layer 2 — Timing trap.
// The page stamps a hidden _t field with Date.now() when it loads. Anything that
// arrives < 2.5s after load is a bot. IMPORTANT: a missing / unparseable / future
// token is treated as OK, so visitors with JavaScript disabled or a cached page
// (valid origin but no fresh token) are NOT blocked.
const MIN_FILL_MS = 2500;
function timingOk(body) {
  const raw = body._t;
  if (raw == null || String(raw).trim() === "") return true; // no token -> lenient
  const t = Number(String(raw).trim());
  if (!Number.isFinite(t) || t <= 0) return true;            // unparseable -> lenient
  const elapsed = Date.now() - t;
  if (!Number.isFinite(elapsed) || elapsed < 0) return true;  // clock skew -> lenient
  return elapsed >= MIN_FILL_MS;
}

// Layer 4 — Content filtering.
// EXPLICIT_URL_RE: only full links (http(s):// or www.). Used for the MESSAGE so
// that a patient who simply mentions "google.com" or "facebook.com" is NOT
// flagged — only 2+ real pasted URLs (the classic spam shape) count.
const EXPLICIT_URL_RE = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
// DOMAINISH_RE: also catches a bare domain on a spammy TLD. Used ONLY for the
// NAME field, where a real name never contains a domain at all.
const DOMAINISH_RE = /(?:https?:\/\/|www\.)[^\s<>"']+|\b[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.(?:com|net|org|io|ru|info|biz|xyz|top|online|site|shop|club|vip|link|click|store|cn|co|live|icu|work|loan|men|win)\b/gi;
function countMatches(s, re) {
  const m = String(s || "").match(re);
  return m ? m.length : 0;
}

// Conservative spam-phrase categories. We only flag a message when it hits 2+
// DISTINCT categories (AND-logic), so a single keyword never blocks a real
// patient (e.g. someone who happens to mention "marketing" or "free").
const SPAM_CATEGORIES = [
  // SEO
  [/\bseo\b/, /back ?links?/, /search engine (?:ranking|optimi[sz])/, /rank(?:ing)? (?:#?\s?1|first|higher|on (?:the )?(?:first page|google))/, /guest post/, /link building/, /domain authority/],
  // Marketing / lead-gen
  [/digital marketing/, /marketing (?:services|agency|proposal)/, /increase (?:your )?(?:traffic|sales|leads|revenue)/, /grow your (?:business|traffic|revenue)/, /more (?:customers|clients|leads|traffic)/, /lead generation/, /web ?design services/],
  // Crypto / finance
  [/\bcrypto(?:currency)?\b/, /bitcoin/, /\bforex\b/, /\bnfts?\b/, /investment opportunity/, /trading (?:platform|bot|signals)/, /\bbinary options\b/],
  // Pharma
  [/viagra/, /cialis/, /\bpharmacy\b/, /\bpills?\b/, /\bmeds?\b.*(?:online|cheap)/],
  // Generic get-rich / scam
  [/click here/, /limited[ -]time offer/, /\bact now\b/, /100% free/, /make money/, /work from home/, /earn \$\s?\d/, /\bgift card\b/],
  // Gambling / loans
  [/\bcasino\b/, /payday loan/, /\bloans?\b.*(?:approved|guaranteed)/, /\bgambling\b/],
];

// Returns a short reason string if the submission looks like spam, else "".
function spamReason(fields) {
  const name = fields.name || "";
  const notes = fields.notes || "";

  // The name field should never carry HTML or a domain/link.
  if (/[<>]/.test(name)) return "html-in-name";
  if (countMatches(name, DOMAINISH_RE) >= 1) return "link-in-name";
  if (name.length > 120) return "name-too-long";

  // 2+ FULL pasted URLs in the body is the classic spam shape. Bare domain
  // mentions (e.g. "google.com") are deliberately NOT counted, so verbose
  // patients who reference a site are not blocked. Message length is not
  // capped here (the body is already trimmed to 4000 chars when stored).
  if (countMatches(notes, EXPLICIT_URL_RE) >= 2) return "multiple-links";

  // Conservative phrase match across the free-text fields, AND-logic (2+ cats).
  const hay = [name, notes, fields.referredName, fields.referredContact]
    .filter(Boolean).join(" ").toLowerCase();
  let hits = 0;
  for (const cat of SPAM_CATEGORIES) {
    if (cat.some((re) => re.test(hay))) hits++;
    if (hits >= 2) return "spam-phrases";
  }
  return "";
}

async function readBody(req) {
  // Vercel auto-parses req.body for known content types, but the form posts
  // application/x-www-form-urlencoded, which Vercel passes through as a string.
  // Handle both shapes safely.
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  let raw = req.body;
  if (raw == null) {
    raw = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      req.on("error", reject);
    });
  }
  if (Buffer.isBuffer(raw)) raw = raw.toString("utf8");
  if (typeof raw !== "string") return {};
  const params = new URLSearchParams(raw);
  const out = {};
  for (const [k, v] of params) out[k] = v;
  return out;
}

// Build a short plain-text email for the front desk. Only the essentials:
// who they are, how to reach them, when they want to come, what they wrote.
function buildPlainText(fields) {
  const lines = [];
  const dash = (v) => v || "-";

  if (fields.referral) {
    lines.push("New patient referral from the website.");
    lines.push("");
    lines.push("Referring patient");
    lines.push("Name:  " + dash(fields.name));
    lines.push("Phone: " + dash(fields.phone));
    lines.push("Email: " + dash(fields.email));
    lines.push("");
    lines.push("Patient being referred");
    lines.push("Name:    " + dash(fields.referredName));
    lines.push("Contact: " + dash(fields.referredContact));
  } else {
    lines.push("New appointment request from the website.");
    lines.push("");
    lines.push("Name:           " + dash(fields.name));
    lines.push("Phone:          " + dash(fields.phone));
    lines.push("Email:          " + dash(fields.email));
    lines.push("Preferred date: " + dash(fields.preferredDate));
  }

  if (fields.notes) {
    lines.push("");
    lines.push("Message:");
    lines.push(fields.notes);
  }

  lines.push("");
  lines.push("---");
  lines.push("Submitted from: " + fields.sourceLabel);
  return lines.join("\n");
}

// Minimal HTML version. Same content, just wrapped in a readable layout so
// modern mail clients render it neatly. No fancy styling.
function buildHtml(fields) {
  const E = escapeHtml;
  const row = (label, value) =>
    "<tr><td style=\"padding:4px 18px 4px 0;color:#555;white-space:nowrap;vertical-align:top\">" + E(label) + "</td>" +
    "<td style=\"padding:4px 0;color:#111;vertical-align:top\">" + E(value || "-") + "</td></tr>";

  let body;
  if (fields.referral) {
    body =
      "<h2 style=\"font:600 17px/1.3 system-ui,sans-serif;color:#111;margin:18px 0 6px\">Referring patient</h2>" +
      "<table style=\"border-collapse:collapse;font:14px/1.5 system-ui,sans-serif\">" +
      row("Name", fields.name) +
      row("Phone", fields.phone) +
      row("Email", fields.email) +
      "</table>" +
      "<h2 style=\"font:600 17px/1.3 system-ui,sans-serif;color:#111;margin:18px 0 6px\">Patient being referred</h2>" +
      "<table style=\"border-collapse:collapse;font:14px/1.5 system-ui,sans-serif\">" +
      row("Name", fields.referredName) +
      row("Contact", fields.referredContact) +
      "</table>";
  } else {
    body =
      "<table style=\"border-collapse:collapse;font:14px/1.5 system-ui,sans-serif;margin-top:10px\">" +
      row("Name", fields.name) +
      row("Phone", fields.phone) +
      row("Email", fields.email) +
      row("Preferred date", fields.preferredDate) +
      "</table>";
  }

  const message = fields.notes
    ? "<h2 style=\"font:600 17px/1.3 system-ui,sans-serif;color:#111;margin:18px 0 6px\">Message</h2>" +
      "<p style=\"font:14px/1.55 system-ui,sans-serif;color:#111;margin:0;white-space:pre-wrap\">" + E(fields.notes) + "</p>"
    : "";

  const heading = fields.referral
    ? "New patient referral from the website."
    : "New appointment request from the website.";

  return "<!doctype html><html><body style=\"margin:0;padding:24px;font-family:system-ui,sans-serif;color:#111\">" +
    "<div style=\"max-width:560px;margin:0 auto\">" +
    "<p style=\"font:14px/1.5 system-ui,sans-serif;margin:0 0 12px;color:#444\">" + heading + "</p>" +
    body +
    message +
    "<p style=\"font:12px/1.5 system-ui,sans-serif;color:#888;margin:22px 0 0;border-top:1px solid #eee;padding-top:10px\">" +
    "Submitted from: " + E(fields.sourceLabel) +
    "</p>" +
    "</div></body></html>";
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.setHeader("Location", SITE_URL + "/contact-us/");
    return res.end();
  }

  let body = {};
  try {
    body = await readBody(req);
  } catch (e) {
    res.statusCode = 400;
    return res.end("Bad request");
  }

  // Layer 3 — Honeypot: humans never see these hidden fields. If filled, drop
  // silently (still looks successful to the bot).
  if (body.website || body.url || body._hp) {
    return SILENT_OK(res);
  }

  // Layer 1 — Origin/Referer: drop anything not submitted from our own pages.
  // (A direct curl POST to /api/send carries no Origin and no Referer.)
  if (!originAllowed(req)) {
    return SILENT_OK(res);
  }

  // Layer 2 — Timing trap: drop submissions that arrive impossibly fast.
  // Missing/old token (JS off, cached page) is allowed through on purpose.
  if (!timingOk(body)) {
    return SILENT_OK(res);
  }

  const source = stripCRLF(body._source || "unknown");
  const referral = isReferral(source);

  const name = stripCRLF(body.name);
  const email = stripCRLF(body.email);
  const phone = stripCRLF(body.phone);
  const preferredDate = stripCRLF(body.preferred_date);
  const notes = safeStr(body.notes).slice(0, 4000);
  const referredName = stripCRLF(body.referred_name);
  const referredContact = stripCRLF(body.referred_contact);

  // Validation
  // - Appointment forms: name + (email OR phone) required
  // - Referral form: name (referrer) + (email OR phone of referrer) + referred contact required
  const hasContact = (email && isValidEmail(email)) || phone;
  const hasReferredContact = referredContact && referredContact.length > 0;
  const valid = name && hasContact && (!referral || hasReferredContact);
  if (!valid) {
    res.statusCode = 303;
    const back = referral ? "/referral-form/" : "/contact-us/";
    res.setHeader("Location", SITE_URL + back + "?error=missing-fields");
    return res.end();
  }

  const fields = {
    referral,
    sourceLabel: sourceLabel(source),
    name,
    email,
    phone,
    preferredDate,
    referredName,
    referredContact,
    notes,
    submittedAt: new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
    replyToEmail: email && isValidEmail(email) ? email : "",
    ip: stripCRLF(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown"),
  };

  // Layer 4 — Content filtering. Drop spammy submissions silently (the bot
  // still sees the success page). Runs after validation so we have clean fields.
  const reason = spamReason(fields);
  if (reason) {
    console.warn("Dropped likely-spam submission:", reason, "from", fields.ip);
    return SILENT_OK(res);
  }

  const text = buildPlainText(fields);
  const html = buildHtml(fields);

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.error("SMTP env vars missing", { hasHost: !!host, hasUser: !!user, hasPass: !!pass });
    res.statusCode = 303;
    res.setHeader("Location", SITE_URL + "/contact-us/?error=server-not-configured");
    return res.end();
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,           // SMTPS on 465, STARTTLS otherwise
    requireTLS: port !== 465,       // ensure STARTTLS on 587
    auth: { user, pass },
  });

  try {
    await transporter.sendMail({
      from: '"' + FROM_NAME + '" <' + FROM_EMAIL + ">",
      to: TO_EMAIL,
      replyTo: fields.replyToEmail ? '"' + name + '" <' + fields.replyToEmail + ">" : undefined,
      subject: EMAIL_SUBJECT,
      text,
      html,
    });
  } catch (err) {
    console.error("SMTP send failed:", err);
    res.statusCode = 303;
    res.setHeader("Location", SITE_URL + "/contact-us/?error=send-failed");
    return res.end();
  }

  res.statusCode = 303;
  res.setHeader("Location", SITE_URL + REDIRECT_OK);
  return res.end();
};
