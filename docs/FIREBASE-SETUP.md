# Login + dashboards: setup (all on the free Spark plan)

## 1. Firebase project
1. https://console.firebase.google.com > Add project (decline Analytics). Do NOT upgrade to Blaze.
2. Build > Authentication > Get started > Sign-in method > enable **Google**.
3. Authentication > Settings > **Authorized domains**: add `<username>.github.io` (and `onlinepujari.in` after you buy it).
4. Build > Firestore Database > Create database > production mode > region `asia-south1` (Mumbai).
5. Firestore > **Rules** tab > paste the whole file `firebase/firestore.rules` > Publish.
6. Project settings > Your apps > Web (</>) > register app > copy config into `assets/js/firebase-config.js`.

## 2. Make yourself admin (only way, by design)
1. Open the site, go to account/login.html, sign in with Google once, create your account.
2. Firebase console > Authentication > Users > copy your **User UID**.
3. Firestore > Start collection `admins` > Document ID = your UID > add any field (e.g. `ok: true`) > Save.
4. Log in again: you are sent to account/admin.html.

## 3. Pandit flow
Pandit logs in > chooses "Pandit" > fills profile > status "Waiting for approval".
You open account/admin.html > Pandits > Approve. Now customers can choose that pandit.

## 4. Security hardening checklist
- [ ] firestore.rules published (without it the database is open or locked)
- [ ] Authorized domains list contains only your own domains
- [ ] Firebase config API key: Google Cloud console > APIs & Services > Credentials > restrict the Browser key to HTTP referrers `https://<username>.github.io/*` and `https://onlinepujari.in/*`
- [ ] App Check (free): Firebase console > App Check > register web app with reCAPTCHA v3, put the site key in `APP_CHECK_SITE_KEY`, then click Enforce for Firestore and Authentication
- [ ] Stay on the Spark plan (it cannot bill you; abuse can only pause the service)
- [ ] GitHub: enable 2FA, turn on branch protection for `main`, enable Dependabot/secret scanning
- [ ] Never commit admin passwords/service-account JSON; none are needed in this project
- [ ] Domain (later): enable registrar lock + DNSSEC, turn on Enforce HTTPS in Pages

## 5. Local test
`python3 -m http.server 8000` then open http://localhost:8000/account/login.html (add `localhost` to Authorized domains).
