# Colin’s personal website

An English-first, bilingual personal website for research and open-source audiences. Original HTML/CSS design, inspired by the information hierarchy of academic homepages and the project presentation of developer portfolios. No template source code or third-party artwork is copied.

## Local preview

Requires Node.js 22 or later. No dependency installation is needed.

```sh
node build.mjs
node check.mjs
node serve.mjs
```

Open http://127.0.0.1:4173. English is at `/`, Chinese at `/zh/`. Project, about, and CV pages have matching locale routes. CV pages support printing or saving to PDF through the browser. Main content and navigation work without JavaScript.

## Edit

- `content.mjs`: bilingual biography, project descriptions, status, and contact details.
- `build.mjs`: shared page templates and original SVG architecture illustrations.
- `assets/style.css`: responsive styling, reduced motion, and print layout.
- `assets/site.js`: print action and lightweight enhancements.
- `dist/`: generated static website, ready for hosting.

Run `node build.mjs` after edits. `node check.mjs` checks local links, anchors, reciprocal language routes, and document structure.

## GitHub Pages

Use a new repository named `brightcolin.github.io` for the root personal website. The existing `brightcolin/brightcolin` repository is the GitHub Profile README and should remain separate.

1. Authenticate GitHub CLI (`gh auth login`) or use the GitHub website.
2. Create the public `brightcolin.github.io` repository and push this project’s source to `main`.
3. Under repository Settings → Pages, choose **GitHub Actions** as the build source.
4. Run the included **Deploy personal website to GitHub Pages** workflow, or push to `main`.
5. Wait for the workflow to succeed before treating `https://brightcolin.github.io/` as live.

The workflow builds the site and checks internal links before deploying `dist/`. A custom domain can be added later. Hosting has not been provisioned by this local project.

## Content decisions

- Display name remains `Colin`, consistent with the public GitHub Profile.
- Biography uses the supplied resumes and presentation, with current research corrected by the owner. Project status was checked against public repository READMEs on 2026-10-24.
- Smart Calendar is in personal testing. Pomodoro functionality belongs to the separate desktop Widget; the web app currently has no PWA/offline support.
- Course Pilot and ThuStory are identified as completed team projects. Team contributions are distinguished from independent work.
- Illustrations are labeled system sketches, not screenshots, user data, or product demos.
- The public site keeps a single academic email address and GitHub contact. It omits legal name, student ID, class number, cohort, grades/ranking, detailed activity dates and locations, health details, and source documents.
- Current research uses the owner-supplied SRT project title, member role, research affiliation, October 2026 start date, and research-training scope in interactive world models and action-conditioned video generation. No advisor identity, unannounced project details, or unverified research results are included.
- Earlier LLM projects remain in the portfolio as software experience; they are not presented as the current research direction.
- The résumé is a concise public overview. Detailed application materials are kept separate.
- No empty notes/publications sections, fake analytics, or unverified project metrics.
- The website loads no external fonts, analytics, or runtime dependencies.

## Sources

- https://github.com/brightcolin/brightcolin
- https://github.com/brightcolin/smart-calendar
- https://github.com/brightcolin/ai-finance-analyzer
- https://github.com/brightcolin/thu-course-pilot
- https://github.com/brightcolin/thu-story

Design references: https://github.com/alshedivat/al-folio, https://github.com/academicpages/academicpages.github.io, https://github.com/ryanfitzgerald/devportfolio.
