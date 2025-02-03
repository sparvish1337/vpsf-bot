const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require("discord.js");
const { connection } = require("../../functions/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setcontract")
    .setDescription("Sets a player's contract")
    .addUserOption((option) =>
        option
        .setName("player")
        .setDescription("The player to set the contract for")
        .setRequired(true)
    )
    .addRoleOption((option) =>
        option
        .setName("team")
        .setDescription("The team to add the player to")
        .setRequired(true)
    )
    .addStringOption((option) =>
        option
        .setName("seasons")
        .setDescription("The amount of seasons (1 - 5)")
        .setRequired(true)
    ),

  run: async ({ interaction, client, handler }) => {
    if (!(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))) {
        return interaction.reply({ content: "You do not have permission to use this command", ephemeral: true });
    }

    let player = interaction.options.getUser("player");
    let team = interaction.options.getRole("team");
    let seasons = interaction.options.getString("seasons");

    let role = interaction.guild.roles.cache.get(team["id"]);

    if (seasons < 1 || seasons > 5) {
      return interaction.reply({ content: "Seasons must be 1 - 5", ephemeral: true });
    }

    connection.query('SELECT * FROM players WHERE discord_userid = ?', [player["id"]], async function (error, results, fields) {
      if (error) {
        console.log(error);
        return interaction.reply({ content: "An error occurred", ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({ content: "That isn't a valid player", ephemeral: true });
      }

      connection.query('SELECT * FROM teams WHERE roleid = ?', [team["id"]], async function (error, results, fields) {
        if (error) {
          console.log(error);
          return interaction.reply({ content: "An error occurred", ephemeral: true });
        }

        if (results.length === 0) {
          return interaction.reply({ content: "That isn't a valid team", ephemeral: true });
        }

        connection.query('UPDATE players SET team = ?, seasons = ? WHERE discord_userid = ?', [team["name"], seasons, player["id"]], async function (error, results, fields) {
          if (error) {
            console.log(error);
            return interaction.reply({ content: "An error occurred", ephemeral: true });
          }

          player = interaction.guild.members.cache.get(player["id"]);
          player.roles.add(role);

          return interaction.reply({ content: "Contract set", ephemeral: true });
        });
      });
    });
  },
};
