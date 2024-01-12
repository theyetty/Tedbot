const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const { MessageAttachment } = require('discord.js');
const { generateRankImage } = require('../functions/imageGenerator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Displays the current rank of a user in the server.')
        .addUserOption(option => 
            option.setName('user')
            .setDescription('The user to display the rank for')
            .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const userId = user.id;

        let messageDb;
        try {
            messageDb = JSON.parse(fs.readFileSync("message-database.json", "utf-8"));
        } catch (error) {
            console.error('Error reading the database:', error);
            await interaction.reply('Error fetching user data.');
            return;
        }

        const userData = messageDb[userId];
        if (!userData) {
            await interaction.reply(`No rank data found for ${user.username}.`);
            return;
        }

        const rankImageBuffer = await generateRankImage(userData.rank.split(" ")[0], userData.rank.split(" ")[1], user.username);
        const attachment = new MessageAttachment(rankImageBuffer, 'rank-image.png');

        await interaction.reply({ content: `Rank for ${user.username}:`, files: [attachment] });
    },
};
