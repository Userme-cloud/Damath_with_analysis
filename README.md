# DAMATH MathLab — Student Training + Trainer Center

**Student website:** https://userme-cloud.github.io/Damath_with_analysis/

**Trainer monitoring website:** https://userme-cloud.github.io/Damath_with_analysis/trainer/

The first site delivers integer DAMATH arithmetic drills. The separate Trainer Center summarizes participation and learning performance **only for learners who opt to share their results**.

The student and trainer site code is committed to GitHub Pages. The Singapore Supabase project is now provisioned, its reporting tables and row-level security are installed, and `cloud-config.js` points to the project. **Before live class reporting can work, an administrator must enable anonymous student sign-ins and register/approve a trainer email-password account.** See [TRAINER_SETUP.md](TRAINER_SETUP.md) for the remaining steps and [supabase-setup.sql](supabase-setup.sql) for the installed database schema.

## Student training
- Four basic operations, 576 theoretical ordered arithmetic expressions, and DAMA score variants.
- 11 selectable modes, shuffled four-option answers, correct answers revealed immediately.
- 20 questions by default, 3-second auto-advance, speed mode, adaptive drills, and local progress.
- Three-jump capture chains are arithmetic sequences, **not verified legal board capture paths**.
- Player training works even if the cloud backend is not configured.

## Trainer dashboard
- Password-protected teacher sign-in; access is server-authorized using Supabase row-level security.
- Consenting player roster, practice days, last activity, sessions and answered questions.
- Accurate / incorrect totals, speed, four-operation breakdown, session history and downloadable CSV.
- Choose 7/30/90 days or all time, sort by engagement, and open individual learner reports.
- Uses anonymous student authentication per browser; a student should use one browser profile, or separate student accounts must be added for cross-device merging.
- Uses only the **public publishable key** in `cloud-config.js`, never a secret key.

## Deployment
GitHub repository: https://github.com/Userme-cloud/Damath_with_analysis

Settings → Pages → Deploy from a branch → `main` → `/(root)`.

## Scope and privacy
- The trainer site is not public student reporting: approved trainers must sign in.
- A student's consent toggle is off by default, and local training continues if they do not consent.
- Shared summaries are useful for coaching, not tamper-proof assessments.
- Personal information and analytics must follow your school's learner/guardian consent rules.

[Full setup guide](TRAINER_SETUP.md)
