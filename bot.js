require('dotenv').config(); // Load environment variables from .env file
const fs = require('fs');
const path = require('path');
const { Client, Collection, Intents, MessageAttachment } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { createCanvas, loadImage } = require('canvas');

console.log("Starting bot");
process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, "GUILD_MESSAGES", "GUILD_MEMBERS", "GUILD_VOICE_STATES"],
});
client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing that command.', ephemeral: true });
  }
});

client.login(process.env.DISCORD_TOKEN); // Login with Discord bot token

client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return; // Ignore bot messages and DMs

  const userID = message.author.id;
  const now = new Date().getTime();

  let messageDb;
  try {
    messageDb = JSON.parse(fs.readFileSync("message-database.json", "utf-8"));
  } catch (error) {
    messageDb = {};
  }

  const userData = messageDb[userID] || { messagesCount: 0, lastMessageTimestamp: now, rank: "Bronze 5" };

  const oldRank = userData.rank;

  userData.messagesCount++;
  userData.lastMessageTimestamp = now;

  userData.rank = calculateRank(userData.messagesCount, userID);

  if (userData.rank !== oldRank && userData.rank !== "Unranked") {
    // Extract rank and tier from userData.rank, e.g., "Silver 2"
    const [rank, tier] = userData.rank.split(" ");

    const username = message.author.username;
    // Generate rank image
    const rankImage = await generateRankImage(rank, tier, username);

    // Create an attachment from the buffer
    const attachment = new MessageAttachment(rankImage, 'rank-image.png');

    // Send the message with the attachment
    message.channel.send({
      content: `<@${userID}> Congrats! You reached ${userData.rank} in this server!`,
      files: [attachment]
    });
  }
  // Save the updated data
  messageDb[userID] = userData;
  fs.writeFileSync("message-database.json", JSON.stringify(messageDb));
});

async function generateRankImage(rank, tier, username) {
  const imagePath = path.join(__dirname, 'rank_images', `${rank.toLowerCase()}.png`);
  const baseImage = await loadImage(imagePath);

  const canvas = createCanvas(baseImage.width, baseImage.height);
  const context = canvas.getContext('2d');

  // Draw the base image
  context.drawImage(baseImage, 0, 0);

  // Add username text
  context.font = 'bold 30px Arial'; // Adjust font size as needed
  context.fillStyle = 'black'; // You can change the color if needed
  context.fillText(username, 150, 50); // Adjust position as needed

  // Add tier text
  context.font = 'bold 40px Arial';
  context.fillStyle = 'black'; // Example text color
  context.fillText(`Tier ${tier}`, 150, 100); // Adjust position as needed

  return canvas.toBuffer();
}

function calculateRank(messagesCount, userID) {

  const ted = '961805892020478045';
  const maxRankForSpecialUser = "Silver 5";

  const ranks = [
    { rank: "Grandmaster 5", threshold: 1000 },
    { rank: "Grandmaster 4", threshold: 9500 },
    { rank: "Grandmaster 3", threshold: 9000 },
    { rank: "Grandmaster 2", threshold: 8500 },
    { rank: "Grandmaster 1", threshold: 8000 },
    { rank: "Master 5", threshold: 7500 },
    { rank: "Master 4", threshold: 7000 },
    { rank: "Master 3", threshold: 6500 },
    { rank: "Master 2", threshold: 6000 },
    { rank: "Master 1", threshold: 5500 },
    { rank: "Diamond 5", threshold: 5000 },
    { rank: "Diamond 4", threshold: 4500 },
    { rank: "Diamond 3", threshold: 4000 },
    { rank: "Diamond 2", threshold: 3500 },
    { rank: "Diamond 1", threshold: 3000 },
    { rank: "Platinum 5", threshold: 2500 },
    { rank: "Platinum 4", threshold: 2250 },
    { rank: "Platinum 3", threshold: 2000 },
    { rank: "Platinum 2", threshold: 1750 },
    { rank: "Platinum 1", threshold: 1500 },
    { rank: "Gold 5", threshold: 1250 },
    { rank: "Gold 4", threshold: 1150 },
    { rank: "Gold 3", threshold: 1050 },
    { rank: "Gold 2", threshold: 950 },
    { rank: "Gold 1", threshold: 850 },
    { rank: "Silver 5", threshold: 750 },
    { rank: "Silver 4", threshold: 650 },
    { rank: "Silver 3", threshold: 550 },
    { rank: "Silver 2", threshold: 450 },
    { rank: "Silver 1", threshold: 350 },
    { rank: "Bronze 5", threshold: 250 },
    { rank: "Bronze 4", threshold: 200 },
    { rank: "Bronze 3", threshold: 150 },
    { rank: "Bronze 2", threshold: 100 },
    { rank: "Bronze 1", threshold: 50 }
  ];

  if (userID === ted) {
    for (const rankInfo of ranks) {
      if (messagesCount >= rankInfo.threshold && rankInfo.rank === maxRankForSpecialUser) {
        return rankInfo.rank;
      }
    }
    return "Tin 1";
  }

  for (const rankInfo of ranks) {
    if (messagesCount >= rankInfo.threshold) {
      return rankInfo.rank;
    }
  }

  return "Unranked";
}
