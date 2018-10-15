require("dotenv").config();

const http = require("http");
const twit = require("twit");
const config = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
};
const Twitter = new twit(config);

const MAX_RT_COUNT = 10;

const USERS = [
  "2176790760", // weworkremotely
  "2302561110", // workingnomads
  "2938471462", // remote_ok
  "1256890382", // wfhio
  "3123971548", // Jobspresso
  "2484353317", // remotejobme
];

const getUserOfTheDay = () => {
  let date = new Date();
  let dayOfMonth = date.getDate();
  let pickUserIndex = dayOfMonth % USERS.length;

  return USERS[pickUserIndex];
};

let retweetTags = async function() {
  try {
    const { data } = await Twitter.get("search/tweets", {
      q: "#loker, #kerjaan",
      result_type: "mixed",
      lang: "en"
    });

    const statuses = data.statuses.slice(0, MAX_RT_COUNT);

    // loop through the first n returned tweets
    for (const status of statuses) {
      // the post action
      const response = await Twitter.post("statuses/retweet/:id", {
        id: status.id_str
      });

      if (response) {
        console.log("Successfully retweeted");
      }
    }
  } catch (err) {
    // catch all log if the search/retweet could not be executed
    console.error("Err:", err);
  }
};

// retweetTags();

let retweetUsers = async function() {
  try {
    const { data } = await Twitter.get("users/show", {
      user_id: getUserOfTheDay()
    });
    const status = data.status;
    // make sure tweet isn't in reply to another user
    if (status.in_reply_to_status_id == null) {
      const response = await Twitter.post("statuses/retweet/:id", {
        id: status.id_str
      });
      if (response) {
        console.log("Successfully retweeted");
      }
    }
  } catch (err) {
    // catch all log if the search/retweet could not be executed
    console.error("Err:", err);
  }
};

retweetUsers();

setInterval(function() {
  http.get("https://twitter-duende-bot.herokuapp.com/");
}, 86400000); // checks app every 24 hours
