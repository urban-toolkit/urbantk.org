---
layout: ProjectPage
name: Curio
title: A Dataflow-Based Framework for Collaborative Urban Visual Analytics
tagline: Dataflow-based framework for collaboration in urban visual analytics
category: dataflow
order: 10
accent: "#e8590c"
logo: /media/projects/curio/logo.webp
hero:
  image: /media/projects/curio/banner.webp
  alt: Dataflows built in Curio for urban accessibility, climate and sunlight access studies
  w: 1600
  h: 449
  video: https://github.com/urban-toolkit/curio/assets/2387594/6d29bda8-5e94-4496-a4ae-fd55adff024f
  poster: /media/projects/curio/clips/vega-lite.webp
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
features:
  - id: build
    title: "Build dataflows from code, grammar and GUI nodes"
    text: "Drag nodes onto the canvas, wire them together and write each step in Python, JavaScript or a visualization grammar. Run one node, or the whole dataflow in order."
    clip: /media/projects/curio/clips/build.mp4
    poster: /media/projects/curio/clips/build.webp
    w: 1280
    h: 768
  - id: data-catalog
    title: "Datasets one click away"
    text: "Browse the Data Catalog and add a dataset to the project, or import your own CSV, GeoJSON, Parquet, GeoTIFF, Shapefile or OSM PBF files. Drag a dataset onto the canvas and Curio writes the loader code for you."
    clip: /media/projects/curio/clips/data-catalog.mp4
    poster: /media/projects/curio/clips/data-catalog.webp
    w: 1280
    h: 768
  - id: vega-lite
    title: "Charts with Vega-Lite"
    text: "Vega-Lite nodes chart the output of any upstream node, so the analysis and its visualizations live in one dataflow."
    clip: /media/projects/curio/clips/vega-lite.mp4
    poster: /media/projects/curio/clips/vega-lite.webp
    w: 1280
    h: 768
  - id: autark
    title: "2D and 3D maps with Autark"
    text: "A single Autark node combines OpenStreetMap and PBF data loading, GPU compute and map rendering."
    clip: /media/projects/curio/clips/autark.mp4
    poster: /media/projects/curio/clips/autark.webp
    w: 1280
    h: 768
  - id: linked-views
    title: "Linked interactions"
    text: "Data-driven filtering and brushing across views: a selection in one view flows through the dataflow to the others."
    clip: /media/projects/curio/clips/linked-views.mp4
    poster: /media/projects/curio/clips/linked-views.webp
    w: 1280
    h: 768
  - id: lineage
    title: "Outputs become inputs"
    text: "Every node run can save its output as a computed dataset, with lineage back to the node and dataflow that produced it, so any intermediate result becomes a reusable input."
    clip: /media/projects/curio/clips/lineage.mp4
    poster: /media/projects/curio/clips/lineage.webp
    w: 1280
    h: 768
  - id: node-catalog
    title: "One-click Node Catalog"
    text: "Add packaged nodes from the catalog with one click, and mix built-ins, community packages and your own in a single dataflow."
    clip: /media/projects/curio/clips/node-catalog.mp4
    poster: /media/projects/curio/clips/node-catalog.webp
    w: 1280
    h: 768
  - id: agents
    title: "AI agents in the dataflow"
    text: "Attach agents from the Agent Catalog to a node, a connection or the whole dataflow, with the LLM of your choice: OpenAI, Anthropic, Gemini or a custom endpoint."
    clip: /media/projects/curio/clips/agents.mp4
    poster: /media/projects/curio/clips/agents.webp
    w: 1280
    h: 768
more:
  - title: "Provenance-aware dataflow"
    text: "Track transformation and visualization steps, and browse the versions of a dataflow."
  - title: "Shareable dashboards"
    text: "Pinned nodes get a page of their own, drawn from the saved outputs. Share the link; nobody has to run anything."
  - title: "Real-time collaboration"
    text: "Co-edit a project with presence, soft locks and shared execution output."
  - title: "Jupyter Notebook import"
    text: "Bring existing notebooks into Curio dataflows."
  - title: "Scenario-oriented analyses"
    text: "Multi-user what-if exploration with branching dataflows."
  - title: "Reproducible and shareable"
    text: "Versioned, forkable .curio.zip archives pin the exact node set of a workflow."
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
