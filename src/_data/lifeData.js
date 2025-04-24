const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const dayjs = require("dayjs");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
dayjs.extend(isSameOrAfter);

function loadLifeEvents() {
  const filePath = path.join(__dirname, "lifeEvents.yaml");
  const fileContents = fs.readFileSync(filePath, "utf8");
  return yaml.load(fileContents);
}

module.exports = function(data) {
  const lifeEvents = loadLifeEvents();
  const startDateStr = data.start_date || "1985-02-11";
  const endYear = data.end_year || 2086;

  const startDate = dayjs(startDateStr);
  const endDate = dayjs(`${endYear}-01-01`);

  // Create an array of weeks between start and end date
  const weeks = [];
  let current = startDate.startOf("week");
  let i = 0;
  while (current.isBefore(endDate)) {
    const weekStart = current;
    const weekEnd = current.add(1, "week");
    weeks.push({
      date: weekStart.format("YYYY-MM-DD"),
      weekStart: weekStart.format("YYYY-MM-DD"),
      weekEnd: weekEnd.format("YYYY-MM-DD"),
      index: i,
      events: []
    });
    current = weekEnd;
    i++;
  }

  // Preprocess events into an array with parsed dates
  const allEvents = [];
  for (const [dateStr, eventsArr] of Object.entries(lifeEvents)) {
    const parsedDate = dayjs(dateStr);
    if (!parsedDate.isValid()) {
      console.warn(`Invalid date: ${dateStr}`);
      continue;
    }
    for (const event of eventsArr) {
      allEvents.push({
        ...event,
        date: dateStr,
        dateObj: parsedDate
      });
    }
  }

  // For each week, find events that fall within that week
  for (const week of weeks) {
    const weekStart = dayjs(week.weekStart);
    const weekEnd = dayjs(week.weekEnd);
    week.events = allEvents.filter(event =>
      event.dateObj.isSameOrAfter(weekStart) && event.dateObj.isBefore(weekEnd)
    );
  }

  return weeks;
};
