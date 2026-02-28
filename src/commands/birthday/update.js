const api = require("../../utils/api");
const logger = require("../../utils/logger");

/**
 * Handles the /birthday update subcommand.
 * Updates the user's existing birthday entry with any provided fields.
 */
module.exports = async (client, interaction) => {
  const day = interaction.options.getString("day");
  const month = interaction.options.getString("month");
  const year = interaction.options.getString("year");
  const timezone = interaction.options.getString("timezone");
  const removeYear = year?.toLowerCase() === "none";
  const userId = interaction.user.id;
  const guildId = interaction.guild.id;

  logger.info(`[Birthday:Update] User ${userId} updating their birthday`);

  // Require at least one field to update
  if (!day && !month && !year && !timezone) {
    return interaction.reply({
      content: "You must provide at least one field to update.",
      ephemeral: true,
    });
  }

  // Validate timezone if provided
  if (timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
    } catch {
      logger.info(
        `[Birthday:Update] Invalid timezone for user ${userId}: ${timezone}`,
      );
      return interaction.reply({
        content:
          "Invalid timezone. Use a valid IANA timezone like `America/New_York` or `Europe/London`.",
        ephemeral: true,
      });
    }
  }

  // Validate year range if provided (skip if user wants to remove it)
  if (year && !removeYear) {
    const parsedYear = parseInt(year, 10);
    if (parsedYear < 1900 || parsedYear > new Date().getFullYear()) {
      logger.info(`[Birthday:Update] Invalid year for user ${userId}: ${year}`);
      return interaction.reply({
        content: "The year is not valid.",
        ephemeral: true,
      });
    }
  }

  // Validate date fields against the existing birthday to prevent invalid combinations
  // e.g. changing year to a non-leap year when day is 29 and month is 2
  if (day || month || year || removeYear) {
    try {
      const { data: current } = await api.get(
        `/birthdays/discord/${userId}/guild/${guildId}`,
      );

      if (!current) {
        return interaction.reply({
          content:
            "You didn't set a birthday in Snowflake yet. Use /birthday set first.",
          ephemeral: true,
        });
      }

      const validateDay = day || String(current.birthDay);
      const validateMonth = month || String(current.birthMonth);
      const validateYear = removeYear
        ? "2024"
        : year || (current.birthYear ? String(current.birthYear) : "2024");

      if (!client.validateDate(validateDay, validateMonth, validateYear)) {
        logger.info(
          `[Birthday:Update] Invalid date combination for user ${userId}`,
        );
        return interaction.reply({
          content: "The resulting date is not valid.",
          ephemeral: true,
        });
      }
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message || "An unexpected error occurred.";
      logger.error(
        { err: err?.response?.data, userId },
        `[Birthday:Update] Error fetching current birthday for user ${userId}`,
      );
      return interaction.reply({
        content: errorMessage,
        ephemeral: true,
      });
    }
  }

  try {
    // Build the update payload with only the provided fields
    const updateData = {};
    if (day) updateData.birthDay = parseInt(day, 10);
    if (month) updateData.birthMonth = parseInt(month, 10);
    if (removeYear) updateData.birthYear = null;
    else if (year) updateData.birthYear = parseInt(year, 10);
    if (timezone) updateData.timezone = timezone;

    await api.patch(
      `/birthdays/discord/${userId}/guild/${guildId}`,
      updateData,
    );

    logger.info(`[Birthday:Update] Birthday updated for user ${userId}`);
    return interaction.reply({
      content: "Your birthday has been updated.",
      ephemeral: true,
    });
  } catch (err) {
    const errorMessage =
      err?.response?.data?.message || "An unexpected error occurred.";
    logger.error(
      { err: err?.response?.data, userId },
      `[Birthday:Update] Error for user ${userId}`,
    );
    return interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
};
