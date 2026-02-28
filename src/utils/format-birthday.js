const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Formats a birthday into a readable string.
 * e.g. "March 15, 2000" or "March 15" if no year.
 */
function formatBirthday(day, month, year) {
  const monthName = MONTHS[month - 1] || "Unknown";
  return year ? `${monthName} ${day}, ${year}` : `${monthName} ${day}`;
}

module.exports = formatBirthday;
