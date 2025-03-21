const dotenv = require("dotenv").config();
const path = require("path");
const Image = require("@11ty/eleventy-img"); // Ensure this is correctly imported
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = (eleventyConfig) => {

  /* Collections
   ======================================================================== */

  /**
   * Collages collection
   */
  eleventyConfig.addCollection("collages", function(collectionApi) {
    return collectionApi.getFilteredByTags("collage");
  });

  /**
   * Art collection
   */
  eleventyConfig.addCollection("art", function(collectionApi) {
    return collectionApi.getFilteredByGlob("art/*.md");
  })

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

  /* Shortcodes
   ======================================================================== */

  eleventyConfig.addNunjucksAsyncShortcode("imageRow", async function(images, caption="", alts=[]) {
    try {
      const imageData = await Promise.all(
        images.map(async (imagePath) => {
          const fullImagePath = `src/images${imagePath}`;

          const metadata = await Image(fullImagePath, {
            widths: [300, 600, 900],
            formats: ["jpeg"],
            outputDir: "./dist/images/",
            urlPath: "/images/",
            filenameFormat: (id, src, width, format) => {
              const filename = path.basename(src, path.extname(src));
              return `${filename}-${width}w.${format}`;
            },
          });

          const data = metadata.jpeg;
          return {
            srcset: data.map(entry => `${entry.url} ${entry.width}w`).join(", "),
            placeholder: data[0].url,
            // Use largest image to calculate ratio more accurately
            aspectRatio: data[data.length - 1].width / data[data.length - 1].height
          };
        })
      ); // imageData

      const captionHtml = caption ? `<figcaption class="text-small">${caption}</figcaption>` : "";

      return `<figure class="flow-condensed">
        <div class="imageRow">
          ${imageData
            .map(
              (img, index) =>
                `<div class="imageRow__item" style="--aspect-ratio: ${img.aspectRatio}">
                  <img src="${img.placeholder}"
                       data-srcset="${img.srcset}"
                       data-sizes="auto"
                       decoding="async"
                       class="lazyload"
                       loading="lazy"
                       alt="${alts[index] || ""}">
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

      // Use largest jpeg as fallback
      // let image = metadata.jpeg[metadata.jpeg.length - 1];

      // return `
      //   <img
      //     src="${image.url}"
      //     alt="${alt}"
      //     width="${image.width}"
      //     height="${image.height}"
      //     srcset="
      //       ${metadata.webp.map(img => `${img.url} ${img.width}w`).join(", ")}
      //     "
      //     sizes="(max-width: 300px) 40vw, (max-width: 500px) 30vw, (max-width: 750px)"
      //   >
      // `;

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

  /* Other options
   ======================================================================== */

  // Plugins
  eleventyConfig.addPlugin(syntaxHighlight);

  // Set directories to pass through to the `dist` folder
  eleventyConfig.addPassthroughCopy("./src/images/");
  eleventyConfig.addPassthroughCopy("./src/fonts");

  return {
    // Parse .html with Nunjucks
    markdownTemplateEngine: 'njk',
    dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    dir: {
      input: 'src',
      output: 'dist',
    },
  };

};