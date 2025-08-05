# 08 - <i class="fa-solid fa-location-crosshairs"></i> Colocalization

## Lesson Overview

In this lesson, we will explore the concept of colocalization in microscopy images. We will begin by understanding what colocalization is — and what it is not. Then, we will provide an overview of different approaches to measure it, including pixel intensity-based and object-based methods. For each approach, we will then demonstrate how to implement common colocalization techniques using Python.

### Slides

<a
    class="custom-button custom-download-button" href="../../pdfs/08_colocalization/bobiac_coloc.pdf" download> <i class="fas fa-download"></i> Download the Slides
</a>

<div align="center">
  <iframe class="custom-pdf-frame-169" src="../../pdfs/08_colocalization/bobiac_coloc.pdf"> </iframe>
</div>

## Pixel intensity-based colocalization

Pixel intensity-based colocalization methods analyze the correlation between the intensities of different channels at the pixel level. In this section we will explore how to use Python to implement the Pearson's correlation coefficient and the Manders' correlation coefficient, two common methods for measuring colocalization as well as some statistical validation methods to assess the significance of the observed colocalization.

## Object-based colocalization

Often when biological structures of interest are segmentable, they can be treated as objects.  
Objects are anything that can be meaningfully counted. For example:  

Points are objects that may, for instance, represent proteins of interest.  
Lines are objects that may, for instance, represent tissue boundaries.  
Areas are objects that may, for instance, represent nuclei or vesicles.  

In this notebook we analyse the spatial properties of points. This includes:  

- Mean distance to nearest neighbor  
- Nearest neighbor function  
- Ripley's K function  
- What is a null distribution  
- Using monte carlo simulations for statistical validation  

Although points are the simplest type of object, many of the learned concepts are generalizable to more complex types of objects.  

### Slides

<a
    class="custom-button custom-download-button" href="../../pdfs/08_colocalization/practical_object_based_coloc.pdf" download> <i class="fas fa-download"></i> Download the Slides
</a>

<div align="center">
  <iframe class="custom-pdf-frame-169" src="../../pdfs/08_colocalization/practical_object_based_coloc.pdf"> </iframe>
</div>