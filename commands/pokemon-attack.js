const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("attack")
        .setDescription("Attacks another user with a random Pokemon attack.")
        .addUserOption((option) =>
            option.setName("target").setDescription("The user to attack.").setRequired(true)
        ),
    async execute(interaction) {
        // Get the target user from the command options
        const targetUser = interaction.options.getUser("target");

        // Load the poke-database.json file
        const pokeDb = JSON.parse(fs.readFileSync("poke-database.json", "utf-8"));

        // Get the user who requested the command
        const requester = interaction.user;

        // Initialize the health values for the requester and target
        const requesterHealth = pokeDb[requester.id]?.health ?? Math.floor(Math.random() * 401) + 100;
        const targetHealth = pokeDb[targetUser.id]?.health ?? Math.floor(Math.random() * 401) + 100;

        // Store the health values for the requester and target in the poke-database.json file
        pokeDb[requester.id] = { health: requesterHealth };
        pokeDb[targetUser.id] = { health: targetHealth };


        // Check if the health values are below 0 and reset them to a random value if necessary
        if (requesterHealth <= 0) {
            const deathMessage = `Sorry, ${requester} you are dead`
            await interaction.reply(deathMessage);
            return
        }
        if (targetHealth <= 0) {
            const deathMessage = `${targetUser} is already dead, you cannot attack a dead person you sick fuck, show some respect.`
            await interaction.reply(deathMessage);
            return
        }

        // Save the updated poke-database.json file
        fs.writeFileSync("poke-database.json", JSON.stringify(pokeDb));

        // Load the poke-attacks.json file
        const pokeAttacks = JSON.parse(fs.readFileSync("poke-attacks.json", "utf-8"));

        // Choose a random attack message and its corresponding attack value
        const randomAttack = pokeAttacks.attacks[Math.floor(Math.random() * pokeAttacks.attacks.length)];
        const attackValue = randomAttack.value;

        // Subtract the attack value from the target's health and store the updated value in the poke-database.json file
        pokeDb[targetUser.id].health -= attackValue;

        fs.writeFileSync("poke-database.json", JSON.stringify(pokeDb));
        
        // Construct the attack message and send it in the reply
        const remainingTargetHealth = pokeDb[targetUser.id].health;
        const remainingRequesterHealth = pokeDb[requester.id].health;
        let effectivenessMessage = "";
        if (attackValue > 20) {
            effectivenessMessage = "It was super effective!";
        } else if (attackValue > 10) {
            effectivenessMessage = "It was very effective!";
        } else {
            effectivenessMessage = "It was not very effective...";
        }
        const attackMessage = `${requester} ${randomAttack.message} ${targetUser} and deals **${attackValue}** damage, ${effectivenessMessage} \n${targetUser}'s remaining health: **${remainingTargetHealth}**.\n ${requester}'s remaining health: **${remainingRequesterHealth}**.`;
        await interaction.reply(attackMessage);
    
        // Check if the target user's health is below 0 after the attack and send a death message
        if (pokeDb[targetUser.id].health <= 0) {
            pokeDb[targetUser.id].health = 0;
            const deathMessage = `${targetUser} has passed out due to the lethal attack.`;
            await interaction.followUp(deathMessage);
            return;
        }

        const willAttackBack = Math.random() < 0.7; // 90% chance that the target user will attack back

        if (willAttackBack) {
            // Wait for 5 seconds
            await wait(200);

            // another random attack message and its corresponding attack value for the target's response
            const targetRandomAttack = pokeAttacks.attacks[Math.floor(Math.random() * pokeAttacks.attacks.length)];
            const targetAttackValue = targetRandomAttack.value;

            // Subtract the attack value from the requester's health and store the updated value in the poke-database.json file
            pokeDb[requester.id].health -= targetAttackValue;
            fs.writeFileSync("poke-database.json", JSON.stringify(pokeDb));

            // Construct the target's response message and send it as a follow-up message
            const remainingTargetHealthAfterResponse = pokeDb[targetUser.id].health;
            const remainingRequesterHealthAfterResponse = pokeDb[requester.id].health;
            let targetEffectivenessMessage = "";
            if (attackValue > 20) {
                effectivenessMessage = "It was super effective!";
            } else if (attackValue > 10) {
                effectivenessMessage = "It was very effective!";
            } else {
                effectivenessMessage = "It was not very effective...";
            }
            const targetAttackMessage = `${targetUser} in response ${targetRandomAttack.message} ${requester} and deals **${targetAttackValue}** damage, ${targetEffectivenessMessage} \n${requester}'s remaining health: **${remainingRequesterHealthAfterResponse}**. \n${targetUser}'s remaining health: **${remainingTargetHealthAfterResponse}**.`;
            await interaction.followUp(targetAttackMessage);

        } else {
            // Send a message saying the target user was too shocked to attack back
            const noAttackBackMessage = `${targetUser} was so shocked by the attack that they didn't have a chance to counterattack!`;
            await interaction.followUp(noAttackBackMessage);
        }
    },
};