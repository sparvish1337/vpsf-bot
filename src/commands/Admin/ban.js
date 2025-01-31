const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a player"),

  run: async ({ interaction, client, handler }) => {
    console.log("Hi");
  },
};
