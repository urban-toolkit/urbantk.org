---
layout: ProjectPage
name: CitySurfaces
title: City-Scale Semantic Segmentation of Sidewalk Materials
tagline: Segmentation of sidewalk surfaces from street-level images
category: ai
order: 30
accent: "#e67700"
monogram: CS
venue: Sustainable Cities and Society 2022
hero:
  image: "/media/projects/citysurfaces/teaser.webp"
  alt: "Sidewalk paving materials mapped in Chicago, Washington DC and Brooklyn"
  caption: "Paving materials classified from street-level images of Chicago, Washington DC and Brooklyn, none of them in the training data. Thicker lines mark segments whose dominant material is not concrete."
  w: 1600
  h: 417
card:
  image: "/media/projects/citysurfaces/card.webp"
  alt: "Eight kinds of sidewalk paving materials"
links:
  - { kind: github, url: "https://github.com/VIDA-NYU/city-surfaces", primary: true }
  - { kind: paper, bib: hosseini2022citysurfaces }
figures:
  - src: "/media/projects/citysurfaces/fig-materials.webp"
    w: 1600
    h: 981
    caption: "The eight classes of sidewalk surface materials: standard and prevalent materials (top) and materials with distinct uses (bottom)."
    credit: hosseini2022citysurfaces
  - src: "/media/projects/citysurfaces/fig-workflow.webp"
    w: 1600
    h: 708
    caption: "The workflow: initial labels from Boston's sidewalk inventory and street-level images, then active learning rounds that retrain and refine the segmentation model."
    credit: hosseini2022citysurfaces
  - src: "/media/projects/citysurfaces/fig-predictions.webp"
    w: 1600
    h: 619
    caption: "Predictions on the held-out test set, with precise boundaries around poles, plants and fire hydrants."
    credit: hosseini2022citysurfaces
  - src: "/media/projects/citysurfaces/fig-cities.webp"
    w: 1600
    h: 653
    caption: "The distribution of detected materials in six cities, as the log of the number of sidewalk segments with each material."
    credit: hosseini2022citysurfaces
paper: hosseini2022citysurfaces
arxiv: "2201.02260"
---

CitySurfaces is a framework that combines active learning and semantic segmentation to locate, delineate, and classify sidewalk paving materials from street-level images. Our framework adopts a recent high-performing semantic segmentation model (Tao et al., 2020), which uses hierarchical multi-scale attention combined with object-contextual representations.

For more information, see the [GitHub project](https://github.com/VIDA-NYU/city-surfaces).
