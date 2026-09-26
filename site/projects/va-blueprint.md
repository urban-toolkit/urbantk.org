---
layout: ProjectPage
name: VA-Blueprint
title: Uncovering Building Blocks for Visual Analytics System Design
tagline: LLM-generated knowledge base for visual analytics system components
category: knowledge
order: 10
accent: "#1c4f8a"
logo: /media/projects/va-blueprint/logo.png
hero:
  image: "/media/projects/va-blueprint/teaser.webp"
  alt: "From visual analytics papers to a hierarchical blueprint of system components"
  caption: "VA-Blueprint turns visual analytics papers into a hierarchical JSON blueprint of each system: its components at several levels of abstraction and their dependencies."
  w: 1600
  h: 568
card:
  image: "/media/projects/va-blueprint/card.webp"
  alt: "The blueprint of a visual analytics system"
links:
  - { kind: demo, url: "https://leovsferreira.github.io/va-building-blocks/", label: VA-Blueprint interface, primary: true }
  - { kind: github, url: "https://github.com/urban-toolkit/va-blueprint" }
  - { kind: paper, bib: ferreira2026vablueprint }
figures:
  - src: "/media/projects/va-blueprint/fig-process.webp"
    w: 1600
    h: 826
    caption: "Building the knowledge base: 20 papers analyzed by hand define the schema, LLM extraction covers the other 81, and a human-in-the-loop review refines the results for all 101 systems."
    credit: ferreira2026vablueprint
  - src: "/media/projects/va-blueprint/fig-interface.webp"
    w: 1600
    h: 1526
    caption: "The interface shows a system's blueprint: high-level blocks organize intermediate blocks, whose nodes are granular blocks connected by data and interaction dependencies."
    credit: ferreira2026vablueprint
  - src: "/media/projects/va-blueprint/fig-taxivis.webp"
    w: 1600
    h: 603
    caption: "The blueprint of TaxiVis: trip data, a spatiotemporal index and a visual query engine feed geospatial and information visualizations, and filters loop back to the query engine."
    credit: ferreira2026vablueprint
  - src: "/media/projects/va-blueprint/fig-dependencies.webp"
    w: 1600
    h: 810
    caption: "The most frequent dependencies between components across the knowledge base, by hierarchy level."
    credit: ferreira2026vablueprint
team: [lferreira, gmoreira, fmiranda]
paper: ferreira2026vablueprint
arxiv: "2508.07497"
---

VA-Blueprint presents a methodology and the resulting knowledge base for uncovering and structuring the fundamental building blocks of Visual Analytics (VA) systems. We systematically extracted and organized components, operations, and their dependencies from a corpus of existing VA system research papers. The core of the approach involves a multi-level hierarchical structure (High Blocks, Intermediate Blocks, Granular Blocks) formalized into a blueprint (represented as JSON) that details system composition and data/interaction flows. This knowledge base, encompassing 101 systems, was constructed via initial manual analysis followed by Large Language Model (LLM) automation for scalable extraction. The goal is to provide a structured, queryable repository that reveals common design patterns and architectures, thereby offering a practical foundation to support more structured, reproducible, and efficient VA system development, comparison, and understanding.
