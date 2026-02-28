const api = require("../../utils/api");
const logger = require("../../utils/logger");

/**
 * Handles the /birthday remove subcommand.
 * Deletes the user's birthday entry via the API.
 */
module.exports = async (client, interaction) => {
  const discordId = interaction.user.id;
  const guildId = interaction.guild.id;

  logger.info(`[Birthday:Remove] User ${discordId} requested birthday removal`);

  try {
    await api.delete(
      `/birthdays/discord/${discordId}/guild/${guildId}`,
    );

    logger.info(`[Birthday:Remove] Successfully removed birthday for user ${discordId}`);
    return interaction.reply({
      content: "Snowflake has successfully removed your birthday.",
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
    logger.error(`[Birthday:Remove] Error for user ${discordId}:`, errorMessage);
    return interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
};
