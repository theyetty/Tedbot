const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios');
const { getTwitchAccessToken, twitchAccessToken } = require('../functions/getTwitchAccessToken');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nextstream")
    .setDescription(`Shows when ${process.env.TWITCH_USER}\'s next stream is scheduled`),
  async execute(interaction) {
    try {
      // Get an OAuth token from Twitch API
      const accessToken = await getTwitchAccessToken();

      // Get the user ID for tteddison
      const userResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${process.env.TWITCH_USER}`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const userId = userResponse.data.data[0].id;

      // Get tteddison's stream schedule
      const scheduleResponse = await axios.get(`https://api.twitch.tv/helix/schedule?broadcaster_id=${userId}`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const segments = scheduleResponse.data.data.segments;
      const currentTime = new Date();

      // Find the next scheduled stream
      const nextStream = segments.find(segment => new Date(segment.start_time) > currentTime);

      if (nextStream) {
        const nextStreamTime = new Date(nextStream.start_time);
        const timeDifference = nextStreamTime - currentTime;
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

        let countdownMessage = '';
        if (days > 0) {
          countdownMessage += `${days} day${days > 1 ? 's' : ''}, `;
        }
        if (hours > 0) {
          countdownMessage += `${hours} hour${hours > 1 ? 's' : ''}, `;
        }
        countdownMessage += `${minutes} minute${minutes > 1 ? 's' : ''}`;
        await interaction.reply(`\n> **${nextStream.title}**\n> **WHEN:** ${nextStreamTime}\n> **Countdown:** ${countdownMessage}`);
      } else {
        await interaction.reply('No upcoming stream found for tteddison.');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error fetching the stream schedule. Please try again later.');
    }
  }
};