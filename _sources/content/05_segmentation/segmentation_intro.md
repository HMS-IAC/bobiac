# <strong>05</strong> - <i class="fa-solid fa-disease"></i> Semantic & Instance Segmentation

**Segmentation** is a fundamental image analysis technique in bioimage analysis that involves **partitioning an image into distinct regions or objects** based on specific criteria such as intensity, color, texture, or morphological features. This process is essential for quantitative analysis of biological structures, enabling researchers to measure, count, and characterize individual cells, organelles, or other biological entities within complex images.

There are two primary types of segmentation approaches: **semantic segmentation** and **instance segmentation**.

**Semantic segmentation** classifies each pixel in an image into predefined categories (e.g., background, nuclei, cytoplasm), treating all objects of the same class as a single entity without distinguishing between individual instances.

In contrast, **instance segmentation** goes a step further by not only classifying pixels but also **distinguishing between separate objects** of the same class, providing unique labels for each individual object (e.g., identifying cell #1, cell #2, etc.).

<div align="center"> <img class="custom-image" src="../../../_static/images/seg.png" alt="Ilastik Logo" width="700"> </div><br>

During the course we will explore different approaches to semantic and instance segmentation. We will first follow a [**classical approach**](./classic/classic.md) based on *filtering* and *thresholding*, then we will explore [**machine learning** methods using the **Ilastik**](./machine_learning/machine_learning_with_ilastik.md) open-source software, and finally we will delve into [**deep learning** methods using **Cellpose**](./deep_learning/deep_learning_with_cellpose.md).

***TODO: UPDATE LINK TO SECTIONS***

## Table of Contents

- [Classical Segmentation](./classic/classic.md)
- [Machine Learning: Ilastik](./machine_learning/machine_learning_with_ilastik.md)
- [Deep Learning: Cellpose](./deep_learning/deep_learning_with_cellpose.md)
