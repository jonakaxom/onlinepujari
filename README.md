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
