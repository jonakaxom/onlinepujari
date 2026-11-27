# Online Pujari (onlinepujari.in)
Static site for GitHub Pages + Firebase (free plan) for login and dashboards.

## Folder structure
```
index.html, 404.html, robots.txt, sitemap.xml   site root (generated)
pages/       about, contact, faqs, book, pandit-booking, privacy, terms, refund, festival calendar, glossary
pujas/       one page per puja (index.html = all pujas)
blog/        guides and festival articles (index.html = blog list)
locations/   pandit-in-<city> pages (index.html = all locations)
languages/   <language>-pandit pages
account/     login, customer dashboard, pandit dashboard, admin (Firebase)
assets/css/  style.css, dash.css
assets/js/   app.js (site), auth.js + login/account/pandit/admin modules, firebase-config.js
assets/data/ pujas.json (generated)
firebase/    firestore.rules  (paste into Firebase console)
docs/        FIREBASE-SETUP.md
tools/       build.py, build_accounts.py, blog_data.py, data/keywords.csv, data/coverage.csv
```

## Edit and rebuild
- Services, prices, phone, festivals: `tools/build.py`; blog articles: `tools/blog_data.py`
- Run `python3 tools/build.py` (public pages) and `python3 tools/build_accounts.py` (account pages), commit, push.
- Replace the WhatsApp number in `assets/js/app.js` and PHONE/EMAIL in `tools/build.py`.
- Login/dashboards: follow `docs/FIREBASE-SETUP.md`.
- Custom domain later: add a `CNAME` file containing the domain, set DNS A records, enable Enforce HTTPS.


## Account area
`account/login.html`, `dashboard.html` (customer), `pandit.html`, `admin.html` (approvals, bookings, users, audit log). Shared kit: `assets/js/ui.js`, styles `assets/css/dash.css`. Security headers: `vercel.json` / `_headers`. See `docs/FIREBASE-SETUP.md` and `docs/SECURITY.md`.

## Theme
Light mode is the default. The sun/moon button saves the choice in the visitor's browser (`assets/js/theme.js`). Tokens live in `assets/css/v2.css` (public) and `assets/css/dash.css` (accounts); dark overrides use `:root[data-theme="dark"]`.
