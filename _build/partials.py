"""Shared HTML partials and renderers for Hamilton Care Dental Centre site build."""

BUSINESS = {
 "name": "Hamilton Care Dental Centre",
 "phone_display": "(289) 755-2568",
 "phone_tel": "+12897552568",
 "email": "office@hamiltoncaredental.ca",
 "address_line": "969 Upper Ottawa St, 11 A",
 "city": "Hamilton",
 "region": "ON",
 "postal": "L8T 4V9",
 "country": "CA",
 "lat": 43.2153,
 "lng": -79.8265,
 "site": "https://hamiltoncaredental.com",
 "founded": "2012",
 "rating": "4.9",
 "review_count": "89",
 "facebook": "https://www.facebook.com/HamiltonCareDentalCentre",
 "instagram": "https://www.instagram.com/HamiltonCareDentalCentre",
}

ADDRESS_FULL = f"{BUSINESS['address_line']}, {BUSINESS['city']}, {BUSINESS['region']} {BUSINESS['postal']}"

NAV_LINKS = [
 ("/", "Home"),
 ("/about-us/", "About"),
 ("/our-story/", "Our Story"),
 ("/services/", "Services"),
 ("/new-patients/", "New Patients"),
 ("/payment-plans/", "Payment Plans"),
 ("/faq/", "FAQ"),
 ("/blog/", "Blog"),
]

SERVICES_NAV = [
 ("nitrous-sedation", "Nitrous Sedation"),
 ("suresmile-clear-aligners", "SureSmile Clear Aligners"),
 ("dental-implants", "Dental Implants"),
 ("oral-surgery", "Oral Surgery"),
 ("cosmetic-dentistry", "Cosmetic Dentistry"),
 ("restorative-dentistry", "Restorative Dentistry"),
 ("endodontics", "Endodontics"),
 ("preventative-dentistry", "Preventative Dentistry"),
 ("miscellaneous", "Additional Services"),
]

# SVG icons (correct path data, keep these intact)
SVG_PIN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>'
SVG_MAIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 0.9-2 2v12c0 1.1 0.9 2 2 2h16c1.1 0 2-0.9 2-2V6c0-1.1-0.9-2-2-2zm0 4l-8 5L4 8V6l8 5 8-5v2z"/></svg>'
SVG_PHONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c0.3-0.3 0.7-0.4 1.1-0.3 1.2 0.4 2.4 0.6 3.7 0.6 0.6 0 1 0.4 1 1V20c0 0.6-0.4 1-1 1-9.4 0-17-7.6-17-17 0-0.6 0.4-1 1-1h3.5c0.6 0 1 0.4 1 1 0 1.3 0.2 2.5 0.6 3.7 0.1 0.4 0 0.8-0.3 1.1l-2.4 2z"/></svg>'
SVG_CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.6L11 13.3V7h2v5.3l4.5 2.7-1.3 1.6z"/></svg>'
SVG_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19.2 20 8.2l-1.5-1.5z"/></svg>'
SVG_FB = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.7c0-2.4 1.4-3.7 3.6-3.7 1 0 2 0.2 2 0.2v2.3h-1.2c-1.2 0-1.6 0.7-1.6 1.5V12h2.7l-0.4 3h-2.3v7A10 10 0 0 0 22 12z"/></svg>'
SVG_IG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8 0.1 1.2 0.1 1.8 0.2 2.2 0.4 0.6 0.2 1 0.5 1.5 1 0.5 0.5 0.7 0.9 1 1.5 0.2 0.4 0.4 1 0.4 2.2 0.1 1.3 0.1 1.6 0.1 4.8s0 3.6-0.1 4.8c-0.1 1.2-0.2 1.8-0.4 2.2-0.2 0.6-0.5 1-1 1.5-0.5 0.5-0.9 0.7-1.5 1-0.4 0.2-1 0.4-2.2 0.4-1.3 0.1-1.6 0.1-4.8 0.1s-3.6 0-4.8-0.1c-1.2-0.1-1.8-0.2-2.2-0.4-0.6-0.2-1-0.5-1.5-1-0.5-0.5-0.7-0.9-1-1.5-0.2-0.4-0.4-1-0.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6 0.1-4.8c0.1-1.2 0.2-1.8 0.4-2.2 0.2-0.6 0.5-1 1-1.5 0.5-0.5 0.9-0.7 1.5-1 0.4-0.2 1-0.4 2.2-0.4C8.4 2.2 8.8 2.2 12 2.2zm0 3.4a6.4 6.4 0 1 0 0 12.8 6.4 6.4 0 0 0 0-12.8zm0 10.6a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4zm6.5-10.9a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/></svg>'


def render_head(*, title, description, canonical, og_image=None, extra_schemas=None, robots="index,follow,max-image-preview:large,max-snippet:-1"):
 og = og_image or f"{BUSINESS['site']}/assets/images/team-photo.png"
 schemas_html = "\n".join(extra_schemas or [])
 return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#a48756" />
<title>{title}</title>
<meta name="description" content="{description}" />
<link rel="canonical" href="{canonical}" />
<meta name="robots" content="{robots}" />
<meta name="author" content="{BUSINESS['name']}" />
<meta name="geo.region" content="CA-ON" />
<meta name="geo.placename" content="Hamilton, Ontario" />
<meta name="geo.position" content="{BUSINESS['lat']};{BUSINESS['lng']}" />
<meta name="ICBM" content="{BUSINESS['lat']}, {BUSINESS['lng']}" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="{BUSINESS['name']}" />
<meta property="og:title" content="{title}" />
<meta property="og:description" content="{description}" />
<meta property="og:url" content="{canonical}" />
<meta property="og:image" content="{og}" />
<meta property="og:locale" content="en_CA" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{title}" />
<meta name="twitter:description" content="{description}" />
<meta name="twitter:image" content="{og}" />
<link rel="icon" type="image/png" href="/assets/images/favicon.png" />
<link rel="apple-touch-icon" href="/assets/images/webclip.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="alternate" type="text/plain" title="LLM-friendly site summary" href="/llms.txt" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Montserrat:wght@500;600;700&family=PT+Serif:wght@700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/assets/css/styles.css" />
{schemas_html}
</head>
<body>"""


def render_topbar():
 return f"""
<div class="topbar" role="region" aria-label="Contact information">
 <div class="topbar-inner">
 <span class="topbar-item">{SVG_PIN}{ADDRESS_FULL}</span>
 <span class="topbar-item desktop-only">{SVG_MAIL}<a href="mailto:{BUSINESS['email']}">{BUSINESS['email']}</a></span>
 <span class="topbar-item">{SVG_PHONE}<a href="tel:{BUSINESS['phone_tel']}">{BUSINESS['phone_display']}</a></span>
 <span class="topbar-spacer"></span>
 <span class="topbar-social">
 <a href="{BUSINESS['facebook']}" target="_blank" rel="noopener" aria-label="Facebook">{SVG_FB}</a>
 <a href="{BUSINESS['instagram']}" target="_blank" rel="noopener" aria-label="Instagram">{SVG_IG}</a>
 </span>
 </div>
</div>
"""


def render_header(active=""):
 services_dropdown = "\n".join(
 f' <a href="/services/{slug}/">{name}</a>'
 for slug, name in SERVICES_NAV
 )
 # Flat comprehension: each NAV_LINKS entry becomes either a Services dropdown or a plain link (lint-safe — no nested if/else block)
 _svc_cls = "nav-services is-active" if active.startswith("/services/") else "nav-services"
 _svc_dropdown_html = f'      <div class="{_svc_cls}"><a href="/services/">Services</a><div class="nav-services-menu" role="menu">\n{services_dropdown}\n        </div></div>'
 nav_html_parts = [
 _svc_dropdown_html if label == "Services"
 else f'      <a href="{href}"' + (' class="active"' if active == href else '') + f'>{label}</a>'
 for href, label in NAV_LINKS
 ]
 nav_items = "\n".join(nav_html_parts)
 return f"""
<header class="header" role="banner">
 <div class="header-inner">
 <a href="/" class="logo" aria-label="{BUSINESS['name']} Home">
 <img src="/assets/images/logo.png" alt="{BUSINESS['name']} logo" width="220" height="56" />
 </a>
 <button class="nav-burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">
 <span></span><span></span><span></span>
 </button>
 <nav class="nav" id="primary-nav" role="navigation" aria-label="Primary">
{nav_items}
 </nav>
 <a href="/contact-us/" class="btn btn-primary">Book Appointment</a>
 </div>
</header>
"""


def render_footer():
 pop_services = [
 ("dental-implants", "Dental Implants"),
 ("suresmile-clear-aligners", "SureSmile Aligners"),
 ("cosmetic-dentistry", "Cosmetic Dentistry"),
 ("oral-surgery", "Oral Surgery / Wisdom Teeth"),
 ("nitrous-sedation", "Nitrous Sedation"),
 ("preventative-dentistry", "Cleanings & Checkups"),
 ("endodontics", "Root Canals"),
 ]
 pop_links = "\n".join(f' <li><a href="/services/{s}/">{n}</a></li>' for s, n in pop_services)
 return f"""
<footer class="footer" role="contentinfo">
 <div class="container">

 <div class="footer-seo-block">
 <h2 class="footer-seo-h">Trusted Family Dentist on Hamilton Mountain</h2>
 <p>{BUSINESS['name']} has been caring for Hamilton families since {BUSINESS['founded']}. We're a full-service dental clinic on Upper Ottawa Street offering cleanings, checkups, dental implants, Invisalign, SureSmile clear aligners, professional whitening, crowns and bridges, root canals, oral surgery and wisdom teeth removal, dentures, nitrous oxide sedation, and same-day emergency care. We accept the Canadian Dental Care Plan (CDCP), bill insurance directly, and offer Beautifi financing including 0% options.</p>
 <p>Serving Hamilton Mountain, Upper Ottawa, Stoney Creek, Ancaster, Dundas, Binbrook, and Waterdown. New patients always welcome.</p>
 </div>

 <div class="footer-grid">
 <div class="footer-brand">
 <img src="/assets/images/logo.png" alt="{BUSINESS['name']}" />
 <p>Family-friendly dental care since {BUSINESS['founded']}. Three dentists, modern equipment, and a friendly team.</p>
 <p class="footer-rating"><strong><svg viewBox="0 0 24 24" aria-hidden="true" class="icon-star"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg><svg viewBox="0 0 24 24" aria-hidden="true" class="icon-star"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg><svg viewBox="0 0 24 24" aria-hidden="true" class="icon-star"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg><svg viewBox="0 0 24 24" aria-hidden="true" class="icon-star"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg><svg viewBox="0 0 24 24" aria-hidden="true" class="icon-star"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z"/></svg></strong> {BUSINESS['rating']} from {BUSINESS['review_count']}+ Google reviews</p>
 <div class="footer-social">
 <a href="{BUSINESS['facebook']}" target="_blank" rel="noopener" aria-label="Facebook">{SVG_FB}</a>
 <a href="{BUSINESS['instagram']}" target="_blank" rel="noopener" aria-label="Instagram">{SVG_IG}</a>
 </div>
 </div>

 <div>
 <h4>Quick Links</h4>
 <ul>
 <li><a href="/">Home</a></li>
 <li><a href="/about-us/">About Us</a></li>
 <li><a href="/our-story/">Our Story</a></li>
 <li><a href="/services/">All Services</a></li>
 <li><a href="/new-patients/">New Patients</a></li>
 <li><a href="/emergency-dentist-hamilton/">Emergency Dentist Hamilton</a></li>
 <li><a href="/teeth-whitening-hamilton/">Teeth Whitening Hamilton</a></li>
 <li><a href="/dentist-hamilton-mountain/">Dentist on Hamilton Mountain</a></li>
 <li><a href="/payment-plans/">Payment Plans</a></li>
 <li><a href="/dental-insurance/">Dental Insurance &amp; CDCP</a></li>
 <li><a href="/canadian-care-dental-plan/">CDCP</a></li>
 <li><a href="/faq/">FAQ</a></li>
 <li><a href="/referral-form/">Refer a Patient</a></li>
 <li><a href="/blog/">Blog</a></li>
 <li><a href="/contact-us/">Contact / Book</a></li>
 </ul>
 </div>

 <div>
 <h4>Popular Services</h4>
 <ul>
{pop_links}
 </ul>
 </div>

 <div>
 <h4>Visit Us in Hamilton</h4>
 <div class="footer-contact-item">{SVG_PIN}<span>{BUSINESS['address_line']}<br />{BUSINESS['city']}, {BUSINESS['region']} {BUSINESS['postal']}</span></div>
 <div class="footer-contact-item">{SVG_PHONE}<a href="tel:{BUSINESS['phone_tel']}">{BUSINESS['phone_display']}</a></div>
 <div class="footer-contact-item">{SVG_MAIL}<a href="mailto:{BUSINESS['email']}">{BUSINESS['email']}</a></div>
 <table class="footer-hours" aria-label="Office hours">
 <tr><th scope="row">Mon</th><td>9:00 AM – 5:00 PM</td></tr>
 <tr><th scope="row">Tue</th><td>9:00 AM – 5:00 PM</td></tr>
 <tr><th scope="row">Wed</th><td>9:00 AM – 5:00 PM</td></tr>
 <tr><th scope="row">Thu</th><td>9:00 AM – 4:00 PM</td></tr>
 <tr><th scope="row">Fri</th><td>9:00 AM – 3:00 PM</td></tr>
 <tr><th scope="row">Sat</th><td>9:00 AM – 3:00 PM (by appointment only)</td></tr>
 <tr><th scope="row">Sun</th><td>Closed</td></tr>
 </table>
 <p class="footer-cta-line"><a href="/contact-us/" class="btn btn-primary btn-sm">Book Appointment</a></p>
 </div>
 </div>

 <div class="footer-keywords" aria-hidden="true">
 Dentist Hamilton ON · Hamilton Mountain dentist · Upper Ottawa dentist · Family dentist Hamilton · Emergency dentist Hamilton · Same-day dentist Hamilton · CDCP dentist Hamilton · Dental implants Hamilton · Invisalign Hamilton · SureSmile Hamilton · Teeth whitening Hamilton · Zoom whitening Hamilton · Cosmetic dentist Hamilton · Wisdom teeth removal Hamilton · Root canal Hamilton · Dentures Hamilton · Kids dentist Hamilton
 </div>

 <div class="footer-bottom">
 <p style="margin:0">&copy; <span id="year">2026</span> {BUSINESS['name']}. Caring for Hamilton smiles since {BUSINESS['founded']}.</p>
 <div class="footer-bottom-links">
 <a href="/privacy-policy/">Privacy Policy</a>
 <a href="/sitemap.xml">Sitemap</a>
 <a href="/llms.txt">llms.txt</a>
 </div>
 </div>
 </div>
</footer>

<div class="mobile-cta" role="region" aria-label="Quick contact">
 <a href="tel:{BUSINESS['phone_tel']}" class="btn btn-ink">Call Us</a>
 <a href="/contact-us/" class="btn btn-primary">Book Appointment</a>
</div>

<script src="/assets/js/main.js" defer></script>
<script>document.getElementById('year').textContent = new Date().getFullYear();</script>

</body>
</html>
"""


def render_inner_hero(*, eyebrow, title, lead, hero_image, breadcrumbs=None, page_slug=None):
 # Flat comprehension instead of nested if/for (lint-safe)
 _crumb_parts = [(f'<a href="{href}">{name}</a>' if href else f'<span>{name}</span>') for name, href in (breadcrumbs or [])]
 crumbs_html = ('<nav class="crumbs" aria-label="Breadcrumb">' + ' <span aria-hidden="true">›</span> '.join(_crumb_parts) + '</nav>') if breadcrumbs else ""
 dp = f' data-page="{page_slug}"' if page_slug else ''
 _bg_alt = f"{title} at {BUSINESS['name']} in Hamilton, Ontario"
 return f"""
<main id="main">
<section class="inner-hero"{dp} aria-label="{title}">
 <div class="inner-hero-bg">
 <img src="{hero_image}" alt="{_bg_alt}" loading="eager" fetchpriority="high" />
 </div>
 <div class="container">
 <div class="inner-hero-content">
 {crumbs_html}
 <span class="hero-eyebrow">{eyebrow}</span>
 <h1>{title}</h1>
 <p class="lead">{lead}</p>
 <div class="hero-actions">
 <a href="/contact-us/" class="btn btn-primary">Book Appointment</a>
 <a href="tel:{BUSINESS['phone_tel']}" class="btn btn-outline">Call {BUSINESS['phone_display']}</a>
 </div>
 </div>
 </div>
</section>
"""


def render_explore_more(*, exclude_service=None):
 """Internal-linking block: surfaces all services + key pages on every page that uses it.
 Boosts crawl depth, anchor-text variety, and authority distribution for SEO + AI search."""
 service_items = "\n".join(
 f' <li><a href="/services/{slug}/">{name} in Hamilton</a></li>'
 for slug, name in SERVICES_NAV if slug != exclude_service
 )
 return f"""
<section class="explore-more" aria-labelledby="explore-title">
 <div class="container">
 <span class="eyebrow" style="display:block; text-align:center; color:var(--gold); font-family:var(--font-head); letter-spacing:.14em; text-transform:uppercase; font-size:.78rem; margin-bottom:.6rem;">Explore the Practice</span>
 <h2 id="explore-title">More from {BUSINESS['name']}</h2>
 <p class="section-sub">Whatever you came here for, here's a quick path to everything else.</p>
 <div class="explore-grid">
 <div class="explore-col">
 <h3>Dental Services in Hamilton</h3>
 <ul>
{service_items}
 <li><a href="/services/">All Dental Services</a></li>
 </ul>
 </div>
 <div class="explore-col">
 <h3>About the Practice</h3>
 <ul>
 <li><a href="/about-us/">About Hamilton Care Dental</a></li>
 <li><a href="/our-story/">Our Story (since 2012)</a></li>
 <li><a href="/team/dr-fadi-dawood/">Dr. Fadi Dawood, Owner</a></li>
 <li><a href="/team/dr-bassam-petros/">Dr. Bassam Petros, Dentist</a></li>
 <li><a href="/team/dr-peter-markho/">Dr. Peter Markho, Associate Dentist</a></li>
 <li><a href="/faq/">Dental FAQ</a></li>
 <li><a href="/blog/">Hamilton Dental Blog</a></li>
 </ul>
 </div>
 <div class="explore-col">
 <h3>Payment, Booking &amp; Contact</h3>
 <ul>
 <li><a href="/payment-plans/">Payment Plans &amp; Beautifi Financing</a></li>
 <li><a href="/canadian-care-dental-plan/">Canadian Dental Care Plan (CDCP)</a></li>
 <li><a href="/referral-form/">Refer a Friend or Family Member</a></li>
 <li><a href="/contact-us/">Contact &amp; Booking</a></li>
 <li><a href="tel:{BUSINESS['phone_tel']}">Call {BUSINESS['phone_display']}</a></li>
 </ul>
 </div>
 </div>
 </div>
</section>
"""




def render_related(*, heading="You might also like", links=None):
 """Compact contextual Related strip: 3-4 hand-picked links per page."""
 links = links or []
 _nl = chr(10)
 items = _nl.join(f'      <li><a href="{href}"><span class="related-strip-label">{lbl}</span><span class="related-strip-desc">{desc}</span></a></li>' for href, lbl, desc in links)
 if not items: return ""
 return f'<section class="related-strip" aria-labelledby="related-title"><div class="container"><h2 id="related-title">{heading}</h2><ul class="related-strip-grid">{_nl}{items}{_nl}</ul></div></section>'


def render_cta_banner(headline="Ready for Your Best Smile?", sub="Modern, gentle dental care in Hamilton. Book a visit and we'll take care of the rest."):
 return f"""
<section class="cta-banner" aria-labelledby="cta-end">
 <div class="container">
 <span class="eyebrow" style="color:var(--gold)">Transform Your Smile Today</span>
 <h2 id="cta-end">{headline}</h2>
 <p>{sub}</p>
 <div class="cta-banner-actions">
 <a href="/contact-us/" class="btn btn-primary">Book Appointment</a>
 <a href="tel:{BUSINESS['phone_tel']}" class="btn btn-outline">Call {BUSINESS['phone_display']}</a>
 </div>
 <div class="badges">
 <span>{SVG_CHECK}Same-day appointments</span>
 <span>{SVG_CHECK}CDCP accepted</span>
 <span>{SVG_CHECK}Direct insurance billing</span>
 </div>
 </div>
</section>
</main>
"""


# ------------- Schema helpers -------------

def schema_breadcrumb(items):
 import json
 elems = [
 {"@type": "ListItem", "position": i + 1, "name": n, "item": u}
 for i, (n, u) in enumerate(items)
 ]
 data = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": elems}
 return f'<script type="application/ld+json">{json.dumps(data)}</script>'


def schema_localbusiness_ref():
 import json
 return '<script type="application/ld+json">' + json.dumps({
 "@context": "https://schema.org",
 "@type": "Dentist",
 "@id": f"{BUSINESS['site']}/#dentist",
 "name": BUSINESS["name"],
 "alternateName": "Hamilton Care Dental",
 "url": BUSINESS["site"] + "/",
 "telephone": "+1-289-755-2568",
 "email": BUSINESS["email"],
 "image": f"{BUSINESS['site']}/assets/images/team-photo.png",
 "logo": f"{BUSINESS['site']}/assets/images/logo.png",
 "priceRange": "$$",
 "description": (
  "Family and emergency dentist on Hamilton Mountain serving Hamilton, Stoney Creek, "
  "Ancaster, Dundas, Binbrook and Waterdown since 2012. CDCP-accepting. Beautifi 0% financing. "
  "Dental implants, Invisalign, SureSmile, crowns, veneers, root canals, wisdom teeth, "
  "dentures, teeth whitening, nitrous sedation, and emergency dental care."
 ),
 "slogan": "Caring for Hamilton smiles since 2012",
 "foundingDate": BUSINESS["founded"],
 "address": {
 "@type": "PostalAddress",
 "streetAddress": BUSINESS["address_line"],
 "addressLocality": BUSINESS["city"],
 "addressRegion": BUSINESS["region"],
 "postalCode": BUSINESS["postal"],
 "addressCountry": BUSINESS["country"],
 },
 "geo": {"@type": "GeoCoordinates", "latitude": BUSINESS["lat"], "longitude": BUSINESS["lng"]},
 "openingHoursSpecification": [
 {"@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday"], "opens": "09:00", "closes": "17:00"},
 {"@type": "OpeningHoursSpecification", "dayOfWeek": "Thursday", "opens": "09:00", "closes": "16:00"},
 {"@type": "OpeningHoursSpecification", "dayOfWeek": "Friday", "opens": "09:00", "closes": "15:00"},
 {"@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "15:00", "description": "By appointment only"},
 ],
 "sameAs": [BUSINESS["facebook"], BUSINESS["instagram"]],
 "aggregateRating": {"@type": "AggregateRating", "ratingValue": BUSINESS["rating"], "reviewCount": BUSINESS["review_count"], "bestRating": "5", "worstRating": "1"},
 "areaServed": [
 {"@type": "City", "name": "Hamilton"},
 {"@type": "Place", "name": "Hamilton Mountain"},
 {"@type": "Place", "name": "Upper Ottawa"},
 {"@type": "Place", "name": "Stoney Creek"},
 {"@type": "Place", "name": "Ancaster"},
 {"@type": "Place", "name": "Dundas"},
 {"@type": "Place", "name": "Binbrook"},
 {"@type": "Place", "name": "Glanbrook"},
 {"@type": "Place", "name": "Mount Hope"},
 {"@type": "Place", "name": "Waterdown"},
 {"@type": "Place", "name": "Flamborough"},
 ],
 "paymentAccepted": ["Cash", "Debit", "Visa", "Mastercard", "American Express", "E-transfer", "Insurance", "CDCP", "Beautifi financing"],
 "currenciesAccepted": "CAD",
 "isAcceptingNewPatients": True,
 "publicAccess": True,
 "knowsLanguage": ["en", "ar"],
 "availableLanguage": [
 {"@type": "Language", "name": "English", "alternateName": "en"},
 {"@type": "Language", "name": "Arabic", "alternateName": "ar"},
 ],
 "medicalSpecialty": ["Dentistry"],
 "hasCredential": [
 {"@type": "EducationalOccupationalCredential", "credentialCategory": "license",
 "recognizedBy": {"@type": "Organization", "name": "Royal College of Dental Surgeons of Ontario"}},
 ],
 "memberOf": [
 {"@type": "Organization", "name": "Ontario Dental Association"},
 {"@type": "Organization", "name": "Canadian Dental Association"},
 ],
 "hasOfferCatalog": {
 "@type": "OfferCatalog",
 "name": "Dental services at Hamilton Care Dental Centre",
 "itemListElement": [
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Dental Implants"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "All-on-4 Dental Implants"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Invisalign Clear Aligners"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "SureSmile Clear Aligners"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Porcelain Veneers"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Dental Crowns and Bridges"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Composite White Fillings"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Root Canal Therapy"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Wisdom Teeth Removal"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Oral Surgery"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Full and Partial Dentures"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Zoom Teeth Whitening"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Take-Home Teeth Whitening"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Dental Cleanings and Checkups"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Pediatric Dentistry"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "TMJ Treatment"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Sleep Apnea Oral Appliance"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Night Guards for Bruxism"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Athletic Mouthguards"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Nitrous Oxide Sedation"}},
 {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Emergency Dental Care"}},
 ],
 },
 }) + '</script>'


def schema_service(name, description, slug):
 import json
 return '<script type="application/ld+json">' + json.dumps({
 "@context": "https://schema.org",
 "@type": "MedicalProcedure",
 "@id": f"{BUSINESS['site']}/services/{slug}/#procedure",
 "name": name,
 "description": description,
 "url": f"{BUSINESS['site']}/services/{slug}/",
 "performer": {"@id": f"{BUSINESS['site']}/#dentist"},
 "category": "Dentistry",
 "procedureType": {"@type": "MedicalProcedureType", "name": "Dental"},
 "audience": [
 {"@type": "MedicalAudience", "audienceType": "Adult"},
 {"@type": "MedicalAudience", "audienceType": "Senior"},
 ],
 }) + '</script>'


def schema_subprocedures(sub_services, parent_slug):
 """Mark up each sub-service (Porcelain Veneers, Crown Lengthening, etc.) as its own
 MedicalProcedure tied to the parent service URL via a hash anchor. Makes individual
 procedures discoverable as named entities in AI search / structured-data answers."""
 import json
 if not sub_services:
  return ""
 anchor = lambda s: s.lower().replace(" ", "-").replace("&", "and").replace("(", "").replace(")", "").replace(",", "")
 items = [
  {
  "@context": "https://schema.org",
  "@type": "MedicalProcedure",
  "name": s,
  "url": f"{BUSINESS['site']}/services/{parent_slug}/#{anchor(s)}",
  "performer": {"@id": f"{BUSINESS['site']}/#dentist"},
  "category": "Dentistry",
  "procedureType": {"@type": "MedicalProcedureType", "name": "Dental"},
  }
  for s in sub_services
 ]
 return "\n".join('<script type="application/ld+json">' + json.dumps(it) + '</script>' for it in items)


def schema_faq(faqs):
 import json
 return '<script type="application/ld+json">' + json.dumps({
 "@context": "https://schema.org",
 "@type": "FAQPage",
 "mainEntity": [
 {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
 for q, a in faqs
 ]
 }) + '</script>'


def schema_person(name, role, bio, url, image):
 import json
 return '<script type="application/ld+json">' + json.dumps({
 "@context": "https://schema.org",
 "@type": "Person",
 "name": name,
 "jobTitle": role,
 "description": bio,
 "url": url,
 "image": image,
 "worksFor": {"@id": f"{BUSINESS['site']}/#dentist"},
 }) + '</script>'


def schema_article(headline, description, image, url, date_published, keywords):
 import json
 return '<script type="application/ld+json">' + json.dumps({
 "@context": "https://schema.org",
 "@type": "Article",
 "headline": headline,
 "description": description,
 "image": image,
 "datePublished": date_published,
 "dateModified": date_published,
 "author": {"@type": "Organization", "name": BUSINESS["name"], "url": BUSINESS["site"]},
 "publisher": {"@id": f"{BUSINESS['site']}/#dentist"},
 "mainEntityOfPage": url,
 "keywords": keywords,
 }) + '</script>'


def schema_speakable():
 """Speakable for AI voice/answer engines, highlight FAQ section."""
 import json
 return '<script type="application/ld+json">' + json.dumps({
 "@context": "https://schema.org",
 "@type": "WebPage",
 "speakable": {
 "@type": "SpeakableSpecification",
 "cssSelector": [".inner-hero-content h1", ".inner-hero-content .lead", ".faq-list summary", ".faq-body p"]
 }
 }) + '</script>'


def render_faq_section(faqs, *, intro=None):
 intro_html = f'<p class="section-sub">{intro}</p>' if intro else ""
 items = "\n".join(
 f""" <details class="faq-item">
 <summary>{q}</summary>
 <div class="faq-body"><p>{a}</p></div>
 </details>"""
 for q, a in faqs
 )
 return f"""
<section class="faq" aria-labelledby="faq-title">
 <div class="container">
 <span class="eyebrow" style="display:block; text-align:center">FAQs</span>
 <h2 id="faq-title" class="section-title">Frequently Asked Questions</h2>
 {intro_html}
 <div class="faq-list">
{items}
 </div>
 </div>
</section>
"""
