# 06 - <i class="fa-solid fa-shapes"></i> Object Classification

**Object Classification** is a technique that can be used in image analysis to **identify and categorize objects within an image based on their features**, such as shape, color, texture, and size. In this context, an **object** can be defined as a **set of pixels that belongs to a specific area within the image**, such as a cell, tissue region, or any other structure of interest.

This approach is particularly useful in biological applications where you want to distinguish between different types of cells in a tissue, identify different cell cycle stages, classify various tissue areas, categorize different cellular structures based on their morphological characteristics and more.

To implement object classification, **you need both the original image and its corresponding segmentation**. The segmentation defines the boundaries of each object, while the **features are computed from the raw image data within each segmented object area**. This means that while the segmentation tells us *where* the objects are, the classification is based on the intensity, texture, and morphological properties extracted from the original image pixels contained within those segmented regions.

<div align="center"> <img src="../../_static/images/ilastik_obj_classification/inst_to_class.png" alt="Ilastik" width="700"></div>

<br>

In this section, similarly to what we did for [**Pixel Classification**](../05_segmentation/machine_learning/machine_learning_with_ilastik.md), we will use the open-source software [**Ilastik**](https://www.ilastik.org) to perform [**Object Classification**](https://www.ilastik.org/documentation/objects/objects) using **Machine Learning**. In this case, instead of classifying individual pixels, we will **classify entire objects** based on their extracted features.
