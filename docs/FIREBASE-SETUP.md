# Firebase setup (free Spark plan)

1. **Create project** at console.firebase.google.com (no billing needed).
2. **Authentication → Sign-in method → Google → Enable.**
3. **Authentication → Settings → Authorized domains → Add** `onlinepujari.vercel.app` (and your own domain later, plus `localhost` if testing).
4. **Firestore Database → Create** (production mode, region `asia-south1`).
5. **Firestore → Rules:** paste the whole of `firebase/firestore.rules` and **Publish**. Republish every time this file changes.
6. **Project settings → Your apps → Web app:** copy the config into `assets/js/firebase-config.js`. Never overwrite your own copy when you unzip a new version.
7. **Restrict the API key** (Google Cloud Console → APIs & Services → Credentials): HTTP referrers = your site domains only.
8. Optional but recommended: **App Check** with reCAPTCHA v3; put the site key in `APP_CHECK_SITE_KEY`.

## Who approves pandits?  You (the admin)

1. Open `account/login.html` and sign in with your Google account once (choose "Customer"). This creates your user record.
2. Firebase console → Authentication → Users → copy your **User UID**.
3. Firestore → **Start collection** `admins` → Document ID = your UID → add one field, e.g. `active` (boolean) = true. Save.
4. Sign in again. You are sent to `account/admin.html`.

Flow: pandit signs up → fills profile at `account/pandit.html` (saved as *unapproved*, hidden from customers) → you open **Admin → Approvals**, check the details, then **Approve** or **Request changes** (with a note the pandit sees). **Revoke** hides a pandit again. Every action is written to the **Audit log**, which nobody can edit.

Admin rights can only be given by creating the `admins/<uid>` document in the console. No one can make themselves admin from the website.

## Pages
`account/login.html` · `account/dashboard.html` (customer) · `account/pandit.html` · `account/admin.html`
