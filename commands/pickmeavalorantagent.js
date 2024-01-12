const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pick-me-a-valorant-agent")
    .setDescription("Picks a random Valorant agent for you."),
  async execute(interaction) {
    await interaction.deferReply(); // defer reply to avoid API timeout

    const response = await fetch("https://valorant-api.com/v1/agents");
    const data = await response.json();
    const agents = data.data;
    const randomIndex = Math.floor(Math.random() * agents.length);
    const agent = agents[randomIndex];

    const heroEmbed = new MessageEmbed()
      .setTitle(agent.displayName)
      .setDescription(`Role: ${agent.role.displayName}`)
      .setImage(agent.displayIcon);

    await interaction.editReply({ embeds: [heroEmbed] });
  },
};
