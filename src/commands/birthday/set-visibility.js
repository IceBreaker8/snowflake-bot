const api = require("../../utils/api");
const logger = require("../../utils/logger");

/**
 * Handles the /birthday set-visibility subcommand.
 * Updates the visibility (public/private) of the user's birthday entry.
 */
module.exports = async (client, interaction) => {
  const discordId = interaction.user.id;
  const guildId = interaction.guild.id;
  const visibility = interaction.options.getString("visibility");

  logger.info(`[Birthday:SetVisibility] User ${discordId} setting visibility to "${visibility}"`);

  try {
    await api.patch(
      `/birthdays/discord/${discordId}/guild/${guildId}`,
      { visibility },
    );

    logger.info(`[Birthday:SetVisibility] Visibility updated to "${visibility}" for user ${discordId}`);
    return interaction.reply({
      content: `You set your birthday visibility to ${visibility}.`,
      ephemeral: true,
    });
  } catch (err) {
    if (err?.response?.status === 404) {
      return interaction.reply({
        content: "You didn't set a birthday in Snowflake yet.",
        ephemeral: true,
      });
    }

    const errorMessage =
      err?.response?.data?.message || "An unexpected error occurred.";
    logger.error(`[Birthday:SetVisibility] Error for user ${discordId}:`, errorMessage);
    return interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
};
