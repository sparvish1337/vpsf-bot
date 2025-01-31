const { SlashCommandBuilder, MessageFlags } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Register yourself with your steam!"),

  run: async ({ interaction, client, handler }) => {
    console.log("Hi");
  },
};
