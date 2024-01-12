const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pick-me-a-overwatch-hero')
    .setDescription('Recommends an Overwatch hero based on role')
    .addSubcommand(subcommand =>
      subcommand
        .setName('tank')
        .setDescription('Recommend a tank hero')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('damage')
        .setDescription('Recommend a damage hero')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('support')
        .setDescription('Recommend a support hero')
    ),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    let role = '';
    switch (subcommand) {
      case 'tank':
        role = 'tank';
        break;
      case 'damage':
        role = 'damage';
        break;
      case 'support':
        role = 'support';
        break;
      default:
        await interaction.reply('An error occurred while executing the command. Please try again later.');
        return;
    }

    try {
      await interaction.deferReply(); // Defer the reply

      const response = await axios.get(`https://overfast-api.tekrop.fr/heroes?role=${role}`);

      const hero = response.data[Math.floor(Math.random() * response.data.length)];

      const heroEmbed = new MessageEmbed()
        .setTitle(hero.name)
        .setDescription(`Role: ${hero.role}`)
        .setImage(hero.portrait);

      await interaction.editReply({ embeds: [heroEmbed] }); // Edit the deferred reply

    } catch (error) {
      console.error(error);
      await interaction.followUp('An error occurred while recommending an Overwatch hero. Please try again later.'); // Send a follow-up message
      return;
    }
  },
};
