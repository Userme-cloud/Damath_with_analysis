# DAMATH MathLab — Arithmetic Training

A responsive, static Integer DAMATH arithmetic training website. Hosted on GitHub Pages from the `index.html` file.

## Publish the website

1. Open this repository in GitHub.
2. Select **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Choose `main`, choose `/(root)`, and click **Save**.
5. Check the **Pages** settings for the final public address. The usual address is `https://userme-cloud.github.io/Damath_with_analysis/`.

See the official [GitHub Pages instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Trainer

- 11 modes, including speed, accuracy, tournament, DAMA scoring, daily challenge, three-capture arithmetic totals, and remaining chip values.
- 4 randomized multiple-choice answers, instantly checked on click.
- Automatic next question after 3 seconds (1.5 seconds in speed mode).
- Default 20 questions; adjustable question count and question time limit.
- Adaptive operation selection, local training history, mistake review, performance charts, achievements, printable certificates, worksheets, and teacher fixed-seed links.
- Keyboard shortcuts 1–4; accessible controls, sound toggle, high contrast, large text, and reduced-motion option.

## Arithmetic convention

Integer chips: `0, -1, 2, -3, 4, -5, 6, -7, 8, -9, 10, -11`. Operands are ordered: capturing chip first, captured chip second. Division rounds to the nearest integer, with exact halves away from zero. Division by zero is **No Score (NS)**; the trainer's answer choice is `0` as requested, and NS is explicitly shown in the feedback. One DAMA uses ×2; both DAMAs use ×4. Chain questions are arithmetic-only and not a claim of legal board reachability.

## Privacy and limitations

This is a *static website*. Student names and training history are saved by the browser's local storage; **no class database, login or cross-device synchronization** is provided. Students can download their own CSV results for sharing with teachers. Fixed-seed shared tests are reproducible only when settings match. Do not treat locally recorded scores as tamper-proof competition results.
