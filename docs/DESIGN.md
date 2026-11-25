# Design & SEO notes (derived from the UI/UX Pro Max rules)
**Palette:** dusk purple #2b1638, saffron #d9480f, gold #ffb703, leaf green #1c6b4a. Dark mode via prefers-color-scheme.
**Type:** Eczar (headings) + Mukta (body); Noto Sans per Indian script on the home language cards.
**Graphics:** SVG only (no emoji icons): diya logo with flicker, rotating mandala in hero (assets/img/mandala.svg), ornament divider, category/trust icons, torana border.
**UX:** skip link, visible focus rings, 44px touch targets, reduced-motion support, scroll reveal (JS progressive enhancement), floating WhatsApp + back-to-top, sticky mobile CTA, no-JS safe.
**SEO:** one H1 per page, unique title/description, canonical, Open Graph + Twitter card with 1200x630 image, BreadcrumbList on every inner page, ProfessionalService + FAQ + WebSite on home, Service+Offer on puja pages, Article on blog, sitemap with lastmod, robots (account area blocked), web manifest, apple-touch-icon, lang="en".
**To do yourself:** replace placeholder phone/WhatsApp/address, add real reviews to REVIEWS in tools/build.py (do not invent them), verify the site in Google Search Console, add a Google Business Profile, submit sitemap.xml.

## Art layer (v5)
- assets/img/: mandala.svg, lotus.svg, skyline.svg (temple silhouette on page headers), skyline-dusk.svg (above footer), favicon, og-image.
- Hero: row of flickering diyas, falling marigold petals (motion-safe only), rotating mandala.
- Emoji are decorative accents only (🙏 🪔 🛕 📍 🌼 ✦ via CSS with empty alt text so screen readers skip them); all functional icons stay SVG.

## SEO pass (v6)
Titles fitted to about 60 characters (brand suffix dropped only when too long), descriptions 90-160 chars, hreflang en-IN + x-default, og:type article on blog posts, 404 set to noindex, auto Service/ItemList/WebPage schema on every page type, Article image + language, Related pujas/reading + "Book by city" internal links on puja and blog pages, state links in the footer, llms.txt.
