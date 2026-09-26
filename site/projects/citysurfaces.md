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
  alt: "Sidewalk paving materials mapped in Chicago, Washington DC and Brooklyn"
links:
  - { kind: github, url: "https://github.com/VIDA-NYU/city-surfaces", primary: true }
  - { kind: paper, bib: hosseini2022citysurfaces }
paper: hosseini2022citysurfaces
arxiv: "2201.02260"
---

CitySurfaces is a framework that combines active learning and semantic segmentation to locate, delineate, and classify sidewalk paving materials from street-level images. Our framework adopts a recent high-performing semantic segmentation model (Tao et al., 2020), which uses hierarchical multi-scale attention combined with object-contextual representations.

For more information, see the [GitHub project](https://github.com/VIDA-NYU/city-surfaces).
