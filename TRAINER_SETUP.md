# DAMATH MathLab — Trainer Monitoring Setup

Student training site: https://userme-cloud.github.io/Damath_with_analysis/
Trainer dashboard: https://userme-cloud.github.io/Damath_with_analysis/trainer/

## Status
**Progress (22 October 2026):** Supabase project **DAMATH MathLab** was created in Singapore (ap-southeast-1), the three reporting tables and row-level security policies were deployed and checked, and the public browser settings in `cloud-config.js` now point to this project.

**Two administrator actions remain:** (1) enable anonymous sign-ins for students, and (2) create/invite a trainer email/password user and approve that user in `damath_trainers`. Until then, the websites are connected to a database but cross-device reports cannot yet be verified end-to-end.

Supabase project dashboard: https://supabase.com/dashboard/project/onkaculwnkodqglmqiaw

## Finish the administrator setup

1. Open the [Supabase project](https://supabase.com/dashboard/project/onkaculwnkodqglmqiaw) → **Authentication** → **Providers** → **Anonymous Sign-Ins**, then enable anonymous sign-ins. This allows students to opt in without creating passwords. Consider enabling CAPTCHA and abuse protections for public applications.
2. Under **Authentication** → **Users**, create or invite one email/password account for the trainer. Verify the email and establish a password privately; **do not put a password in GitHub or this chat**.
3. Open **SQL Editor** and run the following after replacing the placeholder with the exact trainer email:
   ```sql
   insert into public.damath_trainers(user_id)
   select id from auth.users
   where lower(email) = lower('YOUR_TRAINER_EMAIL@example.com')
     and is_anonymous is not true
   on conflict (user_id) do nothing;
   ```
4. Go to the [student website](https://userme-cloud.github.io/Damath_with_analysis/) in a test student's separate browser profile. Enter a name, check **Share my training results with my trainer**, and answer a few questions. The student page should confirm a successful share.
5. Open the [Trainer Center](https://userme-cloud.github.io/Damath_with_analysis/trainer/), sign in with the authorized email/password account, and confirm the student's activity is visible.

**Already completed:** project creation, `supabase-setup.sql` execution, database row-level security, and GitHub `cloud-config.js` connection. Do **not** repeat the database schema setup unless you are intentionally migrating or troubleshooting it.

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
- Trainer login works but access denied: you have not added the trainer user's auth UUID to `damath_trainers`; inspect the exact registered email.
- Students' results stay pending: check anonymous sign-in enabled, SQL schema installed, client key, RLS, and network connection.
- One browser says it already syncs for another student: use a different browser profile to prevent merging learners.
- Private data must never be made public by setting broad SELECT permissions or disabling RLS.
- Dashboard queries are paginated up to 20,000 records per table. For very large schools, add server aggregation and scoped class assignments.

## Project layout
- `index.html` — student training website.
- `trainer/index.html` — separate trainer-facing website.
- `cloud-sync.js` — optional and queued student progress sync.
- `cloud-config.js` — public project URL and publishable key placeholders.
- `supabase-setup.sql` — database and access policies.

> Practice results are informational and self-reported by the browser; do not use them as tamper-proof examination grades.
