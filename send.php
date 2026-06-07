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

/* =========================================================================
 * ANTI-SPAM LAYERS (no paid services / no API keys). Mirrors api/send.js.
 * Every bot rejection is a SILENT success redirect so bots get no feedback.
 * ========================================================================= */

function silent_ok() {
    header('Location: ' . SITE_URL . REDIRECT_OK);
    exit;
}

function hostname_of($value) {
    $s = strtolower(trim((string)$value));
    if ($s === '') return '';
    $s = preg_replace('#^[a-z][a-z0-9+.\-]*://#', '', $s); // strip scheme
    $s = explode('/', $s)[0];                              // strip path
    $parts = explode('@', $s); $s = end($parts);           // strip userinfo
    $s = preg_replace('/^\[(.*)\]$/', '$1', $s);           // IPv6 brackets
    $s = explode(':', $s)[0];                              // strip port
    return $s;
}

// Layer 1 — Origin/Referer: must come from one of our own pages.
function origin_allowed() {
    $origin  = $_SERVER['HTTP_ORIGIN']  ?? '';
    $referer = $_SERVER['HTTP_REFERER'] ?? '';
    $candidate = $origin !== '' ? hostname_of($origin)
               : ($referer !== '' ? hostname_of($referer) : '');
    // No Origin and no Referer at all: some privacy/in-app/proxy browsers strip
    // both. Favor real patients and let it through (other layers still apply).
    if ($candidate === '') return true;

    $allowed = [];
    foreach ([
        $_SERVER['HTTP_HOST'] ?? '',
        getenv('SITE_URL') ?: '',
        SITE_URL,
        'hamiltoncaredental.com',
        'www.hamiltoncaredental.com',
    ] as $h) {
        $x = hostname_of($h);
        if ($x !== '') $allowed[$x] = true;
    }
    if (isset($allowed[$candidate])) return true;
    if (substr($candidate, -11) === '.vercel.app') return true;
    return false;
}

// Layer 2 — Timing trap. Missing/old/future token is allowed (JS off / cached).
function timing_ok() {
    $raw = $_POST['_t'] ?? '';
    if (trim((string)$raw) === '') return true;
    if (!is_numeric($raw)) return true;
    $t = (float)$raw;            // JS Date.now() is epoch milliseconds
    if ($t <= 0) return true;
    $elapsed = (microtime(true) * 1000) - $t;
    if ($elapsed < 0) return true;
    return $elapsed >= 2500;
}

// Layer 4 — Content filtering.
// Explicit full URLs only (used for the message body).
function count_urls($s) {
    return preg_match_all('#(?:https?://|www\.)[^\s<>"\']+#i', (string)$s);
}
// Also catches bare domains (used only for the name field).
function count_domainish($s) {
    $re = '#(?:https?://|www\.)[^\s<>"\']+|\b[a-z0-9](?:[a-z0-9\-]*[a-z0-9])?\.(?:com|net|org|io|ru|info|biz|xyz|top|online|site|shop|club|vip|link|click|store|cn|co|live|icu|work|loan|men|win)\b#i';
    return preg_match_all($re, (string)$s);
}

function spam_reason($name, $notes, $extra) {
    if (preg_match('/[<>]/', $name)) return 'html-in-name';
    if (count_domainish($name) >= 1) return 'link-in-name';
    if (mb_strlen($name) > 120) return 'name-too-long';
    // 2+ FULL pasted URLs in the body (bare domain mentions are not counted).
    if (count_urls($notes) >= 2) return 'multiple-links';

    $hay = strtolower(trim($name . ' ' . $notes . ' ' . $extra));
    $categories = [
        ['/\bseo\b/', '/back ?links?/', '/search engine (?:ranking|optimi[sz])/', '/guest post/', '/link building/', '/domain authority/'],
        ['/digital marketing/', '/marketing (?:services|agency|proposal)/', '/increase (?:your )?(?:traffic|sales|leads|revenue)/', '/grow your (?:business|traffic|revenue)/', '/more (?:customers|clients|leads|traffic)/', '/lead generation/'],
        ['/\bcrypto(?:currency)?\b/', '/bitcoin/', '/\bforex\b/', '/\bnfts?\b/', '/investment opportunity/', '/trading (?:platform|bot|signals)/'],
        ['/viagra/', '/cialis/', '/\bpharmacy\b/', '/\bpills?\b/'],
        ['/click here/', '/limited[ \-]time offer/', '/\bact now\b/', '/100% free/', '/make money/', '/work from home/', '/\bgift card\b/'],
        ['/\bcasino\b/', '/payday loan/', '/\bgambling\b/'],
    ];
    $hits = 0;
    foreach ($categories as $cat) {
        foreach ($cat as $re) {
            if (preg_match($re, $hay)) { $hits++; break; }
        }
        if ($hits >= 2) return 'spam-phrases';
    }
    return '';
}

// Layer 3 — Honeypot: bots fill hidden fields humans never see.
if (!empty($_POST['website']) || !empty($_POST['url']) || !empty($_POST['_hp'])) {
    silent_ok();
}
// Layer 1 — Origin/Referer.
if (!origin_allowed()) {
    silent_ok();
}
// Layer 2 — Timing trap.
if (!timing_ok()) {
    silent_ok();
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
$referred_name    = safe_header($_POST['referred_name'] ?? '');
$referred_contact = safe_header($_POST['referred_contact'] ?? '');

// Minimal validation: name + email OR phone.
$has_contact = ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) || $phone !== '';
if ($name === '' || !$has_contact) {
    http_response_code(400);
    header('Location: ' . SITE_URL . '/contact-us/?error=missing-fields');
    exit;
}

// Layer 4 — Content filtering (drop silently). Runs after validation.
if (spam_reason($name, $notes, $referred_name . ' ' . $referred_contact) !== '') {
    silent_ok();
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
