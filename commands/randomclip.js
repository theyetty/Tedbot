const { SlashCommandBuilder } = require('@discordjs/builders');
require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random-clip')
    .setDescription(`Gets a random clip from ${process.env.TWITCH_USER}'s channel`),
  async execute(interaction) {
    try {
      // Get an OAuth token from Twitch API
      const tokenResponse = await axios.post(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_SECRET}&grant_type=client_credentials`);
      const accessToken = tokenResponse.data.access_token;

      // Get the user ID for the Twitch user
      const userResponse = await axios.get(`https://api.twitch.tv/helix/users?login=${process.env.TWITCH_USER}`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });
      const userId = userResponse.data.data[0].id;

      // Get a list of recent clips for the Twitch user
      const clipsResponse = await axios.get(`https://api.twitch.tv/helix/clips?broadcaster_id=${userId}&first=100`, {
        headers: {
          'Client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const clips = clipsResponse.data.data;

      // Get a random clip from the list
      const randomClip = clips[Math.floor(Math.random() * clips.length)];

      // Respond with a link to the random clip
      await interaction.reply(`Random clip from ${process.env.TWITCH_USER}'s channel: ${randomClip.url}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error fetching a random clip. Please try again later.');
    }
  }
};