// Vercel serverless function: receives the appointment / referral form POST,
// validates it, sends an email to office@hamiltoncaredental.ca via SMTP,
// then 303-redirects the visitor to /thank-you/.
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

const safeStr = (v) => String(v == null ? "" : v).trim();
const stripCRLF = (v) => safeStr(v).replace(/[\r\n]+/g, " ").slice(0, 500);

function isValidEmail(s) {
  return typeof s === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
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

  const name = stripCRLF(body.name);
  const email = stripCRLF(body.email);
  const phone = stripCRLF(body.phone);
  const reason = stripCRLF(body.reason || body.preferred_date);
  const notes = safeStr(body.notes).slice(0, 4000);
  const source = stripCRLF(body._source || "unknown");
  const referredName = stripCRLF(body.referred_name);
  const referredContact = stripCRLF(body.referred_contact);

  const hasContact = (email && isValidEmail(email)) || phone;
  if (!name || !hasContact) {
    res.statusCode = 303;
    res.setHeader("Location", SITE_URL + "/contact-us/?error=missing-fields");
    return res.end();
  }

  const lines = [
    "A new enquiry was submitted from the Hamilton Care Dental Centre website.",
    "",
    "Name:    " + name,
    "Email:   " + (email || "(not provided)"),
    "Phone:   " + (phone || "(not provided)"),
    reason ? "Reason / preferred date: " + reason : null,
    referredName ? "Referred name: " + referredName : null,
    referredContact ? "Referred contact: " + referredContact : null,
    "",
    "Notes / message:",
    notes || "(none)",
    "",
    "-----",
    "Source page: " + source,
    "When (UTC): " + new Date().toISOString(),
    "IP: " + (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "?"),
  ].filter(Boolean);
  const text = lines.join("\n");

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
      replyTo: email && isValidEmail(email) ? '"' + name + '" <' + email + ">" : undefined,
      subject: "New website enquiry from " + name,
      text,
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
