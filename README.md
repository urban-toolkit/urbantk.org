# urbantk.org

The website of the Urban Toolkit, built with [VitePress](https://vitepress.dev/) and deployed to GitHub Pages on every push to `main`.

```bash
npm install
GITHUB_TOKEN="$(gh auth token)" npm run impact   # the numbers behind /impact/; needed once before dev and build
npm run dev       # http://localhost:5173
npm run build     # static site in site/.vitepress/dist
npm run check     # links, old WordPress URLs, redirects and media budgets of the build
```

## Where things live

| What | Where |
|---|---|
| Project pages | `site/projects/<slug>.md`, served at `/<slug>/` |
| Papers | `site/data/papers.bib` |
| People | `site/data/team.yaml` |
| News posts | `site/news/YYYY/MM/<slug>.md`, served at `/YYYY/MM/<slug>/` |
| Menu categories | `site/data/categories.yaml` |
| Old URLs that redirect | `site/data/redirects.yaml` |
| Impact page: what to count, and the rows the team reports | `site/data/impact.yaml` |
| Images, logos, clips | `site/public/media/` |
| Funding text, footer logos, home page order | `site/.vitepress/site.ts` |
| Theme (layouts, components, styles) | `site/.vitepress/theme/` |

The menu, the home page cards and the home page diagram are generated from the project pages, so adding a project needs no other change.

## Add a project

1. Copy `site/projects/_template.md` to `site/projects/<slug>.md`. The page is served at `/<slug>/`.
2. Fill in the frontmatter. Every field is checked when the site builds, and a typo fails the build with a message saying which field is wrong.
3. Put its logo and its lead image in `site/public/media/projects/<slug>/`: one image per project, the most descriptive one (usually the paper's teaser), preferably wide. Use WebP of at most 1600 px wide and 500 KB, then run `node scripts/media/build-cards.mjs <slug>` to crop the home page card from it.
4. Set `listed: false` to publish the page without adding it to the menu and the home page.

Each project page has the same structure. What sets projects apart is the `logo` (or a monogram when there is none) and the `hero` image, which the home page card is cropped from. A project's color is its category's `color` in `site/data/categories.yaml`, the same one its arc has in the home page diagram, so every project in a category shares it. Dark-mode and contrast-safe variants are computed at build time.

## The home page diagram

The hero's diagram, after the 2026 NSF CSSI poster, puts every listed project on a ring around the UrbanTK logo, grouped into one arc per category. A new project appears in its category's arc, in `order`. What else shapes it:

- `ecosystem` in `site/.vitepress/site.ts`: the categories' order around the ring (clockwise from the left) and the center image.
- `color` in `site/data/categories.yaml`: each arc's tint; the fill and the label color are derived from it for both themes.
- `bubble` in a project's frontmatter, all optional:
  - `image`: the picture in the circle; defaults to the logo, else the card image.
  - `fill`: the image covers the circle instead of sitting inside it; defaults to true when the image is not the logo.
  - `label`: draws the project's name; defaults to true; set it to false when the logo already shows the name.

The circle images of Deep Umbra, neural-3d and Sidewalk Stewards and the Autark wordmark come from the poster PDF: `python3 scripts/media/poster-bubbles.py <poster.pdf>`, then `node scripts/media/prepare-assets.mjs`.

## Add a paper

Add the entry to `site/data/papers.bib`. Doi.org returns it for any DOI:

```bash
curl -LH "Accept: application/x-bibtex" https://doi.org/10.1109/TVCG.2024.3456353
```

Then add the fields that only this site reads (they are removed from the BibTeX that visitors copy):

```bibtex
  projects  = {curio},              % project pages that list the paper; it is filed under their categories
  category  = {knowledge},          % for a paper without a project page: a category id from categories.yaml
  presented = {IEEE VIS 2024},      % conference, for journal papers presented at one
  page      = {/curio/},            % project page on this site
  code      = {https://github.com/urban-toolkit/curio},
  eprint    = {2408.06139},         % with archiveprefix = {arXiv}, adds an arXiv link
  archiveprefix = {arXiv},
```

`pdf`, `video`, `thumbnail` and `award` are also available. Within a year, papers appear in the order of the file. The papers page filters them by the menu's categories; a paper with neither `projects` nor `category` appears only under All.

## Add a news post

Create `site/news/YYYY/MM/<slug>.md`:

```markdown
---
title: "Paper accepted at IEEE VIS!"
date: 2026-08-12
image: /media/news/<slug>/image.webp
excerpt: "One or two sentences for the news list."
---

The post, in Markdown.
```

Add `imageFit: contain` when the image is a logo or a wide banner that should not be cropped.

## Add a person

Add them to `site/data/team.yaml`, with an `institution` id from the same file. Author names in `papers.bib` that match a person's `name` or one of their `aliases` link to their page. Collaborators who should appear on project pages but not on `/team/` get `listed: false`.

## Lead images from papers

Each project page leads with one image, usually its paper's teaser, taken from the paper's LaTeX source on arXiv:

```bash
python3 scripts/media/extract_figures.py [slug]   # needs PyMuPDF; writes media-src/figures/<slug>/
cd scripts && npm install && cd ..
node scripts/media/contact-sheet.mjs [slug]       # media-src/figures/<slug>/sheet.png, to pick from
node scripts/media/build-figures.mjs [slug]       # the pick in scripts/media/figures.json, as teaser.webp
node scripts/media/build-cards.mjs [slug]         # the home page card, cropped from the page's hero image
```

`build-figures.mjs` prints the image's width and height for the page's `hero`. Projects without a paper on arXiv use a frame of their video instead (`STILLS` in `scripts/media/prepare-assets.mjs`). `media-src/` is not committed. The scripts under `scripts/` need Node 20.10 or newer.

## The impact page

`/impact/` shows adoption and outreach by award year. Every deploy collects its numbers before the build: `npm run impact` (`scripts/impact/collect.mjs`) reads GitHub, PyPI, npm, Curio's repository and the papers' HTML versions on arXiv, and writes `.cache/impact/metrics.json`, which is not committed. The build turns it into the page and into the spreadsheet at `/impact/urbantk-impact.xlsx`.

To build the site locally, collect once first. GitHub lists stargazers only to signed-in requests, so the collector needs a token:

```bash
GITHUB_TOKEN="$(gh auth token)" npm run impact
npm run dev
```

`site/data/impact.yaml` says what to count and holds what only the team knows:

- `projects`: the repositories and packages. Add a line to count another project.
- `internal`: the institutions whose people are not external contributors, with their email domains and the words their members' GitHub profiles use.
- `people`: commit identities of one person that share no email, name or GitHub account, and the institution of people nothing else places.
- `curio.demos`: the Curio examples that show a feature rather than an urban analysis.
- `users`, `deployments`, `workshops`, `hackathons`, `tutorials`, `courses`, `internships`: the rows the team reports. Each item has a `date` or an award `year`. A year without items reads "Not reported"; `none` turns that into 0.

A paper's use cases are the parts of its usage-scenario or case-study section in its arXiv HTML version.

## Deployment

`.github/workflows/deploy.yml` collects the impact numbers, then builds, checks and deploys `main` to GitHub Pages. Pull requests run the same build and checks in `.github/workflows/ci.yml`. The custom domain is set in the repository's Pages settings.

GitHub Pages has no server-side redirects. The build writes a small HTML page at each old URL in `site/data/redirects.yaml`, and at each old WordPress year and month archive.

## Migration from WordPress

The site replaced a WordPress site in 2026. `scripts/migrate/` holds the one-time scripts that exported it (`wp-export.mjs`) and built `papers.bib` (`seed-bib.mjs`), and `migration/pages/` the converted drafts of the old pages. `site/data/legacy-urls.txt` lists every URL the old site served; `npm run check` fails if one of them stops resolving.
