<!-- draft converted from https://urbantk.org/shadows/; source material only -->

## Deep Umbra

Deep Umbra is a a novel computational framework that enables the quantification of sunlight access and shadows at a global scale. Our framework is based on a generative adversarial network that considers the physical form of cities to compute high-resolution spatial information of accumulated sunlight access for the different seasons of the year. Deep Umbra’s primary motivation is the impact that shadow management can have in people’s quality of live, since it can affect levels of comfort, heat distribution, public parks, etc.

We also present the Global Shadow Dataset, a comprehensive dataset with the accumulated shadow information for over 100 cities in 6 continents. In order to visualize the data, click [here](http://evl.uic.edu/shadows/map/). To download the data, click [here](https://osf.io/4yztn/).

![](https://urbantk.org/wp-content/uploads/2023/12/overview.jpg)

## Abstract

Sunlight and shadow play critical roles in how urban spaces are utilized, thrive, and grow. While access to sunlight is essential to the success of urban environment, shadows can provide shaded places for stay during the hot seasons, prevent heat island effect, and increase the pedestrian level of comfort. Properly quantifying sunlight access and shadows in large urban environments is key in tackling some of the important challenges facing cities today. In this paper, we propose Deep Umbra, a novel computational framework that enables the quantification of sunlight access and shadows at a global scale. Our framework is based on a generative adversarial network that considers the physical form of cities to compute high-resolution spatial information of accumulated sunlight access for the different seasons of the year. We use data from seven different cities to train our model, and show, through an extensive set of experiments, its low overall RMSE (below 0.1) as well as its extensibility to cities that were not part of the training set. We also contribute a set of case studies and a comprehensive dataset with the sunlight access information for more than 100 cities throughout six continents of the world.

## Accumulated shadow

The image below illustrates our accumulative approach. Two different types of shadows in Chicago are shown. Left: Example of a single timestep shadow . Right: accumulated shadows considering the time range 10 AM to 4 PM. By accumulating shadows between a time range, we can comprehensively analyze the impact of buildings on sunlight access in public spaces.

![](https://urbantk.org/wp-content/uploads/2023/12/accumulation.png)

## Results

Results with tiles from Chicago, Buenos Aires and Tokyo. The examples come from different seasons of the year, but use the same colorscale where darker shades of red correspond to greater shadow coverage during the accumulation period.

![](https://urbantk.org/wp-content/uploads/2023/12/results.jpg)

## Web viewer

Using the [web interface](http://evl.uic.edu/shadows/map/) to visualize accumulated shadow cast over parks in Paris. Left image highlights six parks divided into four categories of sunlight access during winter: 1) high sunlight access, 2) moderate sunlight access, 3) partial overshadowing and 4) significant overshadowing. Right images highlight shadow accumulation in one park (Square Saint Lambert) in the different seasons of the year.

![Accumulation](https://www.evl.uic.edu/shadows/images/web.png)

## Links

Shadow accumulation data for more than 100 cities: [Link](https://osf.io/4yztn/)  
Model code: [Link](https://github.com/uic-evl/deep-umbra)  
Web viewer: [Link](http://evl.uic.edu/shadows/map/)

Preprint:

## Team

**Kazi Shahrukh Omar**  
University of Illinois at Chicago

**Gustavo Moreira**  
Universidade Federal Fluminense

**Daniel Hodczak**  
University of Illinois at Chicago

**Maryam Hosseini**  
Rutgers University & New York University

**Marcos Lage**  
Universidade Federal Fluminense

**[Fabio Miranda](https://fmiranda.me)**  
University of Illinois at Chicago
