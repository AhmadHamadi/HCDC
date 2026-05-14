// Vercel serverless function: receives the appointment / referral form POST,
// validates it, sends an email to office@hamiltoncaredental.ca via SMTP,
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
//   TO_EMAIL    defaults to "office@hamiltoncaredental.ca"
//   FROM_EMAIL  defaults to SMTP_USER
//   SITE_URL    defaults to "https://hamiltoncaredental.com"

const nodemailer = require("nodemailer");

const TO_EMAIL = process.env.TO_EMAIL || "office@hamiltoncaredental.ca";
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

  // Honeypot: humans never see these hidden fields. If filled, accept silently.
  if (body.website || body.url || body._hp) {
    res.statusCode = 303;
    res.setHeader("Location", SITE_URL + REDIRECT_OK);
    return res.end();
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
