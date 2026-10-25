# Colin’s personal website

[English](README.md) | [简体中文](README.zh-CN.md)

An English-first, bilingual personal website for research and open-source audiences. Original HTML/CSS design, inspired by the information hierarchy of academic homepages and the project presentation of developer portfolios. No template source code or third-party artwork is copied.

## Meal booking

`/meet/` and `/zh/meet/` use the existing bilingual layout. `meet.mjs`,
`assets/meet.css` and `assets/meet.js` provide the page and booking interaction.
GitHub Pages hosts the frontend only. Set the repository Actions variable
`BOOKING_API_ORIGIN` to the HTTPS origin of a separately deployed Smart Calendar
service with its version 1 public meal API. Leave it empty to show “bookings are
not open yet”; no sample availability or fake confirmations are published.

Local build: set the environment variable `BOOKING_API_ORIGIN` before running
`node build.mjs` (loopback HTTP is allowed for development). The backend must
allow `https://brightcolin.github.io` in its CORS origins, own its Google OAuth
authorization, and keep its data on persistent storage. API keys, OAuth tokens,
visitor records and busy events never belong in this repository or build.

Visitors get private fragment links to manage their own booking. There are no
analytics or third-party scripts on the booking page; it sends no referrer and
does not save form data in localStorage. Reminders notify Colin via Google
Calendar; this version does not email visitors. See the backend's
`MEAL_BOOKING.md` for deployment and operational limitations.

Website: https://brightcolin.github.io/ · Chinese: https://brightcolin.github.io/zh/

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

The website source lives in `brightcolin/brightcolin.github.io`. The existing `brightcolin/brightcolin` repository is the GitHub Profile README and remains separate.

1. Edit `content.mjs` for copy or `assets/style.css` for presentation.
2. Run `node build.mjs` and `node check.mjs` locally.
3. Commit the source changes and push to `main`.
4. The **Deploy personal website to GitHub Pages** workflow publishes the update automatically.
5. Check the repository’s Actions tab for the deployment result. A manual run is also available.

Pages is configured to use GitHub Actions. The workflow builds the site and checks internal links before deploying `dist/`. A custom domain can be added later. The website needs no separately managed server or database.

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
