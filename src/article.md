---
title: Article
layout: layouts/article.html
---
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

```css
.imageRow {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.imageRow img {
  width: 100%;
}

@media (min-width: 600px) {
  .imageRow {
    flex-direction: row;
  }

  .imageRow__item {
    flex: var(--aspect-ratio);
    min-width: 0; /* Prevents flex items from overflowing */
  }
}
```

{% imageRow [
  { src: "/collage/vigilled-wafted-flung.jpg", alt: "Greyscale figure crouching with bright orange eyes and floating orange crescents." },
  { src: "/collage/moontuck.jpg", alt: "Description of photo 2" },
  { src: "/collage/a-fifth-attempt-at-certainty.jpg", alt: "Description of photo 3" }
], "Optional caption for this set of images" %}

Lorem ipsum odor amet, consectetuer adipiscing elit. Sit mollis primis taciti, mi sodales ornare. In donec leo natoque libero facilisis euismod habitasse. Ac sagittis mauris dui nam vehicula leo suspendisse. Cras nunc sem adipiscing luctus viverra luctus fames. Donec aenean montes malesuada enim sociosqu metus. Facilisi feugiat maecenas lacus risus donec.

Here’s another **prose-width** paragraph after the image.

More prose text to wrap up the article.