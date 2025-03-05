const dotenv = require("dotenv").config();

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
   * Books with drawings
   * https://11ty.rocks/eleventyjs/collections/#collections-from-custom-data
   */
  config.addCollection("booksWithDrawings", (collection) => {
    const myBooks = collection.getAll()[0].data.books;
    const myBooksFiltered = myBooks.filter((d) => (d.drawing.includes("TRUE")));
    // Sort books by finish date
    return myBooksFiltered.sort((a, b) => (b.finish) > (a.finish) ? 1 : -1);
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