const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with multiple options.')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The question for the poll.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('The options for the poll, separated by commas.')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options').split(',');


    await interaction.deferReply();
    if (options.length > 10) {
      return await interaction.edit('You can only provide up to 10 options for the poll.');
    }

    const embed = new MessageEmbed()
      .setColor('#0077FF')
      .setTitle(`Poll: ${question}`);

    for (let i = 0; i < options.length; i++) {
      embed.addField(`Option ${i + 1}`, options[i], true);
    }

    try {
        const message = await interaction.editReply({ embeds: [embed] });
        if (!message) {
          return await interaction.editReply('There was an error creating the poll. Please try again later.');
        }
        for (let i = 0; i < options.length; i++) {
          await message.react(`${i + 1}\u20E3`);
        }
      } catch (error) {
        console.error(error);
      }

  }
};
