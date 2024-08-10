const cron = require("node-cron");
const axios = require("axios");
const { DateTime } = require("luxon");

// Create an Axios instance with strapi api token
const backUrl = process.env.API_URL;

const axiosInstance = axios.create({
  headers: {
    Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`,
    "Content-Type": "application/json",
  },
});
// define cron global timezone
const globalTimeZone = "Europe/Paris";

const cronTimer =
  process.env.NODE_ENV == "PRODUCTION" ? "0 0 * * *" : "* * * * *";

module.exports = (client) => {
  console.log("Scheduling cron jobs");

  // schedule the bot to send the birthday celebration at midnight
  cron.schedule(
    cronTimer,
    () => {
      try {
        if (process.env.NODE_ENV == "DEVELOPMENT") return; // comment this for testing
        const channelId = process.env.BIRTHDAY_CHANNEL_ID; // Replace with the ID of the channel where you want to send the message
        const channel = client.channels.cache.get(channelId);
        if (channel) {
          // fetch all birthday dates
          axiosInstance
            .get(backUrl + `/birthdays`)
            .then((obj) => obj?.data?.data)
            .then((birthdays) => {
              if (birthdays && birthdays.length > 0) {
                for (let i = 0; i < birthdays.length; i++) {
                  const birthday = birthdays[i];
                  console.log(birthday);
                  const birthDateString = birthday.birth_date;
                  const [birthDay, birthMonth, _] = birthDateString.split("-");
                  if (birthDateString) {
                    // get paris time dates
                    const parisDate = DateTime.fromJSDate(new Date(), {
                      zone: "utc",
                    }).setZone(globalTimeZone);
                    // check if both dates have the same day and month
                    const todaysDay = parisDate.day;
                    const todaysMonth = parisDate.month;
                    if (
                      todaysDay == parseInt(birthDay) &&
                      todaysMonth == parseInt(birthMonth)
                    ) {
                      // fetch user
                      client.users.fetch(birthday.user_id).then((user) => {
                        if (user) {
                          // fetch birthday message
                          const birthdayMessage = `**Happy Birthday ${user}!** 🎈🎂🎉\n${
                            birthday.birthday_message ||
                            `Wishing you a day filled with joy and fun!`
                          }`;
                          channel.send(birthdayMessage);
                        }
                      });
                    }
                  }
                }
              }
            });
        } else {
          console.error("Channel not found");
        }
      } catch (err) {
        console.error(err);
      }
    },
    { timezone: globalTimeZone }
  );
};
