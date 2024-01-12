const axios = require('axios');
const { MessageEmbed } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('overwatch-competitive-stats')
        .setDescription('Fetches the competitive stats for a given Overwatch player')
        .addStringOption((option) =>
            option
                .setName('username')
                .setDescription('The username of the player (e.g., Yetty or Yetty#21505)')
                .setRequired(true),
        ),
    async execute(interaction) {
        const usernameInput = interaction.options.getString('username');
        const username = usernameInput.replace('#', '-');

        console.log(username);

        try {
            await interaction.deferReply(); // Defer the reply
            let playerId;

            if (!username.includes('-')) {
                try {
                    const searchResponse = await axios.get(`https://overfast-api.tekrop.fr/players?name=${username}`);

                    const results = searchResponse.data.results;
                    const firstPublicResult = results.find(result => result.privacy === "public");

                    if (!firstPublicResult) {
                        await interaction.editReply("No public user found.");
                        return;
                    }

                    playerId = firstPublicResult.player_id;
                } catch (error) {
                    if (error.response && error.response.status === 404) {
                        await interaction.editReply('Player not found.');
                        return
                    } else {
                        console.error(error);
                        await interaction.editReply('An error occurred while fetching the player stats. Please try again later.');
                    }
                }

            } else {
                playerId = username;
            }

            console.log(playerId)

            let statsResponse;

            try {
                statsResponse = await axios.get(`https://overfast-api.tekrop.fr/players/${playerId}`);
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    await interaction.editReply('Player not found.');
                    return;
                } else {
                    console.error(error);
                    await interaction.editReply('An error occurred while fetching the player stats. Please try again later.');
                    return;
                }
            }

            const summary = statsResponse?.data?.summary;

            if (summary.privacy != 'public') {
                await interaction.editReply(`The profile for ${playerId} is not public...`);
                return
            }

            const tankEmbed = new MessageEmbed()
                .setTitle(`Tank Rank For ${summary.username}`)
                .setThumbnail(summary.avatar)
                .addFields(
                    { name: 'Tank', value: `${summary.competitive?.pc?.tank?.division || 'No rank'}`, inline: true },
                )
                .setImage(summary.competitive?.pc?.tank?.rank_icon)
                .setFooter({ text: 'Rank icons are shown in the tank role.' });

            const dpsEmbed = new MessageEmbed()
                .setTitle(`DPS Rank For ${summary.username}`)
                .setThumbnail(summary.avatar)
                .addFields(
                    { name: 'DPS', value: `${summary.competitive?.pc?.damage?.division || 'No rank'}`, inline: true },
                )
                .setImage(summary.competitive?.pc?.damage?.rank_icon)
                .setFooter({ text: 'Rank icons are shown in the DPS role.' });

            const supportEmbed = new MessageEmbed()
                .setTitle(`Support Rank For ${summary.username}`)
                .setThumbnail(summary.avatar)
                .addFields(
                    { name: 'Support', value: `${summary.competitive?.pc?.support?.division || 'No rank'}`, inline: true },
                )
                .setImage(summary.competitive?.pc?.support?.rank_icon)
                .setFooter({ text: 'Rank icons are shown in the support role.' });
            await interaction.editReply({ embeds: [tankEmbed, dpsEmbed, supportEmbed] }); // Edit the deferred reply


        } catch (error) {
            console.error(error);
            await interaction.followUp('An error occurred while fetching the player stats. Please try again later.'); // Send a follow-up message
            return
        }
    },
};
