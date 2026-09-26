---
layout: ProjectPage
name: Autark
title: A Serverless Toolkit for Prototyping Urban Visual Analytics Systems
tagline: Load, process, and visualize geospatial data entirely in the browser
category: grammars
order: 30
accent: "#8da0cb"
logo: /media/projects/autark/logo.svg
logoOnDark: /media/projects/autark/logo-dark.svg
hero:
  image: "/media/projects/autark/teaser.webp"
  alt: "Urbane rebuilt with Autark"
  caption: "Urbane, a multi-resolution urban visual analytics system, rebuilt with Autark: OpenStreetMap data, sky exposure computed on the GPU, neighborhood and building views, and linked charts."
  w: 1600
  h: 562
card:
  image: "/media/projects/autark/card.webp"
  alt: "Noise complaints over 3D buildings, rendered with Autark from a notebook"
links:
  - { kind: website, url: "https://autarkjs.org", label: autarkjs.org, primary: true }
  - { kind: docs, url: "https://autarkjs.org/introduction", label: Get started }
  - { kind: demo, url: "https://autarkjs.org/gallery/", label: Gallery }
  - { kind: github, url: "https://github.com/urban-toolkit/autark" }
  - { kind: npm, url: "https://www.npmjs.com/package/@urban-toolkit/autk" }
  - { kind: paper, bib: alexandre2026autark }
figures:
  - src: "/media/projects/autark/fig-architecture.webp"
    w: 1600
    h: 894
    caption: "Autark's serverless architecture: four independent modules that exchange feature collections and selections through their APIs."
    credit: alexandre2026autark
  - src: "/media/projects/autark/fig-chicago-shadows.webp"
    w: 1600
    h: 527
    caption: "Shadow accumulation in the Chicago Loop at the summer solstice, the autumnal equinox and the winter solstice, with linked histograms and a map."
    credit: alexandre2026autark
  - src: "/media/projects/autark/fig-niteroi-heat.webp"
    w: 1600
    h: 530
    caption: "Urban heat trends in Niterói from 2001 to 2024: land surface temperature on road segments, a regression computed in parallel for each segment, and linked charts."
    credit: alexandre2026autark
  - src: "/media/projects/autark/fig-jupyter.webp"
    w: 1600
    h: 1014
    caption: "Autark in a Jupyter notebook, through a wrapper that its serverless architecture makes possible."
    credit: alexandre2026autark
paper: alexandre2026autark
arxiv: "2604.20759"
---

Autark is a serverless toolkit for prototyping urban visual analytics systems. It loads, processes, and visualizes geospatial data entirely in the browser, through four packages:

- **autk-db**: run geospatial queries in the browser, compatible with OpenStreetMap, GeoJSON, GeoTIFF, and CSV.
- **autk-map**: render 2D and 3D maps using WebGPU, handling map layers directly on the canvas without a tile server.
- **autk-compute**: run custom analytical tasks on GeoJSON datasets, processing feature sets without a backend.
- **autk-plot**: render interactive D3.js charts for urban datasets, linked to the map for coordinated views.

Autark can also be used through a grammar, [autk-grammar](https://autarkjs.org/grammar/). Documentation, examples and a gallery are at [autarkjs.org](https://autarkjs.org).
