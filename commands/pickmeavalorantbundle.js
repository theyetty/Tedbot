const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pick-me-a-valorant-bundle")
    .setDescription("Picks a random Valorant bundle for you."),
  async execute(interaction) {
    await interaction.deferReply(); // defer reply to avoid API timeout

    const response = await fetch("https://valorant-api.com/v1/bundles");
    const data = await response.json();
    const bundles = data.data;
    const randomIndex = Math.floor(Math.random() * bundles.length);
    const bundle = bundles[randomIndex];

    const bundleEmbed = new MessageEmbed()
      .setTitle(bundle.displayName)
      .setImage(bundle.displayIcon);

    await interaction.editReply({ embeds: [bundleEmbed] });
  },
};
