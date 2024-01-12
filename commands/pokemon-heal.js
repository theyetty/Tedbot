const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("heal")
        .setDescription("Heals a player and updates last healed date.")
        .addUserOption((option) =>
            option.setName("player").setDescription("The player to heal.").setRequired(true)
        ),
    async execute(interaction) {
        // Get the player to heal from the command options
        const player = interaction.options.getUser("player");

        // Get the user who requested the command
        const requester = interaction.user;

        // Load the poke-database.json file
        const pokeDb = JSON.parse(fs.readFileSync("poke-database.json", "utf-8"));

        // Check if the requester has healed too much in the last 5 minutes
        const lastHealed = pokeDb[requester.id]?.lastHealed || 0;
        const currentTime = new Date().getTime();
        const timeDiff = currentTime - lastHealed;
        const fiveMinutesInMs = 5 * 60 * 1000;
        if (timeDiff < fiveMinutesInMs && pokeDb[requester.id]?.healCount >= 5) {
            // If the requester has healed too much in the last 5 minutes, damage them instead
            pokeDb[requester.id].health -= Math.floor(Math.random() * 21) + 10;
            pokeDb[requester.id].lastHealed = currentTime;
            await interaction.reply(
                `Healing staff overheated! You've been damaged instead. Your health is now ${pokeDb[requester.id].health}.`
            );
            return;
        }

        // Check if the player doesn't exist in the database and add them
        if (!pokeDb[player.id]) {
            pokeDb[player.id] = { health: 100 };
        }

        // Calculate the amount of healing to apply
        const healAmount = Math.floor(Math.random() * 91) + 10;

        // Apply healing to the player
        pokeDb[player.id].health = Math.min(300, pokeDb[player.id].health + healAmount);

        // Update the last healed time for the player being healed
        pokeDb[player.id].lastHealed = new Date().getTime();

        // Update the requester's heal count and last healed date
        pokeDb[requester.id].healCount = (pokeDb[requester.id]?.healCount || 0) + 1;
        pokeDb[requester.id].lastHealed = currentTime;

        // Save the updated poke-database.json file
        fs.writeFileSync("poke-database.json", JSON.stringify(pokeDb));

        // Send a message confirming the player's healing
        await interaction.reply(`${player} has been healed for ${healAmount} health! Your health is now ${pokeDb[requester.id].health}.`);
    },
};
