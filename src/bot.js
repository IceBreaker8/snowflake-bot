require("dotenv").config();

const path = require("path");
const fs = require("fs");
const { Collection, Events } = require("discord.js");
const logger = require("./utils/logger");

const { Client, GatewayIntentBits, codeBlock } = require("discord.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on("ready", () => {
  logger.info(
    `Starting Snowflake${
      process.env.NODE_ENV == "development" ? ".Dev" : ""
    } in ${process.env.NODE_ENV} environment: ${client.user.tag}`,
  );
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
//require("./handlers/functions/function.js")(client);

/**
 * Load handlers (functions, commands, events, etc...)
 */

client.commands = new Collection();

fs.readdirSync("./src/handlers").forEach((dir) => {
  fs.readdirSync(`./src/handlers/${dir}`).forEach((handler) => {
    require(`./handlers/${dir}/${handler}`)(client);
  });
});

// start discord bot connection
client.login(process.env.TOKEN);
