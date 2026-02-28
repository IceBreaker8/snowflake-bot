const api = require("../../utils/api");
const { EmbedBuilder } = require("discord.js");
const logger = require("../../utils/logger");

/**
 * Handles the /birthday list subcommand.
 * Fetches all public birthdays for this guild and displays them in an embed.
 */
module.exports = async (client, interaction) => {
  const guildId = interaction.guild.id;

  logger.info(`[Birthday:List] User ${interaction.user.id} requested the public birthday list`);

  try {
    const { data: publicBirthdays } = await api.get(
      `/birthdays/guild/${guildId}/public`,
    );

    logger.info(`[Birthday:List] Found ${publicBirthdays.length} public birthdays`);

    // Resolve each birthday's Discord user in parallel
    const resolvedBirthdays = await Promise.all(
      publicBirthdays.map(async (birthday) => {
        const member = await interaction.guild.members.fetch(birthday.discordId);
        const dateStr = `${client.addZeroAndTrim(birthday.birthDay)}-${client.addZeroAndTrim(birthday.birthMonth)}${birthday.birthYear ? `-${birthday.birthYear}` : ""}`;
        return { member, dateStr };
      }),
    );

    // Build the display string
    const embedValue = resolvedBirthdays
      .map(({ member, dateStr }) => `${member}: ${dateStr}`)
      .join("\n");

    const birthdayListEmbed = new EmbedBuilder()
      .setTitle("Birthdays")
      .setColor(0x0099ff)
      .setThumbnail(
        "https://img.icons8.com/?size=100&id=123624&format=png&color=000000",
      )
      .addFields({
        name: "\u200b",
        value: embedValue || "There are no public birthdays set in Snowflake.",
      })
      .setTimestamp()
      .setFooter({ text: "Snowflake" });

    return interaction.reply({ embeds: [birthdayListEmbed] });
  } catch (err) {
    const errorMessage =
      err?.response?.data?.message || "An unexpected error occurred.";
    logger.error(`[Birthday:List] Error:`, errorMessage);
    return interaction.reply({
      content: errorMessage,
      ephemeral: true,
    });
  }
};
