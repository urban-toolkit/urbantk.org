---
layout: ProjectPage
name: Curio
title: A Dataflow-Based Framework for Collaborative Urban Visual Analytics
tagline: Dataflow-based framework for collaboration in urban visual analytics
category: dataflow
order: 10
accent: "#e8590c"
logo: /media/projects/curio/logo.png
hero:
  image: /media/projects/curio/banner.webp
  alt: Dataflows built in Curio for urban accessibility, climate and sunlight access studies
  w: 1600
  h: 449
  video: https://github.com/urban-toolkit/curio/assets/2387594/6d29bda8-5e94-4496-a4ae-fd55adff024f
card:
  image: "/media/projects/curio/card.webp"
  alt: "A Curio dataflow analyzing the shadow impact of a proposed building in Boston"
links:
  - { kind: demo, url: "https://curio.urbantk.org", label: Try Curio online, primary: true }
  - { kind: install, url: "https://github.com/urban-toolkit/curio/blob/main/docs/USAGE.md" }
  - { kind: tutorials, url: "https://github.com/urban-toolkit/curio/blob/main/docs/QUICK-START.md", label: Getting started }
  - { kind: docs, url: "https://github.com/urban-toolkit/curio/blob/main/docs/README.md" }
  - { kind: github, url: "https://github.com/urban-toolkit/curio" }
  - { kind: paper, bib: moreira2025curio }
  - { kind: pypi, url: "https://pypi.org/project/utk-curio/" }
  - { kind: discord, url: "https://discord.gg/ajT6wF8TmN" }
more:
  - title: Provenance-aware dataflow
    text: "Track every transformation and visualization step."
  - title: Linked interactions
    text: "Data-driven filtering and brushing across views."
  - title: Autark and Vega-Lite
    text: "2D and 3D maps through Autark, plus Vega-Lite charts."
  - title: Agent Catalog
    text: "Attach AI agents to a node, a connection, or the whole dataflow."
  - title: Jupyter Notebook import
    text: "Bring existing notebooks into Curio dataflows."
  - title: Scenario-oriented analyses
    text: "Multi-user what-if exploration with branching dataflows."
  - title: One-click Node Catalog
    text: "Add packaged nodes from a catalog, or author your own from the canvas."
  - title: Composable node packages
    text: "Mix built-ins, community packages and your own in a single dataflow."
  - title: Reproducible and shareable
    text: "Versioned, forkable .curio.zip archives pin a workflow's exact node set."
  - title: One-click Data Catalog
    text: "Add datasets to a dataflow, or publish your own for everyone on the deployment."
  - title: Bring your own data
    text: "Import CSV, GeoJSON, Parquet, GeoTIFF, Shapefile, or an OSM PBF extract."
  - title: Outputs become inputs
    text: "Node results are saved as computed datasets, with lineage back to the node that made them."
figures:
  - src: "/media/projects/curio/fig-interface.webp"
    w: 1600
    h: 383
    caption: "Curio's interface. Left: its main elements. Center and right: facets connected to the same node, a drop-down menu created by an annotation in a Vega-Lite specification, and a checkbox created by an annotation in Python code."
    credit: moreira2025curio
  - src: "/media/projects/curio/fig-dataflow-model.webp"
    w: 1600
    h: 385
    caption: "The key concepts of the dataflow model: thematic and physical layers are loaded, spatially joined and visualized, and interaction nodes link the views so a selection in one propagates to the others."
    credit: moreira2025curio
  - src: "/media/projects/curio/fig-heterogeneous.webp"
    w: 1600
    h: 528
    caption: "Combining datasets: weather data and the UTCI heat index are joined with Milan's neighborhoods in linked views of heat and older population. Changing two nodes repeats the analysis for Chicago."
    credit: moreira2025curio
  - src: "/media/projects/curio/fig-model-inspection.webp"
    w: 1600
    h: 377
    caption: "Expert-in-the-loop inspection of a computer vision model: training with provenance, uncertainty on unseen images, and an interactive view of that uncertainty across Boston neighborhoods."
    credit: moreira2025curio
team: [gmoreira, mhosseini, cveiga, lalexandre, ncolaninno, doliveira, mlage, nferreira, fmiranda]
paper: moreira2025curio
arxiv: "2408.06139"
---

Curio (Collaborative Urban Insight Observatory) is a framework for collaborative urban visual analytics that uses a dataflow model with multiple abstraction levels (code, grammar, GUI elements) to facilitate collaboration across the design and implementation of visual analytics components. The framework allows experts to intertwine preprocessing, managing, and visualization stages while tracking provenance of code and visualizations.

Try it in the browser at [curio.urbantk.org](https://curio.urbantk.org), or run your own instance with the [installation guide](https://github.com/urban-toolkit/curio/blob/main/docs/USAGE.md).
