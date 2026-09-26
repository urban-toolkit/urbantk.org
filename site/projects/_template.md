---
# Copy this file to site/projects/<slug>.md to add a project; the page is served at /<slug>/.
# Every field is checked when the site builds (site/.vitepress/theme/node/schema.ts).
layout: ProjectPage
name: Project name
title: Full title, usually the paper title
tagline: One line for the menu card and the page header
category: grammars          # grammars | dataflow | knowledge | ai (site/data/categories.yaml)
order: 100                  # position within the category
listed: true                # false: reachable by URL, but not in the menu or on the home page
accent: "#046bd2"           # the project's color; dark-mode and contrast variants are derived
logo: /media/projects/<slug>/logo.webp  # omit to get a monogram in the accent color
# bubble: { label: false }  # home page diagram: set label false when the logo already shows the name
hero:                       # the one image the page leads with, usually the paper's teaser; prefer wide
  image: /media/projects/<slug>/teaser.webp
  alt: What the image shows
  caption: "One or two sentences on what the image shows."   # required
  w: 1600
  h: 900
card:                       # the home page card, cropped from the hero by scripts/media/build-cards.mjs
  image: /media/projects/<slug>/card.webp
  alt: What the image shows
links:
  - { kind: github, url: "https://github.com/urban-toolkit/<repo>" }
  - { kind: paper, bib: key-in-papers-bib }
team: [fmiranda]            # ids from site/data/team.yaml, in display order
paper: key-in-papers-bib    # the paper shown under "How to cite"
---

One or two paragraphs about the project. Everything below the frontmatter is Markdown.
