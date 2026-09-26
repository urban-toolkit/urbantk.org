# urbantk.org

The website of the Urban Toolkit, built with [VitePress](https://vitepress.dev/) and deployed to GitHub Pages on every push to `main`.

```bash
npm install
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
| Images, logos, clips | `site/public/media/` |
| Funding text, footer logos, home page order | `site/.vitepress/site.ts` |
| Theme (layouts, components, styles) | `site/.vitepress/theme/` |

The menu and the home page are generated from the project pages, so adding a project needs no other change.

## Add a project

1. Copy `site/projects/_template.md` to `site/projects/<slug>.md`. The page is served at `/<slug>/`.
2. Fill in the frontmatter. Every field is checked when the site builds, and a typo fails the build with a message saying which field is wrong.
3. Put its logo and its lead image in `site/public/media/projects/<slug>/`: one image per project, the most descriptive one (usually the paper's teaser), preferably wide. Use WebP of at most 1600 px wide and 500 KB, then run `node scripts/media/build-cards.mjs <slug>` to crop the home page card from it.
4. Set `listed: false` to publish the page without adding it to the menu and the home page.

Each project page has the same structure. What sets projects apart is the `accent` color, the `logo` (or a monogram in the accent color when there is none) and the `hero` image, which the home page card is cropped from. Dark-mode and contrast-safe variants of the accent are computed at build time.

## Add a paper

Add the entry to `site/data/papers.bib`. Doi.org returns it for any DOI:

```bash
curl -LH "Accept: application/x-bibtex" https://doi.org/10.1109/TVCG.2024.3456353
```

Then add the fields that only this site reads (they are removed from the BibTeX that visitors copy):

```bibtex
  projects  = {curio},              % project pages that list the paper
  presented = {IEEE VIS 2024},      % conference, for journal papers presented at one
  page      = {/curio/},            % project page on this site
  code      = {https://github.com/urban-toolkit/curio},
  eprint    = {2408.06139},         % with archiveprefix = {arXiv}, adds an arXiv link
  archiveprefix = {arXiv},
```

`pdf`, `video`, `thumbnail` and `award` are also available. Within a year, papers appear in the order of the file.

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

## Deployment

`.github/workflows/deploy.yml` builds, checks and deploys `main` to GitHub Pages. Pull requests run the same build and checks in `.github/workflows/ci.yml`. The custom domain is set in the repository's Pages settings.

GitHub Pages has no server-side redirects. The build writes a small HTML page at each old URL in `site/data/redirects.yaml`, and at each old WordPress year and month archive.

## Migration from WordPress

The site replaced a WordPress site in 2026. `scripts/migrate/` holds the one-time scripts that exported it (`wp-export.mjs`) and built `papers.bib` (`seed-bib.mjs`), and `migration/pages/` the converted drafts of the old pages. `site/data/legacy-urls.txt` lists every URL the old site served; `npm run check` fails if one of them stops resolving.
