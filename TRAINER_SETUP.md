# DAMATH MathLab — Trainer Monitoring Setup

Student training site: https://userme-cloud.github.io/Damath_with_analysis/
Trainer dashboard: https://userme-cloud.github.io/Damath_with_analysis/trainer/

## Status
**Progress (22 October 2026):** Supabase project **DAMATH MathLab** was created in Singapore (ap-southeast-1), the three reporting tables and row-level security policies were deployed and checked, and the public browser settings in `cloud-config.js` now point to this project.

**Authentication setup completed (22 October 2026):** Anonymous sign-ins are enabled (verified from the project settings screenshot), a permanent email/password trainer user has been created with confirmed email, and that user's UUID is approved in `damath_trainers`. Simulated Supabase role tests verified trainer access and anonymous-user rejection. **Real student-to-trainer sync is not yet tested**; complete the test below.

Supabase project dashboard: https://supabase.com/dashboard/project/onkaculwnkodqglmqiaw

## Final verification (administrator setup complete)

1. Go to the [student website](https://userme-cloud.github.io/Damath_with_analysis/) using a **separate student browser profile**. Enter a test learner nickname and check **Share my training results with my trainer**. Answer a few questions and confirm the student page says results were sent.
2. Open the [Trainer Center](https://userme-cloud.github.io/Damath_with_analysis/trainer/) using the trainer's own browser session. Sign in with the previously created authorized trainer email/password account and verify the test learner appears in the roster with correct answer counts.
3. Compare the learner's recorded accuracy and question counts. Use the **Refresh** button, then check CSV export.
4. For learners, enable appropriate school consent/guardian notices. Optional hardening: configure CAPTCHA/rate limits for anonymous sign-ins and enable leaked-password protection for trainers.

**Already completed:** Supabase database provisioning, secure tables and RLS policies, GitHub public client configuration, enabled anonymous sign-ins, trainer user creation, trainer authorization, and simulated authorization checks. Do not repeat the setup unless intentionally migrating.

## What the trainer can see
- Registered consenting players, grade (optional), practice days, number of sessions, calculations, last activity.
- Accuracy and average computation time across a selected date range.
- Learner-specific performance across addition, subtraction, multiplication, division, capture chains, and endgame.
- Recent session summary; frequency rankings; 14-day activity chart; CSV export.
- Refresh on demand and every 60 seconds while the dashboard tab is visible.
- "Recently active" means a submitted answer was recorded in the last 5 minutes. It does not verify that the browser is currently open.

## Privacy and identities
- **Consent is off by default.** Without consent, training remains local.
- The trainer login requires authorization in the `damath_trainers` table. Client-side passwords are not stored in source code.
- Students receive a per-browser anonymous ID from Supabase Auth; **one browser profile should correspond to one student**. Clearing browser storage or changing devices creates a new identity. For unified cross-device accounts, a future version should add verified student login.
- Existing local-only practice history is not uploaded retrospectively. New opted-in drills produce shared records.
- This product stores practice summaries, not student IP logs, video, screenshots, or an activity feed.
- For minors, follow school and parent/guardian consent requirements; allow students to use nicknames.
- Protect your Supabase project and use only the publishable key publicly. Row-level security controls who can access results.
- Anyone with GitHub access to the public repository can view the website source and public key, but **not private student rows** when RLS is configured properly.

## Troubleshooting
- "Not configured": `cloud-config.js` still contains the placeholder values.
- Trainer login works but access denied: verify the user signs in using the authorized trainer email and confirm the user ID exists in `damath_trainers`.
- Students' results stay pending: check anonymous sign-in enabled, SQL schema installed, client key, RLS, and network connection.
- One browser says it already syncs for another student: use a different browser profile to prevent merging learners.
- Private data must never be made public by setting broad SELECT permissions or disabling RLS.
- Dashboard queries are paginated up to 20,000 records per table. For very large schools, add server aggregation and scoped class assignments.

## Project layout
- `index.html` — student training website.
- `trainer/index.html` — separate trainer-facing website.
- `cloud-sync.js` — optional and queued student progress sync.
- `cloud-config.js` — configured public project URL and publishable key (never secret/service-role key).
- `supabase-setup.sql` — database and access policies.

> Practice results are informational and self-reported by the browser; do not use them as tamper-proof examination grades.
