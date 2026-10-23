# DAMATH MathLab — Trainer Monitoring Setup

Student training site: https://userme-cloud.github.io/Damath_with_analysis/
Trainer dashboard: https://userme-cloud.github.io/Damath_with_analysis/trainer/

## Status — automatic reporting update (23 October 2026)

The two GitHub Pages websites are connected to the healthy DAMATH MathLab Supabase project in Singapore. The trainer account is authorized, and the database has received a student session.

**Changed behavior:** The student website no longer requires the player to check a "Share my training results" box. For **new school-managed drills**, training-session summaries (player name, optional grade, date/time, count of questions, accuracy, speed, score and operations) automatically upload after answering starts and when a session finishes. If Supabase is unreachable, data remains locally saved and in a retry queue. The Trainer Center shows it on its next refresh.

**Privacy:** The school must provide a transparent notice and obtain necessary student/guardian permissions *before* inviting learners to use this monitored version. Old practice created when sharing was optional remains private unless manually imported with confirmation. The site does not secretly backfill past history.

## How to verify

1. Open [DAMATH MathLab](https://userme-cloud.github.io/Damath_with_analysis/) on the player's device. Refresh with **Ctrl + Shift + R** to load the new code. The checkbox is gone and an **Automatic trainer reporting** notice appears.
2. Enter the same learner name each session (a separate browser profile per player), and start a drill. Answer a few questions. Look at the **Online trainer sharing** status on the completed report.
3. Open the [Trainer Center](https://userme-cloud.github.io/Damath_with_analysis/trainer/) on the trainer's device. Sign in, click **Refresh**, and compare session totals and speed/accuracy.
4. If results remain queued, return to the player website and choose **Retry sharing queued results**. To send older locally saved sessions, use **Send older local drills (with permission)**; this explicitly asks for authorization.
5. Never clear the player's browser history or storage while unsent results remain. Check the visible error, verify Supabase anonymous sign-ins are enabled and confirm the correct browser identity. Contact the website administrator to debug continued errors.

**Already configured:** database tables, row-level security, student anonymous authentication support and the authorized trainer account. Do not recreate them.


## What the trainer can see
- Registered school-managed players, grade (optional), practice days, number of sessions, calculations, last activity.
- Accuracy and average computation time across a selected date range.
- Learner-specific performance across addition, subtraction, multiplication, division, capture chains, and endgame.
- Recent session summary; frequency rankings; 14-day activity chart; CSV export.
- Refresh on demand and every 60 seconds while the dashboard tab is visible.
- "Recently active" means a submitted answer was recorded in the last 5 minutes. It does not verify that the browser is currently open.

## Privacy and identities
- **New drills share automatically.** The school must secure required privacy notices and permissions before monitored training begins. Previously local-only history still requires explicit import authorization.
- The trainer login requires authorization in the `damath_trainers` table. Client-side passwords are not stored in source code.
- Students receive a per-browser anonymous ID from Supabase Auth; **one browser profile should correspond to one student**. Clearing browser storage or changing devices creates a new identity. For unified cross-device accounts, a future version should add verified student login.
- Results of all new school-managed drills are queued automatically and retried. Previous local-only practice history can be uploaded **only** after a separate confirmation covering that older data.
- This application stores practice summaries, not student IP logs, video, screenshots, or an activity feed.
- For minors, follow school and parent/guardian consent requirements; allow students to use nicknames.
- Protect your Supabase project and use only the publishable key publicly. Row-level security controls who can access results.
- Anyone with GitHub access to the public repository can view the website source and public key, but **not private student rows** when RLS is configured properly.

## Troubleshooting
- "Not configured": `cloud-config.js` contains an invalid project URL or key.
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
