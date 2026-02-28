const api = require("../../utils/api");
const { EmbedBuilder } = require("discord.js");
const logger = require("../../utils/logger");

/**
 * Handles the /birthday lookup subcommand.
 * Looks up another user's birthday if their visibility is set to public.
 */
module.exports = async (client, interaction) => {
  const fetchedUser = interaction.options.getUser("user");
  const guildId = interaction.guild.id;

  logger.info(`[Birthday:Lookup] User ${interaction.user.id} looking up birthday for ${fetchedUser.id}`);

  try {
    const { data: birthday } = await api.get(
      `/birthdays/discord/${fetchedUser.id}/guild/${guildId}`,
    );

    // Respect the user's privacy setting
    if (birthday.visibility === "private") {
      logger.info(`[Birthday:Lookup] Birthday for user ${fetchedUser.id} is private`);
      return interaction.reply({
        content: "This user has set their birthday to private.",
        ephemeral: true,
      });
    }

    // Format the date for display
    const dateStr = `${client.addZeroAndTrim(birthday.birthDay)}-${client.addZeroAndTrim(birthday.birthMonth)}${birthday.birthYear ? `-${birthday.birthYear}` : ""}`;

    // Build and send the birthday embed
    const birthdayEmbed = new EmbedBuilder()
      .setTitle("Birthday")
      .setColor(0x0099ff)
      .setThumbnail(fetchedUser.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields({
        name: "\u200b",
        value: `${fetchedUser}: ${dateStr}`,
      })
      .setTimestamp()
      .setFooter({ text: "Snowflake" });

    logger.info(`[Birthday:Lookup] Displaying birthday for user ${fetchedUser.id}`);
    return interaction.reply({ embeds: [birthdayEmbed], ephemeral: true });
  } catch (err) {
    if (err?.response?.status === 404) {
      logger.info(`[Birthday:Lookup] No birthday found for target user ${fetchedUser.id}`);
      return interaction.reply({
        content: "This user hasn't set a birthday yet.",
        ephemeral: true,
      });
    }

    const errorMessage =
      err?.response?.data?.message || "An unexpected error occurred.";
    logger.error(`[Birthday:Lookup] Error looking up user ${fetchedUser.id}:`, errorMessage);
    return interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
};
