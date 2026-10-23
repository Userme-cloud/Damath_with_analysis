# DAMATH MathLab — Student Training + Trainer Center

**Student website:** https://userme-cloud.github.io/Damath_with_analysis/

**Trainer monitoring website:** https://userme-cloud.github.io/Damath_with_analysis/trainer/

The first site delivers integer DAMATH arithmetic drills. The separate Trainer Center receives **automatic reporting for every new school-managed drill**. Required student/guardian privacy notices and school permissions must be provided before inviting learners.

The student and trainer websites are published from the same GitHub Pages repository, connected to the DAMATH MathLab Supabase project with row-level security. A successful upload has been recorded; earlier missing sessions were caused by the per-session sharing checkbox being left off. **That checkbox is now removed for new drills.** Browser uploads are queued and retried if interrupted; older local-only sessions are not retrospectively shared without a separate permission confirmation. See [TRAINER_SETUP.md](TRAINER_SETUP.md) for verification steps.


## Student training
- Four basic operations, 576 theoretical ordered arithmetic expressions, and DAMA score variants.
- 11 selectable modes, shuffled four-option answers, correct answers revealed immediately.
- 20 questions by default, 3-second auto-advance, speed mode, adaptive drills, automatic reporting of new sessions, a persistent retry queue, and locally saved history.
- Three-jump capture chains are arithmetic sequences, **not verified legal board capture paths**.
- Player training works even if the cloud backend is not configured.

## Trainer dashboard
- Password-protected teacher sign-in; access is server-authorized using Supabase row-level security.
- Authorized school-training roster, practice days, last activity, sessions and answered questions.
- Accurate / incorrect totals, speed, four-operation breakdown, session history and downloadable CSV.
- Choose 7/30/90 days or all time, sort by engagement, and open individual learner reports.
- Uses anonymous student authentication per browser; a student should use one browser profile, or separate student accounts must be added for cross-device merging.
- Uses only the **public publishable key** in `cloud-config.js`, never a secret key.

## Deployment
GitHub repository: https://github.com/Userme-cloud/Damath_with_analysis

Settings → Pages → Deploy from a branch → `main` → `/(root)`.

## Scope and privacy
- The trainer site is not public student reporting: approved trainers must sign in.
- No per-drill toggle: new sessions are automatically shared after the school has provided required notices and permissions; past local-only records need separate confirmed import.
- Shared summaries are useful for coaching, not tamper-proof assessments.
- Personal information and analytics must follow your school's learner/guardian consent rules.

[Full setup guide](TRAINER_SETUP.md)
