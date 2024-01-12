const axios = require('axios');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('is-ted-diamond')
        .setDescription('Checks if Tedisson is diamond yet...'),
    async execute(interaction) {
        try {
            await interaction.deferReply(); // Defer the reply

            const playerId = 'Tedisson-2518';
            const response = await axios.get(`https://overfast-api.tekrop.fr/players/${playerId}`);
            const summary = response.data.summary;
            const tankRank = summary.competitive?.pc?.tank?.division;
            const damageRank = summary.competitive?.pc?.damage?.division;
            const supportRank = summary.competitive?.pc?.support?.division;

            let highestRank = 'No rank';
            if (tankRank && tankRank !== 'No rank' && tankRank !== 'Bronze') {
                highestRank = 'Tank';
            } else if (damageRank && damageRank !== 'No rank' && damageRank !== 'Bronze') {
                highestRank = 'DPS';
            } else if (supportRank && supportRank !== 'No rank' && supportRank !== 'Bronze') {
                highestRank = 'Support';
            }

            let hasDiamond = false;
            if (tankRank === 'Diamond' || damageRank === 'Diamond' || supportRank === 'Diamond') {
                hasDiamond = true;
            }

            if (hasDiamond) {
                title = `Tedisson is ${highestRank}`;
            } else {
                title = `<@961805892020478045> is not diamond, TED GET GUD YOUR ONLY ${supportRank}`;
            }

            const embed = new MessageEmbed()
                .setTitle(title)
                .addFields(
                    { name: 'Tank', value: `${tankRank || 'No rank'}`, inline: true },
                    { name: 'DPS', value: `${damageRank || 'No rank'}`, inline: true },
                    { name: 'Support', value: `${supportRank || 'No rank'}`, inline: true },
                    { name: 'Diamond', value: hasDiamond ? 'Yes' : 'No', inline: true },
                );


            await interaction.editReply({ embeds: [embed] }); // Edit the deferred reply

        } catch (error) {
            console.error(error);
            await interaction.followUp('An error occurred while fetching the player stats. Please try again later.'); // Send a follow-up message
            return;
        }
    },
};
