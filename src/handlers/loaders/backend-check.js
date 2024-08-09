const axios = require("axios");
const { EmbedBuilder } = require("discord.js");

// Create an Axios instance with strapi api token
const backUrl = process.env.API_URL;

const axiosInstance = axios.create({
  headers: {
    Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});

module.exports = (client) => {
  // make a random API call to make sure the server is up, else throw an error and prevent the bot from going online
  axiosInstance.get(backUrl + `/birthdays`).then(
    (res) => {
      console.log(`Backend ${process.env.BACK_URL} loaded successfully.`);
    },
    (err) => {
      console.log(`Backend ${process.env.BACK_URL} failed to load.`);
      console.error(err);
    }
  );
};
