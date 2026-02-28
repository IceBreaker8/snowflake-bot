const api = require("../../utils/api");
const logger = require("../../utils/logger");

module.exports = (client) => {
  // make a random API call to make sure the server is up, else throw an error and prevent the bot from going online
  api.get("/healthz").then(
    (res) => {
      logger.info(`Backend ${process.env.API_URL} loaded successfully`);
    },
    (err) => {
      logger.error({ err }, `Backend ${process.env.API_URL} failed to load`);
    }
  );
};
