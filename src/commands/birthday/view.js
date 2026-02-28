const api = require("../../utils/api");
const { EmbedBuilder } = require("discord.js");
const logger = require("../../utils/logger");

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

    const dateStr = `${client.addZeroAndTrim(birthday.birthDay)}-${client.addZeroAndTrim(birthday.birthMonth)}${birthday.birthYear ? `-${birthday.birthYear}` : ""}`;
    const user = interaction.user;

    const birthdayEmbed = new EmbedBuilder()
      .setTitle("Your Birthday")
      .setColor(0x0099ff)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: "Date", value: dateStr, inline: true },
        { name: "Timezone", value: birthday.timezone, inline: true },
        { name: "Visibility", value: birthday.visibility, inline: true },
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
    logger.error(`[Birthday:View] Error for user ${discordId}:`, errorMessage);
    return interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
};
