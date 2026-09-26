---
layout: ProjectPage
name: neural-3d
title: A Neural Field-Based Approach for View Computation & Data Exploration in 3D Urban Environments
tagline: Neural fields for view computation and data exploration in 3D cities
category: ai
order: 40
accent: "#4c6ef5"
monogram: N3D
venue: IEEE TVCG 2026
hero:
  image: "/media/projects/neural-3d/teaser.webp"
  alt: "Direct and inverse view queries over building facades"
  caption: "Direct queries compute what building facades see (buildings, sky, water, trees); inverse queries find the facade positions that meet view constraints set in parallel coordinates."
  w: 1600
  h: 552
card:
  image: "/media/projects/neural-3d/card.webp"
  alt: "Direct and inverse view queries over building facades"
links:
  - { kind: github, url: "https://github.com/urban-toolkit/neural-3d" }
  - { kind: paper, bib: cobeli2026neural }
team: [scobeli, komar, rvalenca, nferreira, fmiranda]
paper: cobeli2026neural
arxiv: "2511.14742"
---

Exploring 3D urban datasets is often slow and complex due to occlusion and the need for manual viewpoint adjustments. We introduce a neural field-based, view-driven approach that encodes environments into an efficient implicit representation, enabling both direct queries (like visibility or solar analysis) and inverse queries (to find suggested views). Validated through real-world case studies, our method supports urban analysis tasks such as facade visibility, outdoor space evaluation, and assessing new developments.
