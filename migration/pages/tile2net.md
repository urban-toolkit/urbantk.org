<!-- draft converted from https://urbantk.org/tile2net/; source material only -->

## tile2net

![](https://urbantk.org/wp-content/uploads/2023/12/overview-1.jpg)

Tile2Net is an end-to-end tool for automated mapping of pedestrian infrastructure from aerial imagery. We trained a semantic segmentation model to detect roads, sidewalk, crosswalk, and footpath from orthorectified imagery. The results are then converted to geo-referenced polygons and finally a topologically interconnected centerline network is generated. This work is as an important step towards a robust and open-source framework that enables comprehensive digitization of pedestrian infrastructure, which we argue to be a key missing link to more accurate and reliable pedestrian modeling and analyses. By offering low-cost solutions to create planimetric dataset describing pedestrian environment, we enable cities with a tight budget to create datasets describing pedestrian environment which otherwise would not be possible at a comparable cost and time.

The model is presented in our [paper](https://www.sciencedirect.com/science/article/pii/S0198971523000133) published at the _Computers Environment and Urban Systems_ journal.

**Mapping the walk: A scalable computer vision approach for generating sidewalk network datasets from aerial imagery**  
Maryam Hosseini, Andres Sevtsuk, Fabio Miranda, Roberto M. Cesar Jr, Claudio T. Silva  
_Computers, Environment and Urban Systems, 101 (2023) 101950_

For a detailed overview of tile2net, check our Github: [https://github.com/VIDA-NYU/tile2net](https://github.com/VIDA-NYU/tile2net)
