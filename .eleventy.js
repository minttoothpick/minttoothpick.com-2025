const dotenv = require("dotenv").config();
const Image = require("@11ty/eleventy-img"); // Ensure this is correctly imported
const path = require("path");

module.exports = (config) => {

  /* Collections
   ======================================================================== */

  /**
   * Collages collection
   */
  config.addCollection("collages", function(collectionApi) {
    return collectionApi.getFilteredByTags("collage");
  });

  /**
   * Art collection
   */
  config.addCollection("art", function(collectionApi) {
    return collectionApi.getFilteredByGlob("art/*.md");
  })

  /**
   * Books with drawings
   * https://11ty.rocks/eleventyjs/collections/#collections-from-custom-data
   */
  config.addCollection("booksWithDrawings", (collection) => {
    const myBooks = collection.getAll()[0].data.books;
    const myBooksFiltered = myBooks.filter((d) => (d.drawing.includes("TRUE")));
    // Sort books by finish date
    return myBooksFiltered.sort((a, b) => (b.finish) > (a.finish) ? 1 : -1);
  });

  /* Shortcodes
   ======================================================================== */

  config.addNunjucksAsyncShortcode("imageRow", async function(images) {
    try {
      const imageData = await Promise.all(images.map(async (imagePath) => {
        // Add your source images directory to the path
        const fullImagePath = `src/images${imagePath}`;

        const metadata = await Image(fullImagePath, {
          widths: [null], // Original size
          formats: ["jpeg"],
          outputDir: "./dist/images/",
          urlPath: "/images/",
          filenameFormat: (id, src, width, format) => {
            // Preserve directory structure
            const pathParts = src.split("/").slice(2); // Remove "src/images" prefix
            return `${pathParts.join("/")}`;
          },
        });

        const data = metadata.jpeg[0];
        return {
          src: data.url,
          aspectRatio: data.width / data.height
        };
      }));

      return `
        <figure class="image-row">
          ${imageData
            .map(
              (img) => `
              <div class="image-row-image" style="--aspect-ratio: ${img.aspectRatio}">
                <img src="${img.src}" alt="">
              </div>`
            )
            .join("")
            .replace(/\n\s*/g, "")}
        </figure>
      `.trim();
    } catch (error) {
      console.error("Error processing image row:", error);
      return `<div class="error">Image processing failed: ${error.message}</div>`;
    }
  });

  config.addNunjucksAsyncShortcode("bookImage", async function(slug, alt) {
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

  // Set directories to pass through to the `dist` folder
  config.addPassthroughCopy("./src/images/");
  config.addPassthroughCopy("./src/fonts");

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