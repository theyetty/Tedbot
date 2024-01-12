const { SlashCommandBuilder } = require("@discordjs/builders");
const wait = require("node:timers/promises").setTimeout;
require('dotenv').config(); // Load environment variables from .env file
const fetch = require("node-fetch");
const { MessageAttachment } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("twerk")
    .setDescription("Replies with a random twerking gif from Giphy"),
  async execute(interaction) {
    await interaction.deferReply();
    // make a request to the Giphy API to get a random twerking gif
    const response = await fetch(`https://api.giphy.com/v1/gifs/random?api_key=${process.env.GIPHY_API}&tag=twerk`);
    const json = await response.json();
    const gifUrl = json.data.images.original.url;

    const attachment = new MessageAttachment(gifUrl);
    // send the gif in the reply
    await interaction.editReply({ files: [attachment] });
  },
};