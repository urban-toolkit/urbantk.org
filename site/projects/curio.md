---
layout: ProjectPage
name: Curio
title: A Dataflow-Based Framework for Collaborative Urban Visual Analytics
tagline: Dataflow-based framework for collaboration in urban visual analytics
category: dataflow
order: 10
logo: /media/projects/curio/logo.webp
hero:
  image: "/media/projects/curio/banner.webp"
  alt: "A Curio dataflow analyzing the shadow impact of a proposed building in Boston"
  caption: "A dataflow that analyzes the shadow impact of a proposed building in Boston: it loads OpenStreetMap data, runs a shadow model, and compares the current and alternate scenarios and their shadow difference in UTK views."
  w: 1600
  h: 449
  video: "https://github.com/urban-toolkit/curio/assets/2387594/6d29bda8-5e94-4496-a4ae-fd55adff024f"
  poster: "/media/projects/curio/video-poster.webp"
card:
  image: "/media/projects/curio/card.webp"
  alt: "Dataflows built in Curio for urban accessibility, climate and sunlight access studies"
bubble: { label: false }
links:
  - { kind: website, url: "https://curio.urbantk.org", label: "Website: curio.urbantk.org", primary: true }
  - { kind: install, url: "https://github.com/urban-toolkit/curio/blob/main/docs/USAGE.md" }
  - { kind: tutorials, url: "https://github.com/urban-toolkit/curio/blob/main/docs/QUICK-START.md", label: Getting started }
  - { kind: docs, url: "https://github.com/urban-toolkit/curio/blob/main/docs/README.md" }
  - { kind: github, url: "https://github.com/urban-toolkit/curio" }
  - { kind: paper, bib: moreira2025curio }
  - { kind: pypi, url: "https://pypi.org/project/utk-curio/" }
team: [gmoreira, mhosseini, cveiga, lalexandre, ncolaninno, doliveira, mlage, nferreira, fmiranda]
paper: moreira2025curio
arxiv: "2408.06139"
---

Curio (Collaborative Urban Insight Observatory) is a framework for collaborative urban visual analytics that uses a dataflow model with multiple abstraction levels (code, grammar, GUI elements) to facilitate collaboration across the design and implementation of visual analytics components. The framework allows experts to intertwine preprocessing, managing, and visualization stages while tracking provenance of code and visualizations.

Try it in the browser at [flow.urbantk.org](https://flow.urbantk.org), or run your own instance with the [installation guide](https://github.com/urban-toolkit/curio/blob/main/docs/USAGE.md).
