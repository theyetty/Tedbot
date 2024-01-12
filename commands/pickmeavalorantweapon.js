const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pick-me-a-valorant-weapon")
    .setDescription("Picks a random Valorant weapon for you."),
  async execute(interaction) {
    await interaction.deferReply(); // defer reply to avoid API timeout

    const response = await fetch("https://valorant-api.com/v1/weapons");
    const data = await response.json();
    const weapons = data.data;
    const randomIndex = Math.floor(Math.random() * weapons.length);
    const weapon = weapons[randomIndex];

    // Select a random skin for the selected weapon
    const skins = weapon.skins;
    const randomSkinIndex = Math.floor(Math.random() * skins.length);
    const selectedSkin = skins[randomSkinIndex];

    const weaponEmbed = new MessageEmbed()
      .setTitle(`${weapon.displayName} with (${selectedSkin.displayName}) skin`)
      .setDescription(`Type: ${weapon.shopData.category}`)
      .setImage(selectedSkin.displayIcon);

    await interaction.editReply({ embeds: [weaponEmbed] });
  },
};
