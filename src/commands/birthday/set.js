const api = require("../../utils/api");
const logger = require("../../utils/logger");

/**
 * Handles the /birthday set subcommand.
 * Validates user input, checks for duplicates, and stores a new birthday in Strapi.
 */
module.exports = async (client, interaction) => {
  const day = interaction.options.getString("day");
  const month = interaction.options.getString("month");
  const year = interaction.options.getString("year");
  const timezone = interaction.options.getString("timezone");
  const userId = interaction.user.id;
  const guildId = interaction.guild.id;
  const parsedYear = parseInt(year || "2000", 10);

  logger.info(
    `[Birthday:Set] User ${userId} attempting to set birthday: ${day}-${month}${year ? `-${year}` : ""} (${timezone})`,
  );

  // Validate the IANA timezone identifier
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    logger.info(
      `[Birthday:Set] Invalid timezone for user ${userId}: ${timezone}`,
    );
    return interaction.reply({
      content:
        "Invalid timezone. Use a valid IANA timezone like `America/New_York` or `Europe/London`.",
      ephemeral: true,
    });
  }

  // Validate the date (default to 2024 for leap-year support when no year is provided)
  if (!client.validateDate(day, month, year || "2024")) {
    logger.info(`[Birthday:Set] Invalid date for user ${userId}`);
    return interaction.reply({
      content: "The date is not valid.",
      ephemeral: true,
    });
  }

  // Restrict year to a logical range
  if (year && (parsedYear < 1900 || parsedYear > new Date().getFullYear())) {
    logger.info(`[Birthday:Set] Invalid year for user ${userId}: ${year}`);
    return interaction.reply({
      content: "The year is not valid.",
      ephemeral: true,
    });
  }

  try {
    const user = await client.users.fetch(userId);

    await api.post("/birthdays", {
      discordId: userId,
      guildId,
      name: user.globalName,
      birthDay: parseInt(day, 10),
      birthMonth: parseInt(month, 10),
      birthYear: year ? parsedYear : null,
      timezone,
    });

    logger.info(`[Birthday:Set] Birthday stored for user ${userId}`);
    return interaction.reply({
      content: "Your birthday has been added, view it using /birthday view",
      ephemeral: true,
    });
  } catch (err) {
    const errorMessage =
      err?.response?.data?.message || "An unexpected error occurred.";
    logger.error(
      { err: err?.response?.data, userId },
      `[Birthday:Set] Error for user ${userId}`,
    );
    return interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
};
