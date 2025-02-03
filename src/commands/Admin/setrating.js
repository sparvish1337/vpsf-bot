const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require("discord.js");
const { connection } = require("../../functions/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setrating")
    .setDescription("Sets a player's rating")
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("The player to set the rating for")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("rating")
        .setDescription("The rating to set")
        .setRequired(true)
    ),

  run: async ({ interaction, client, handler }) => {
    if (!(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))) {
        return interaction.reply({ content: "You do not have permission to use this command", ephemeral: true });
    }

    let player = interaction.options.getUser("player");
    let rating = interaction.options.getInteger("rating");

    player = interaction.guild.members.cache.get(player["id"]);
    
    if (rating < 1 || rating > 99) {
      return interaction.reply({ content: "Rating must be 1 - 99 ", ephemeral: true });
    }

    connection.query('SELECT * FROM players WHERE discord_userid = ?', [player["id"]], async function (error, results, fields) {
      if (error) {
        console.log(error);
        return interaction.reply({ content: "An error occurred", ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({ content: "That player hasn't registered yet!", ephemeral: true });
      }

      connection.query('UPDATE players SET rating = ? WHERE discord_userid = ?', [rating, player["id"]], async function (error, results, fields) {
        if (error) {
          console.log(error);
          return interaction.reply({ content: "An error occurred", ephemeral: true });
        }

        let nickame = player.nickname.replace(/\[.*?\]/g,"");

        let newUsername = (nickame + ` [${rating}]`).toString();
        await player.setNickname(newUsername, "Rating set");

        return interaction.reply({ content: "Rating set", ephemeral: true });
      });
    });
  },
};
