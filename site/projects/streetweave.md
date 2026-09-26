---
layout: ProjectPage
name: StreetWeave
title: A Declarative Grammar for Street-Overlaid Visualization of Multivariate Data
tagline: Grammar for street-overlaid visualizations
category: grammars
order: 20
accent: "#e03e36"
logo: /media/projects/streetweave/logo.png
hero:
  image: "/media/projects/streetweave/teaser.webp"
  alt: "Eight street network visualizations made with StreetWeave"
  caption: "Street and pedestrian network visualizations with StreetWeave: multivariate line maps, pattern-based overlays, bristle maps and charts along streets."
  w: 1600
  h: 577
card:
  image: "/media/projects/streetweave/card.webp"
  alt: "Street-overlaid visualizations made with StreetWeave"
links:
  - { kind: github, url: "https://github.com/urban-toolkit/streetweave" }
  - { kind: paper, bib: srabanti2026streetweave }
figures:
  - src: "/media/projects/streetweave/fig-spatial-relations.webp"
    w: 1600
    h: 354
    caption: "Thematic data joins the street network through spatial relations at each segment or intersection: nearest neighbor, contains and buffer."
    credit: srabanti2026streetweave
  - src: "/media/projects/streetweave/fig-accessibility.webp"
    w: 1600
    h: 609
    caption: "Sidewalk accessibility. Left: three offset lines encode curb ramps, missing sidewalks and surface problems. Right: color and width combine several attributes."
    credit: srabanti2026streetweave
  - src: "/media/projects/streetweave/fig-segments.webp"
    w: 1600
    h: 422
    caption: "Fine-grained analysis of street segments with a line map, a bristle map that adds height, and dual bristle maps aligned left and right."
    credit: srabanti2026streetweave
  - src: "/media/projects/streetweave/fig-charts.webp"
    w: 1600
    h: 2019
    caption: "Crime and 311 service requests as charts on intersections and street segments, perpendicular to the streets (top) or parallel to them (bottom)."
    credit: srabanti2026streetweave
team: [ssrabanti, gmarai, fmiranda]
paper: srabanti2026streetweave
arxiv: "2508.07496"
---

StreetWeave is a declarative grammar that helps users create custom, street-overlaid visualizations of multivariate spatial network data at multiple resolutions. Designed for urban planners, climate researchers, health experts, it removes technical barriers by simplifying the integration of thematic data (like demographics or pollution) with physical data (like street networks) across varying spatial and temporal scales. Based on a review of 45 prior studies, StreetWeave provides a flexible design space that supports rich, domain-specific exploration and analysis without requiring programming expertise.
