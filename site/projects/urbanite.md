---
layout: ProjectPage
name: Urbanite
title: A Dataflow-Based Framework for Human-AI Interactive Alignment in Urban Visual Analytics
tagline: Dataflow-based framework for Human-AI alignment in urban visual analytics
category: dataflow
order: 20
accent: "#7048e8"
logo: /media/projects/urbanite/logo.webp
hero:
  image: "/media/projects/urbanite/teaser.webp"
  alt: "Analyzing flood simulations with Urbanite"
  caption: "Analyzing flood simulations: provenance and data inspection, simulation nodes documented with dataflow- and node-level explanations, and results shown with UTK nodes."
  w: 1600
  h: 630
card:
  image: "/media/projects/urbanite/card.webp"
  alt: "Urbanite's interface"
links:
  - { kind: github, url: "https://github.com/urban-toolkit/urbanite" }
  - { kind: paper, bib: moreira2026urbanite }
figures:
  - src: "/media/projects/urbanite/fig-interface.webp"
    w: 1600
    h: 909
    caption: "Urbanite's interface and its features for human-AI alignment: task, suggestions, explanations, node logic, subtasks and an LLM chat."
    credit: moreira2026urbanite
  - src: "/media/projects/urbanite/fig-sidewalk.webp"
    w: 1600
    h: 472
    caption: "Analyzing Project Sidewalk accessibility data: the LLM proposes a first dataflow from the task, and the user accepts, generates and edits nodes for scores, charts and uncertainty."
    credit: moreira2026urbanite
  - src: "/media/projects/urbanite/fig-urban-pulse.webp"
    w: 1600
    h: 437
    caption: "Reproducing Urban Pulse: code to load the pulse data, generated subtasks, a UTK map and a suggested, interactive Vega-Lite view."
    credit: moreira2026urbanite
team: [gmoreira, lferreira, mhosseini, cveiga, fmiranda]
paper: moreira2026urbanite
arxiv: "2508.07390"
---

Urbanite is a framework for human-AI collaboration in urban visual analytics that leverages a dataflow-based model allowing users to specify intent at multiple scopes, enabling interactive alignment across specification, process, and evaluation stages. The framework incorporates features for explainability, multi-resolution task definition across dataflows, nodes, and parameters, and supporting interaction provenance based on findings from a survey identifying existing challenges.
