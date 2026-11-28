# Generates account/login.html, dashboard.html, pandit.html, admin.html (run: python3 tools/build_accounts.py)
import os;os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))));os.makedirs("account",exist_ok=True)
CSP=("default-src 'self'; script-src 'self' https://www.gstatic.com https://apis.google.com https://www.google.com; "
 "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; "
 "img-src 'self' data: https://*.googleusercontent.com https://www.gstatic.com; "
 "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://www.google.com; "
 "frame-src https://accounts.google.com https://*.firebaseapp.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self'")
CSP=CSP
def page(fn,title,js):
    open("account/"+fn,"w",encoding="utf-8").write(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} | Online Pujari</title><meta name="robots" content="noindex,nofollow"><meta name="referrer" content="no-referrer">
<meta http-equiv="Content-Security-Policy" content="{CSP}"><meta name="theme-color" content="#fff7ec"><meta name="color-scheme" content="light dark"><script src="../assets/js/theme.js"></script>
<link rel="icon" type="image/svg+xml" href="../assets/img/favicon.svg">
<link rel="preconnect" href="https://www.gstatic.com" crossorigin><link rel="modulepreload" href="https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"><link rel="modulepreload" href="https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"><link rel="modulepreload" href="https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js"><link rel="modulepreload" href="../assets/js/firebase-config.js"><link rel="modulepreload" href="../assets/js/auth.js"><link rel="modulepreload" href="../assets/js/ui.js">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700&family=Eczar:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/dash.css"></head><body>
<div id="app"><p style="padding:40px;font-family:sans-serif">Loading…</p></div>
<noscript><p style="padding:24px;font-family:sans-serif">Please enable JavaScript to use your account.</p></noscript>
<script type="module" src="../assets/js/{js}.js"></script></body></html>''')
page("login.html","Login","login")
page("dashboard.html","My Account","customer")
page("pandit.html","Pandit Dashboard","pandit")
page("admin.html","Admin","admin")
