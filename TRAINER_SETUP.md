# DAMATH MathLab — Trainer Monitoring Setup

Student training site: https://userme-cloud.github.io/Damath_with_analysis/
Trainer dashboard: https://userme-cloud.github.io/Damath_with_analysis/trainer/

## Status
**Progress (22 October 2026):** Supabase project **DAMATH MathLab** was created in Singapore (ap-southeast-1), the three reporting tables and row-level security policies were deployed and checked, and the public browser settings in `cloud-config.js` now point to this project.

**Issue found (23 October 2026):** The Supabase Auth service is returning `422 anonymous_provider_disabled` when students submit sign-ins. Its logs specifically say **Anonymous sign-ins are disabled**, despite an earlier green switch in the dashboard screenshot. There are still zero student auth identities, zero players and zero sessions. Trainer credentials and protected database reads are working. The current website now saves unsent results in a persistent queue, shows the error, and offers explicit retry and past-practice upload controls. **The anonymous signup setting must be saved and verified in the live project before reporting can resume.**

Supabase project dashboard: https://supabase.com/dashboard/project/onkaculwnkodqglmqiaw

## Fix anonymous student sign-ins and verify results
1. Open [Supabase Authentication → Sign In / Providers](https://supabase.com/dashboard/project/onkaculwnkodqglmqiaw/auth/providers) for the **DAMATH MathLab** project's **main / Production** environment. Locate **Allow anonymous sign-ins**. Toggle it **off, then on again**, and **Save** the changes if prompted. Refresh the Supabase settings page to confirm the green setting persists.
2. After GitHub Pages has updated, return to the [Student Training Website](https://userme-cloud.github.io/Damath_with_analysis/) and do a full refresh (**Ctrl + Shift + R**). The website now shows a visible warning when the authentication service rejects sign-ins.
3. Enter the same player name, tick **Share my training results with my trainer**, and select **Retry sharing queued results** to resend earlier opted-in results from this browser. To share drills that were previously saved **without** the consent box checked, select **Share previously saved drills (optional)** and approve the explicit confirmation prompt. Nothing is uploaded without consent.
4. When the student page says that practice reports were uploaded, open the [Trainer Center](https://userme-cloud.github.io/Damath_with_analysis/trainer/), sign in with your approved account and click **Refresh**. Verify the student row, accuracy and question totals.
5. If a new retry still says **Anonymous sign-ins are disabled**, check the Supabase project and branch again; do not clear browser data or the pending session queue. The authentication service has not accepted the setting yet. Share the new error message so the live Auth logs can be checked again.

**No need to recreate** the Supabase project, database tables or trainer authorization.


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
- Previously opted-in results are queued automatically and can be retried. Old local-only practice history can be uploaded **only** when the student chooses the explicit historical sharing action and confirms consent.
- This product stores practice summaries, not student IP logs, video, screenshots, or an activity feed.
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
