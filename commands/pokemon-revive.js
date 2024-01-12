const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("revive")
        .setDescription("Revives a player and sets their health between 100 and 300.")
        .addUserOption((option) =>
            option.setName("player").setDescription("The player to revive.").setRequired(true)
        ),
    async execute(interaction) {
        
        // Load the poke-database.json file
        const pokeDb = JSON.parse(fs.readFileSync("poke-database.json", "utf-8"));

        // Get the player to revive from the command options
        const player = interaction.options.getUser("player");

        // Get the user who requested the command
        const requester = interaction.user;

        // Check if the requester has 0 or less health
        if (pokeDb[requester.id]?.health <= 0) {
            return await interaction.reply("You are dead, you cannot revive anyone, ask for an alive player to revive you!");
        }
        // Make sure the requester is not the player to be revived
        if (player.id === requester.id) {
            return await interaction.reply("You cannot revive yourself! Your not Jesus, ask someone else to revive you.");
        }

        // Check if the player is already alive
        if (pokeDb[player.id]?.health > 0) {
            return await interaction.reply(`${player} is already alive and kicking!`);
        }

        // Check if the player doesn't exist in the database and add them
        if (!pokeDb[player.id]) {
            pokeDb[player.id] = { health: Math.floor(Math.random() * 201) + 100 };
        }

        // Set the player's health to a random value between 100 and 300
        pokeDb[player.id].health = Math.floor(Math.random() * 201) + 100;

        // Save the updated poke-database.json file
        fs.writeFileSync("poke-database.json", JSON.stringify(pokeDb));

        // Send a message confirming the player's revival
        await interaction.reply(`${player} has been revived with ${pokeDb[player.id].health} health!`);
    },
};
