const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dog')
    .setDescription('Get a random picture of a dog.'),
  async execute(interaction) {
    try {
      // Call the random.dog API
      const response = await axios.get('https://random.dog/woof.json');

      // Extract the URL of the dog image
      const imageUrl = response.data.url;

      // Send the image to the user
      await interaction.reply({ files: [imageUrl] });
    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error getting a dog picture. Please try again later.');
    }
  }
};
