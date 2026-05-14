# Hamilton Care Dental Centre — Homepage

Static homepage recreation for **Hamilton Care Dental Centre** (`hamiltoncaredental.com`), optimized for desktop, mobile, conversions, search engines (Google, Bing), and AI answer engines (ChatGPT, Claude, Gemini, Perplexity).

**Live reference:** https://hamiltoncaredental.com/

---

## Folder Structure

```
HamiltonCareDentalCentre/
├── index.html               # Homepage
├── robots.txt               # Crawl rules + AI-bot allowlist
├── sitemap.xml              # All key URLs
├── llms.txt                 # AEO summary for LLMs/answer engines
├── humans.txt               # Team metadata
├── site.webmanifest         # PWA manifest
├── README.md                # This file
└── assets/
    ├── css/
    │   └── styles.css       # All page styles
    ├── js/
    │   └── main.js          # Nav, FAQ, form behaviour
    └── images/
        ├── team-photo.png   # Hero image (the team)
        ├── logo.png
        ├── favicon.png, webclip.png
        ├── checkup.jpeg, our-story.jpg, may-campaign.png
        ├── service-*.jpg|png  (6 service cards)
        ├── doctor-owner.png, doctor-associate.png, doctor-3.png
        ├── nitrous-sedation.jpg
        └── icons (telephone.png, location.png, email-icon.avif, …)
```

---

## What's on the page

1. **Top info bar** — address, email, phone, Facebook, Instagram
2. **Sticky header** — logo + nav + Book Appointment CTA
3. **Hero** — team photo + headline + CTAs + trust badges
4. **Action strip** — Call / Book quick buttons
5. **Appointment form** — name, phone, email, preferred date, notes
6. **May promo** — checkups, cleanings, CDCP care
7. **About / Welcome** — copy + 14+ years experience badge
8. **Why Choose Us** — 6 reason cards
9. **Services** — 6 service cards + "View All" link
10. **Our Doctors** — 3 dentist cards
11. **New Patients Welcome** — info + new-patient form + Beautiful Loan
12. **Nitrous Sedation** — new-service announcement
13. **Reviews** — 4.9★ summary + 3 testimonials
14. **Visit Us** — address, phone, email, hours + Google Map embed
15. **CTA banner** — strong closing call-to-action
16. **FAQ** — 7 questions (book, insurance, emergency, payment, frequency, location, sedation)
17. **Footer** — brand, links, services, contact, social, legal
18. **Sticky mobile CTA** — fixed call + book bar on mobile

---

## SEO + AEO features

### Technical SEO

- One canonical `<title>` and meta description per the original brand voice
- `<link rel="canonical">`, robots meta, geo meta, locale meta
- Open Graph + Twitter Card meta with absolute image URL
- Preconnect to Google Fonts; `fetchpriority="high"` + `preload` on the hero image (LCP)
- All images have explicit `width`, `height`, `alt` text, and `loading="lazy"` (except the hero, which is eager)
- Semantic landmarks: `<header>`, `<nav>`, `<main>` sections, `<footer>`
- One `<h1>`; consistent `<h2>` per section
- Internal links to every important service / page / contact

### Schema.org JSON-LD

- `Dentist` (LocalBusiness subtype) — full NAP, hours, geo, services catalog, sameAs, aggregateRating
- `WebSite`
- `BreadcrumbList`
- `FAQPage` — matches the visible FAQ section exactly (no hidden Q&A)

### AI search / answer-engine optimization (AEO)

- `llms.txt` at the site root with a clean, machine-readable summary
- Explicit allow rules in `robots.txt` for GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, Bingbot, Applebot, CCBot
- Concise "answer block" paragraphs (FAQs, location, hours, services) that AI engines can quote directly
- Entity-rich naming: business name + city + neighbourhood mentioned consistently
- Real testimonial quotes attributed to named reviewers
- Original team photo as hero (unique entity asset)

### Local SEO

- NAP consistency: same address, phone, email in the topbar, contact section, footer, schema, and `llms.txt`
- Service-area schema (Hamilton + Mountain, Upper Ottawa, Stoney Creek, Ancaster, Dundas)
- Embedded Google Map for the exact location
- Geo meta tags (`geo.region`, `geo.position`, `ICBM`)
- Local keywords woven naturally: "Hamilton dentist near me", "Hamilton family dentist", "Hamilton Mountain", "Upper Ottawa", "dental checkup or teeth cleaning in Hamilton"

### Conversion + UX

- Phone + Book CTAs above the fold and repeated throughout (top bar, hero, action strip, about, doctors, CTA banner, footer, sticky mobile bar)
- Trust badges: 4.9★ rating, 89+ reviews, CDCP, 14+ years
- `tel:` and `mailto:` links everywhere a number/email appears
- Sticky mobile action bar (Call + Book)
- Appointment form with proper input types, autocomplete, and confirmation note

### Core Web Vitals friendliness

- Single CSS file, single small JS file, both async/deferred where appropriate
- Hero image preloaded; everything else lazy-loaded
- No layout shift: explicit `width` / `height` on every `<img>`
- System-font fallbacks while Google Fonts load
- `prefers-reduced-motion` respected

### Accessibility

- ARIA labels on landmarks, social links, the burger menu, and the map iframe
- Visible focus states from native browser defaults preserved
- Color contrast: gold (`#a48756`) on white passes AA for large text; dark ink on cream passes AAA for body text
- Keyboard-operable nav (services menu opens on hover **and** focus)

---

## Customizing the page

| What you want to change | Where |
|---|---|
| Brand colors | CSS custom properties in `assets/css/styles.css` `:root` |
| Phone or address | Search/replace `(289) 755-2568` and `969 Upper Ottawa St`. Update **all four** locations: topbar, visit section, footer, JSON-LD schema |
| Add/remove a service card | `<section class="services">` in `index.html` |
| Edit FAQ | `<section class="faq">` **and** the `FAQPage` JSON-LD — keep them in sync |
| Replace hero image | Drop new file in `assets/images/`, update `src` in the `<section class="hero">` AND the `<meta property="og:image">` tag |
| Change form endpoint | `<form id="appointment-form" action="…">` in `index.html` |

---

## Deployment

Static site — drop the folder onto any host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3, or a traditional web host).

After deploying:

1. Submit the sitemap in Google Search Console and Bing Webmaster Tools.
2. Verify rendered HTML titles, descriptions, and schema with:
   - Google Rich Results Test: https://search.google.com/test/rich-results
   - Schema.org validator: https://validator.schema.org/
3. Test mobile responsiveness in Chrome DevTools (iPhone SE, iPhone 14 Pro, Pixel 7, iPad).
4. Audit Core Web Vitals: https://pagespeed.web.dev/

---

## Important note: NAP consistency

The original site contained an inconsistency — the schema/JSON-LD referenced **Hamilton City Dental** with a different address (182 Jackson St E). This rebuild standardizes to the **correct, consistently-stated** business identity: **Hamilton Care Dental Centre, 969 Upper Ottawa St 11 A, Hamilton ON L8T 4V9, (289) 755-2568, office@hamiltoncaredental.ca**. Verify against the Google Business Profile before deploying live.
