# DAMATH MathLab — Trainer Monitoring Setup

Student training site: https://userme-cloud.github.io/Damath_with_analysis/
Trainer dashboard: https://userme-cloud.github.io/Damath_with_analysis/trainer/

## Status
The two webpages and reporting code are committed to GitHub. **Live multi-device monitoring is NOT active until you connect a Supabase project.** A static GitHub Pages site cannot store other students' records by itself.

## Set up shared reporting
1. Create a project at https://supabase.com/dashboard.
2. In Authentication settings, **enable anonymous sign-ins** for students (the student website needs no student passwords). Consider Supabase CAPTCHA/Turnstile and rate limits before inviting a large class.
3. Open SQL Editor and run the entire `supabase-setup.sql` from this repository. It creates `damath_players`, `damath_sessions`, and `damath_trainers`, with row-level security policies. Never disable row-level security to debug a permissions issue.
4. In Authentication > Users, create or invite your own trainer email/password account, confirming its email. Do not create a public signup form for trainers.
5. Back in SQL Editor, run this query after replacing the email:
   ```sql
   insert into public.damath_trainers(user_id)
   select id from auth.users where email = 'YOUR_TRAINER_EMAIL@example.com'
   on conflict (user_id) do nothing;
   ```
6. In Supabase project settings, copy the **Project URL** and **publishable/anon** client key. Never use the service_role or secret key in a public HTML/JS file.
7. On GitHub, edit `cloud-config.js` and replace `https://YOUR-PROJECT.supabase.co` and `YOUR_SUPABASE_PUBLISHABLE_KEY` with your URL and public key. Commit to the `main` branch.
8. Ensure GitHub Pages publishes from `main` > `/(root)`.
9. Open the training site. Enter a player name and (optionally) grade, **check the consent option**, and complete a drill. The student page will report whether the result was shared.
10. Open the Trainer Center and sign in with your approved trainer account. You can now see consenting students' practice frequencies, last recorded activity, accuracy, response times, and operation skills.

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
