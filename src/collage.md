---
layout: layouts/page
title: Collage
---

# My Collage Works

<div class="gallery">
{%- for collage in collections.collages -%}
  <div class="gallery-item">
    <a href="{{ collage.url }}">
      <img src="{{ collage.data.image }}" alt="{{ collage.data.title }}">
      {# <h2>{{ collage.data.title }}</h2> #}
    </a>
  </div>
{%- endfor -%}
</div>