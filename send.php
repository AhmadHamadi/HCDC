<?php
/**
 * Form handler for Hamilton Care Dental Centre.
 *
 * Receives appointment + referral form submissions and emails them to
 * office@hamiltoncaredental.com. Designed to run on cPanel with PHP 7.4+.
 *
 * SMTP (recommended for deliverability):
 *   1. Drop PHPMailer into /vendor/phpmailer/ via Composer or zip upload.
 *   2. Fill in the SMTP_* constants below with credentials from cPanel
 *      "Email Accounts" -> "Connect Devices" or your transactional provider.
 *   3. The block at "if (USE_SMTP)" below will then activate automatically.
 *
 * Native mail() fallback: works out-of-the-box on most cPanel hosts but
 * is less reliable than SMTP for inbox deliverability.
 */

/* =========================
 * CONFIG (UPDATE ON DEPLOY)
 * ========================= */
const TO_EMAIL    = 'office@hamiltoncaredental.com';
const TO_NAME     = 'Hamilton Care Dental Centre';
const FROM_EMAIL  = 'no-reply@hamiltoncaredental.ca';   // must be a mailbox on this domain
const FROM_NAME   = 'Hamilton Care Dental website';
const SITE_URL    = 'https://hamiltoncaredental.com';
const REDIRECT_OK = '/thank-you/';

// Flip to true once PHPMailer is installed and the SMTP_* values are set.
const USE_SMTP    = false;
const SMTP_HOST   = 'mail.hamiltoncaredental.ca';   // cPanel mail hostname
const SMTP_PORT   = 587;                             // 465 for SMTPS, 587 for TLS
const SMTP_SECURE = 'tls';                           // 'tls' or 'ssl'
const SMTP_USER   = 'no-reply@hamiltoncaredental.ca';
const SMTP_PASS   = 'REPLACE_ME_WITH_MAILBOX_PASSWORD';

/* =========================
 * REQUEST HANDLING
 * ========================= */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Location: ' . SITE_URL . '/contact-us/');
    exit;
}

// Honeypot: bots fill hidden fields humans never see. Silently accept then bail.
if (!empty($_POST['website']) || !empty($_POST['url']) || !empty($_POST['_hp'])) {
    header('Location: ' . SITE_URL . REDIRECT_OK);
    exit;
}

function clean($v) {
    return trim(filter_var((string)$v, FILTER_UNSAFE_RAW));
}
function safe_header($v) {
    return preg_replace("/[\r\n]+/", ' ', clean($v));
}

$name    = safe_header($_POST['name'] ?? '');
$email   = safe_header($_POST['email'] ?? '');
$phone   = safe_header($_POST['phone'] ?? '');
$reason  = safe_header($_POST['reason'] ?? '');
$notes   = clean($_POST['notes'] ?? '');
$source  = safe_header($_POST['_source'] ?? 'unknown');

// Minimal validation: name + email OR phone.
$has_contact = ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) || $phone !== '';
if ($name === '' || !$has_contact) {
    http_response_code(400);
    header('Location: ' . SITE_URL . '/contact-us/?error=missing-fields');
    exit;
}

/* =========================
 * BUILD EMAIL
 * ========================= */

$subject = 'New website enquiry from ' . $name;
$lines = [
    'A new enquiry was submitted from the Hamilton Care Dental Centre website.',
    '',
    'Name:    ' . $name,
    'Email:   ' . ($email !== '' ? $email : '(not provided)'),
    'Phone:   ' . ($phone !== '' ? $phone : '(not provided)'),
    'Reason:  ' . ($reason !== '' ? $reason : '(not provided)'),
    '',
    'Notes / message:',
    $notes !== '' ? $notes : '(none)',
    '',
    '-----',
    'Page:    ' . $source,
    'IP:      ' . ($_SERVER['REMOTE_ADDR'] ?? '?'),
    'When:    ' . date('Y-m-d H:i:s T'),
];
$body = implode("\n", $lines);

/* =========================
 * SEND
 * ========================= */

$sent = false;

if (USE_SMTP && file_exists(__DIR__ . '/vendor/autoload.php')) {
    require __DIR__ . '/vendor/autoload.php';
    try {
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = SMTP_SECURE;
        $mail->Port       = SMTP_PORT;
        $mail->setFrom(FROM_EMAIL, FROM_NAME);
        $mail->addAddress(TO_EMAIL, TO_NAME);
        if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $mail->addReplyTo($email, $name);
        }
        $mail->Subject = $subject;
        $mail->Body    = $body;
        $mail->send();
        $sent = true;
    } catch (Throwable $e) {
        // Fall through to mail() so submissions still arrive.
        error_log('SMTP send failed: ' . $e->getMessage());
    }
}

if (!$sent) {
    $headers  = "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $headers .= 'From: ' . FROM_NAME . ' <' . FROM_EMAIL . ">\r\n";
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $headers .= 'Reply-To: ' . $name . ' <' . $email . ">\r\n";
    }
    $headers .= "X-Mailer: HCDC-form/1.0\r\n";
    $sent = @mail(TO_EMAIL, $subject, $body, $headers, '-f' . FROM_EMAIL);
}

/* =========================
 * RESPOND
 * ========================= */

if (!$sent) {
    http_response_code(500);
    header('Location: ' . SITE_URL . '/contact-us/?error=send-failed');
    exit;
}

header('Location: ' . SITE_URL . REDIRECT_OK);
exit;
