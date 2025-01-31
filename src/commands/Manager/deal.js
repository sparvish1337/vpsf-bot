const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("deal")
    .setDescription("Buy a player from another team!"),

  run: async ({ interaction, client, handler }) => {
    console.log("Hi");
  },
};
