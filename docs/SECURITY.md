# Security notes

- **Firestore rules** are the real protection. Every write is validated (field list, types, lengths), roles cannot be self-assigned to admin, pandits are hidden until approved, bookings have a 30 s cooldown and allowed status transitions only, reviews are immutable, the audit log is append-only.
- **Admin** = existence of `admins/<uid>`, created manually in the console only.
- **No user HTML** is ever inserted into the page (safe DOM builder); CSV export neutralises formula injection.
- **CSP + headers** (`vercel.json`, `_headers`): no inline scripts, `frame-ancestors 'none'`, nosniff, HSTS, strict referrer, locked permissions. Account pages are `no-store` and `noindex`.
- **Idle sign-out** after 30 minutes.
- Restrict the API key by HTTP referrer and enable App Check.
- Limits: the free plan has no Cloud Functions, so spam control is rule-based. The rules were written but could not be run in the Firebase emulator here; test them in the console Rules Playground (sign in as customer, pandit, admin) before going live.
- Never put payments, Aadhaar or other IDs in the site.
