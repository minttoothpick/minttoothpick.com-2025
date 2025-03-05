const Cache = require("@11ty/eleventy-cache-assets");
const { parse } = require("csv-parse/sync");
require("dotenv").config(); // Ensure .env variables are loaded

module.exports = async function() {
  let url = `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEETS_ID}/gviz/tq?tqx=out:csv`;

  var text = await Cache(url, {
    duration: "1h",
    type: "text"
  });

  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
  });

  return records;
};
