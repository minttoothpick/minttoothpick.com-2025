const dotenv = require("dotenv").config();
const Image = require("@11ty/eleventy-img"); // Ensure this is correctly imported
const path = require("path");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const yaml = require("js-yaml");

module.exports = (eleventyConfig) => {

  /* Collections
   ======================================================================== */

  /**
   * Art collection
   */
  eleventyConfig.addCollection("art", function(collectionApi) {
    return collectionApi.getFilteredByGlob("art/*.md");
  });

  /**
   * Blog collection
   */
  // Returns a collection of blog posts in reverse date order
  eleventyConfig.addCollection("blog", (collection) => {
    // Spread syntax creates a copy of the original array
    return [...collection.getFilteredByGlob("./src/posts/*.md")].reverse();
  });

  /**
   * Books with drawings
   * https://11ty.rocks/eleventyjs/collections/#collections-from-custom-data
   */
  eleventyConfig.addCollection("booksWithDrawings", (collection) => {
    const myBooks = collection.getAll()[0].data.books;
    const myBooksFiltered = myBooks.filter((d) => (d.drawing.includes("TRUE")));
    // Sort books by finish date
    return myBooksFiltered.sort((a, b) => (b.finish) > (a.finish) ? 1 : -1);
  });

  /**
   * Collages collection
   */
  eleventyConfig.addCollection("collages", function(collectionApi) {
    return collectionApi.getFilteredByTags("collage");
  });

  /* Shortcodes
   ======================================================================== */

  eleventyConfig.addNunjucksAsyncShortcode("imageRow", async function(images, caption = "") {
    try {
      const imageData = await Promise.all(
        images.map(async (image) => {
          const fullImagePath = `src/images${image.src}`;

          const metadata = await Image(fullImagePath, {
            widths: [300, 600, 900, 1200],
            formats: ["jpeg"],
            outputDir: "./dist/images/",
            urlPath: "/images/",
            filenameFormat: (id, src, width, format) => {
              const filename = path.basename(src, path.extname(src));
              return `${filename}-${width}w.${format}`;
            },
          });

          const data = metadata.jpeg;
          const largestImage = data[data.length - 1];
          return {
            srcset: data.map(entry => `${entry.url} ${entry.width}w`).join(", "),
            placeholder: data[0].url,
            aspectRatio: largestImage.width / largestImage.height,
            alt: image.alt || ""
          };
        })
      );

      const captionHtml = caption ? `<figcaption class="text-small">${caption}</figcaption>` : "";

      return `<figure class="flow-condensed">
        <div class="imageRow">
          ${imageData
            .map(
              (img) =>
                `<div class="imageRow__item" style="--aspect-ratio: ${img.aspectRatio}">
                  <img src="${img.placeholder}"
                       data-srcset="${img.srcset}"
                       data-sizes="auto"
                       decoding="async"
                       class="lazyload"
                       loading="lazy"
                       alt="${img.alt}">
                </div>`
            )
            .join("")}
        </div>
        ${captionHtml}
      </figure>`;
    } catch (error) {
      console.error("Error processing image row: ", error);
      return `<div class="error">Image could not be displayed.</div>`;
    }
  });

  eleventyConfig.addNunjucksAsyncShortcode("bookImage", async function(slug, alt) {
    if (!slug) return ""; // No slug, no image

    let inputPath = `./src/images/books/${slug}.png`;
    let outputDir = "./dist/images/books/";

    try {
      let metadata = await Image(inputPath, {
        widths: [200, 400, 600],
        formats: ["webp", "jpeg"],
        outputDir: outputDir,
        urlPath: "/images/books/",
        filenameFormat: function (id, src, width, format) {
          return `${slug}-${width}.${format}`;
        },
      });

      let imageAttributes = {
        alt: alt,
        width: null,
        height: null,
        sizes: "(max-width: 600px) 100vw, 50vw",
        loading: "lazy",
        decoding: "async",
      };

      let html = Image.generateHTML(metadata, imageAttributes);
      // Remove any width/height attributes
      html = html.replace(/width="\d+"/g, "").replace(/height="\d+"/g, "");
      return html;

    } catch (error) {
      console.warn(`⚠️ Image processing failed for ${slug}:`, error.message);
      return ""; // Fail gracefully if the image is missing
    }
  });

  /* Filters
   ======================================================================== */

  /* Replace spaces with `&nbsp;` */
  eleventyConfig.addFilter("nbsp", function(str) {
    return str.replace(/ /g, "&nbsp;");
  });

  eleventyConfig.addFilter("range", (start, end) => {
    return Array.from({ length: end - start + 1 }, (v, k) => k + start);
  });

  /**
    * Pad numbers with leading zeros
    *
    * https://gist.github.com/endel/321925f6cafa25bbfbde
    */
    eleventyConfig.addFilter("padZeros", (myString, zeros) => {
      var s = String(myString);
      while (s.length < (zeros || 2)) { s = "0" + s; }
      return s;
    });

  /* Other options
   ======================================================================== */

  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  /**
   * Add YAML as custom data file format
   *
   * https://www.11ty.dev/docs/data-custom/
   */
  eleventyConfig.addDataExtension("yaml", (contents) => yaml.load(contents));

  // Set directories to pass through to the `dist` folder
  eleventyConfig.addPassthroughCopy("./src/images/");
  eleventyConfig.addPassthroughCopy("./src/fonts");

  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "dist",
    },
  };

};