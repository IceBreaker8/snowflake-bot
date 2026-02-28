const { Events, REST, Routes } = require("discord.js");
const fs = require("fs");
const logger = require("../../utils/logger");

/**
 * Loads all slash commands from src/interactions, registers them with Discord,
 * and attaches interaction listeners to the client.
 */
module.exports = (client) => {
  const commands = [];

  logger.info("Loading commands...");

  // Iterate over each command category directory
  const commandDirs = fs.readdirSync("./src/interactions");

  for (const dir of commandDirs) {
    const commandFiles = fs
      .readdirSync(`./src/interactions/${dir}`)
      .filter((file) => file.endsWith(".js"));

    logger.info({ count: commandFiles.length, category: dir }, "Commands loaded from category");

    for (const file of commandFiles) {
      const command = require(
        `${process.cwd()}/src/interactions/${dir}/${file}`,
      );

      if (!("data" in command) || !("run" in command)) {
        logger.warn(`Skipping ${dir}/${file} — missing "data" or "run" export`);
        continue;
      }

      // Register the command in the client's collection and queue for API registration
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());

      // Attach the interaction listener for this command
      client.on(Events.InteractionCreate, (interaction) => {
        // Handle autocomplete interactions separately
        if (interaction.isAutocomplete() && interaction.commandName === command.data.name) {
          if (typeof command.autocomplete === "function") {
            command.autocomplete(client, interaction);
          }
          return;
        }

        command.run(client, interaction, null);
      });

      // Extract subcommand names from the command's options
      const subcommands = command.data.options
        ?.filter((opt) => opt.toJSON().type === 1)
        .map((opt) => opt.toJSON().name);

      const subcommandInfo =
        subcommands?.length > 0
          ? ` [${subcommands.join(", ")}]`
          : "";

      logger.info(`Registered command: ${command.data.name}${subcommandInfo}`);
    }
  }

  // Register all commands with the Discord API
  const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

  (async () => {
    try {
      logger.info(`Refreshing ${commands.length} application (/) command(s)...`);

      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });

      logger.info(`Successfully registered ${commands.length} application (/) command(s)`);
    } catch (error) {
      logger.error({ err: error }, "Failed to register application commands");
    }
  })();
};
