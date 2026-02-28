const api = require("../../utils/api");
const { EmbedBuilder } = require("discord.js");
const logger = require("../../utils/logger");
const formatBirthday = require("../../utils/format-birthday");

/**
 * Handles the /birthday view subcommand.
 * Retrieves and displays the invoking user's own birthday.
 */
module.exports = async (client, interaction) => {
  const discordId = interaction.user.id;
  const guildId = interaction.guild.id;

  logger.info(`[Birthday:View] User ${discordId} viewing their birthday`);

  try {
    const { data: birthday } = await api.get(
      `/birthdays/discord/${discordId}/guild/${guildId}`,
    );

    const dateStr = formatBirthday(birthday.birthDay, birthday.birthMonth, birthday.birthYear);
    const user = interaction.user;

    const birthdayEmbed = new EmbedBuilder()
      .setTitle("\u{1F382} Your Birthday")
      .setColor(0xf8a5c2)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: "\u{1F4C5} Date", value: dateStr, inline: true },
        { name: "\u{1F30D} Timezone", value: birthday.timezone, inline: true },
        { name: birthday.visibility === "public" ? "\u{1F513} Public" : "\u{1F512} Private", value: "\u200b", inline: true },
      )
      .setTimestamp()
      .setFooter({ text: "Snowflake" });

    logger.info(
      `[Birthday:View] Displaying birthday for user ${discordId}: ${dateStr}`,
    );
    return interaction.reply({ embeds: [birthdayEmbed], ephemeral: true });
  } catch (err) {
    if (err?.response?.status === 404) {
      logger.info(`[Birthday:View] No birthday found for user ${discordId}`);
      return interaction.reply({
        content: "You didn't set a birthday in Snowflake yet.",
        ephemeral: true,
      });
    }

    const errorMessage =
      err?.response?.data?.message || "An unexpected error occurred.";
    logger.error(
      { err: err?.response?.data, discordId },
      `[Birthday:View] Error for user ${discordId}`,
    );
    return interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
};
