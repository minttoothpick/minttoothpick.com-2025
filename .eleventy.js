module.exports = (config) => {

  /**
   * Collections
   */

  // Collages collection
  config.addCollection("collages", function(collectionApi) {
    return collectionApi.getFilteredByTags("collage");
  });

  // Set directories to pass through to the `dist` folder
  config.addPassthroughCopy('./src/images/');
  config.addPassthroughCopy('./src/css/');

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