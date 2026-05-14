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

// Format a single field row for the plain-text email body. Pads the label
// so values line up neatly in monospaced mail clients.
function ptRow(label, value) {
  const padded = (label + ":").padEnd(22, " ");
  return padded + (value || "(not provided)");
}

// Build the plain-text email body for the front desk.
function buildPlainText(fields) {
  const lines = [];
  lines.push("APPOINTMENT REQUEST SUBMISSION");
  lines.push("Hamilton Care Dental Centre website");
  lines.push("");
  lines.push("------ Form ------");
  lines.push(ptRow("Form type", fields.referral ? "Patient referral" : "Appointment request"));
  lines.push(ptRow("Submitted via", fields.sourceLabel));
  lines.push("");

  if (fields.referral) {
    lines.push("------ Person referring ------");
    lines.push(ptRow("Name", fields.name));
    lines.push(ptRow("Phone", fields.phone));
    lines.push(ptRow("Email", fields.email));
    lines.push("");
    lines.push("------ Friend / family member being referred ------");
    lines.push(ptRow("Name", fields.referredName));
    lines.push(ptRow("Phone or email", fields.referredContact));
  } else {
    lines.push("------ Patient contact ------");
    lines.push(ptRow("Full name", fields.name));
    lines.push(ptRow("Phone", fields.phone));
    lines.push(ptRow("Email", fields.email));
    lines.push("");
    lines.push("------ Visit details ------");
    lines.push(ptRow("Preferred date", fields.preferredDate));
  }
  lines.push("");
  lines.push("------ Message / notes ------");
  lines.push(fields.notes || "(none)");
  lines.push("");
  lines.push("------ Submission metadata ------");
  lines.push(ptRow("Submitted at", fields.submittedAt));
  lines.push(ptRow("Reply-to email", fields.replyToEmail || "(none)"));
  lines.push(ptRow("IP address", fields.ip));
  lines.push("");
  lines.push("---");
  lines.push("Reply to this email to respond directly to the patient.");
  lines.push("Hamilton Care Dental Centre  ·  hamiltoncaredental.com");
  return lines.join("\n");
}

// Build the HTML version for nicer rendering in modern mail clients.
function buildHtml(fields) {
  const E = escapeHtml;
  const row = (label, value) =>
    `<tr><td style="padding:6px 14px 6px 0;color:#7a6b56;font-weight:600;white-space:nowrap;vertical-align:top">${E(label)}</td>` +
    `<td style="padding:6px 0;color:#2a2a2a;vertical-align:top">${E(value || "(not provided)")}</td></tr>`;

  const contactSection = fields.referral
    ? `
      <h3 style="font:600 14px/1.3 'Helvetica Neue',Arial,sans-serif;color:#7b6137;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.05em">Person referring</h3>
      <table style="border-collapse:collapse;font:14px/1.5 'Helvetica Neue',Arial,sans-serif;width:100%">
        ${row("Name", fields.name)}
        ${row("Phone", fields.phone)}
        ${row("Email", fields.email)}
      </table>
      <h3 style="font:600 14px/1.3 'Helvetica Neue',Arial,sans-serif;color:#7b6137;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.05em">Friend or family being referred</h3>
      <table style="border-collapse:collapse;font:14px/1.5 'Helvetica Neue',Arial,sans-serif;width:100%">
        ${row("Name", fields.referredName)}
        ${row("Phone or email", fields.referredContact)}
      </table>`
    : `
      <h3 style="font:600 14px/1.3 'Helvetica Neue',Arial,sans-serif;color:#7b6137;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.05em">Patient contact</h3>
      <table style="border-collapse:collapse;font:14px/1.5 'Helvetica Neue',Arial,sans-serif;width:100%">
        ${row("Full name", fields.name)}
        ${row("Phone", fields.phone)}
        ${row("Email", fields.email)}
      </table>
      <h3 style="font:600 14px/1.3 'Helvetica Neue',Arial,sans-serif;color:#7b6137;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.05em">Visit details</h3>
      <table style="border-collapse:collapse;font:14px/1.5 'Helvetica Neue',Arial,sans-serif;width:100%">
        ${row("Preferred date", fields.preferredDate)}
      </table>`;

  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f2ea;font-family:'Helvetica Neue',Arial,sans-serif;color:#2a2a2a">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:14px;padding:28px;border:1px solid #ead9b8">
    <p style="margin:0;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#a48756;font-weight:700">Hamilton Care Dental Centre</p>
    <h1 style="margin:6px 0 4px;font:700 22px/1.2 Georgia,serif;color:#2a2a2a">Appointment Request Submission</h1>
    <p style="margin:0 0 18px;color:#5a5045;font-size:14px">A new request was submitted from the website. Reply to this email to respond directly to the patient.</p>

    <h3 style="font:600 14px/1.3 'Helvetica Neue',Arial,sans-serif;color:#7b6137;margin:18px 0 8px;text-transform:uppercase;letter-spacing:.05em">Form</h3>
    <table style="border-collapse:collapse;font:14px/1.5 'Helvetica Neue',Arial,sans-serif;width:100%">
      ${row("Form type", fields.referral ? "Patient referral" : "Appointment request")}
      ${row("Submitted via", fields.sourceLabel)}
    </table>

    ${contactSection}

    <h3 style="font:600 14px/1.3 'Helvetica Neue',Arial,sans-serif;color:#7b6137;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.05em">Message / notes</h3>
    <div style="background:#f6f2ea;border-radius:8px;padding:12px 14px;font:14px/1.55 'Helvetica Neue',Arial,sans-serif;color:#2a2a2a;white-space:pre-wrap">${E(fields.notes || "(none)")}</div>

    <h3 style="font:600 14px/1.3 'Helvetica Neue',Arial,sans-serif;color:#7b6137;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.05em">Submission metadata</h3>
    <table style="border-collapse:collapse;font:13px/1.5 'Helvetica Neue',Arial,sans-serif;width:100%;color:#5a5045">
      ${row("Submitted at", fields.submittedAt)}
      ${row("Reply-to email", fields.replyToEmail || "(none)")}
      ${row("IP address", fields.ip)}
    </table>

    <hr style="border:0;border-top:1px solid #ead9b8;margin:22px 0 14px" />
    <p style="margin:0;color:#7a6b56;font-size:12px">Hamilton Care Dental Centre · hamiltoncaredental.com</p>
  </div>
</body></html>`;
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
