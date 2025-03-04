---
layout: layouts/page
title: Collage
---

<div class="gallery">
{%- for collage in collections.collages | reverse -%}
  <figure class="gallery-item">
    <a href="{{ collage.url }}">
      <img src="{{ collage.data.image }}" alt="">
    </a>
    {#
    <figcaption class="text-small">
      <p>{{ collage.data.title }}</p>
    </figcaption>
    #}
  </figure>
{%- endfor -%}
</div>