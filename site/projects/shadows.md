---
layout: ProjectPage
name: Deep Umbra
title: A Generative Approach for Sunlight Access Computation in Urban Spaces
tagline: Generative approach for city-scale shadow computation
category: ai
order: 10
hero:
  image: "/media/projects/shadows/teaser.webp"
  alt: "A single timestep shadow next to shadows accumulated over a time range, over a 3D city"
  caption: "Left: a single timestep shadow. Right: accumulated shadows over a time range, which show the impact of buildings on sunlight access in public spaces."
  w: 1600
  h: 304
card:
  image: "/media/projects/shadows/card.webp"
  alt: "A single timestep shadow next to shadows accumulated over a time range, over a 3D city"
bubble: { image: /media/projects/shadows/bubble.webp }
links:
  - { kind: data, url: "https://osf.io/4yztn/", label: Global Shadow Dataset, primary: true }
  - { kind: demo, url: "http://evl.uic.edu/shadows/map/", label: Web viewer }
  - { kind: github, url: "https://github.com/uic-evl/deep-umbra", label: Model code }
  - { kind: paper, bib: omar2025deepumbra }
team: [komar, gmoreira, dhodczak, mhosseini, mlage, fmiranda]
paper: omar2025deepumbra
arxiv: "2402.17169"
---

Deep Umbra is a novel computational framework that enables the quantification of sunlight access and shadows at a global scale. Our framework is based on a generative adversarial network that considers the physical form of cities to compute high-resolution spatial information of accumulated sunlight access for the different seasons of the year. Deep Umbra's primary motivation is the impact that shadow management can have in people's quality of life, since it can affect levels of comfort, heat distribution, public parks, etc.

We also present the Global Shadow Dataset, a comprehensive dataset with the accumulated shadow information for over 100 cities in 6 continents. [Download the data](https://osf.io/4yztn/), or explore it in the [web viewer](http://evl.uic.edu/shadows/map/).

## Abstract

Sunlight and shadow play critical roles in how urban spaces are utilized, thrive, and grow. While access to sunlight is essential to the success of urban environment, shadows can provide shaded places for stay during the hot seasons, prevent heat island effect, and increase the pedestrian level of comfort. Properly quantifying sunlight access and shadows in large urban environments is key in tackling some of the important challenges facing cities today. In this paper, we propose Deep Umbra, a novel computational framework that enables the quantification of sunlight access and shadows at a global scale. Our framework is based on a generative adversarial network that considers the physical form of cities to compute high-resolution spatial information of accumulated sunlight access for the different seasons of the year. We use data from seven different cities to train our model, and show, through an extensive set of experiments, its low overall RMSE (below 0.1) as well as its extensibility to cities that were not part of the training set. We also contribute a set of case studies and a comprehensive dataset with the sunlight access information for more than 100 cities throughout six continents of the world.
