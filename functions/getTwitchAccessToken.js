// twitchToken.js
const axios = require('axios');

let twitchAccessToken = '';
let twitchAccessTokenExpiry = 0;

async function getTwitchAccessToken() {
  // Check if the access token has expired
  const currentTime = new Date().getTime();
  if (currentTime < twitchAccessTokenExpiry) {
    return twitchAccessToken;
  }

  try {
    // Request a new OAuth token from Twitch API
    const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`);
    twitchAccessToken = tokenResponse.data.access_token;

    // Set the expiry time of the access token to 30 minutes from now
    twitchAccessTokenExpiry = currentTime + (tokenResponse.data.expires_in * 1000);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to get Twitch access token.');
  }

  return twitchAccessToken;
}

module.exports = {
  getTwitchAccessToken,
  twitchAccessToken,
  twitchAccessTokenExpiry,
};
