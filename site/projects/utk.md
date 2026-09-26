---
layout: ProjectPage
name: UTK
title: "The Urban Toolkit: A Grammar-based Framework for Urban Visual Analytics"
tagline: Grammar for urban visualizations
category: grammars
order: 10
accent: "#046bd2"
logo: /media/projects/utk/logo.webp
hero:
  image: "/media/projects/utk/teaser.webp"
  alt: "What-if shadow analysis and building-level sunlight access specified with the UTK grammar"
  caption: "Left: what-if planning for urban shadows, comparing current and proposed developments through algebraic operations in the grammar. Right: sunlight access analysis at the building level."
  w: 1600
  h: 355
  youtube: "JYcIPj3F0t4"
card:
  image: "/media/projects/utk/card.webp"
  alt: "Noise complaints in Manhattan by ZIP code, with a linked parallel coordinates plot"
links:
  - { kind: github, url: "https://github.com/urban-toolkit/utk" }
  - { kind: install, url: "https://github.com/urban-toolkit/utk/blob/master/docs/USAGE.md" }
  - { kind: docs, url: "https://github.com/urban-toolkit/utk/blob/master/docs/QUICK-START.md", label: Getting started }
  - { kind: tutorials, url: /utk/tutorials/ }
  - { kind: paper, bib: moreira2024utk }
figures:
  - src: "/media/projects/utk/fig-multiscale.webp"
    w: 1600
    h: 397
    caption: "Sunlight access aggregated on a grid, by ZIP code and at the street level, and over building surfaces, each defined with grammar knots."
    credit: moreira2024utk
  - src: "/media/projects/utk/fig-integration.webp"
    w: 1600
    h: 410
    caption: "Ways to integrate physical and thematic layers: a linked view, embedded surface plots and embedded footprint plots of sunlight access."
    credit: moreira2024utk
  - src: "/media/projects/utk/fig-json-editor.webp"
    w: 1600
    h: 1018
    caption: "UTK's built-in JSON editor updates the map view as the specification changes. Here, noise complaints in Manhattan with a linked parallel coordinates plot."
    credit: moreira2024utk
  - src: "/media/projects/utk/fig-boston-shadows.webp"
    w: 1600
    h: 1202
    caption: "Shadows cast by a skyscraper in Boston: the current situation in winter and summer, and the shadow that would disappear without the building."
    credit: moreira2024utk
team: [gmoreira, mhosseini, mnipu, mlage, nferreira, fmiranda]
paper: moreira2024utk
arxiv: "2308.07769"
---

While cities around the world are looking for smart ways to channel new advances in data collection, management, and analysis to address their day-to-day problems, the complex nature of urban issues and the overwhelming amount of available structured and unstructured data have posed significant challenges in translating these efforts into actionable insights. In the past few years, urban visual analytics tools have significantly helped tackle these challenges. With this in mind, we present the Urban Toolkit, a flexible and extensible visualization framework that enables the easy authoring of web-based visualizations through a new high-level grammar specifically built with common urban use cases in mind.
