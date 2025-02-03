const { SlashCommandBuilder, MessageFlags, PermissionsBitField } = require("discord.js");
const { connection } = require("../../functions/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("disbandteam")
    .setDescription("Deletes a team")
    .addRoleOption((option) =>
      option
        .setName("team")
        .setDescription("The team to disband")
        .setRequired(true)
    ),

  run: async ({ interaction, client, handler }) => {
    if (!(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))) {
      return interaction.reply({ content: "You do not have permission to use this command", ephemeral: true });
    }

    let team = interaction.options.getRole("team");
    let roleid = team['id'];
    let role = interaction.guild.roles.cache.get(roleid);

    connection.query('SELECT * FROM teams WHERE roleid = ?', [roleid], async function (error, results, fields) {
      if (error) {
        console.log(error);
        return interaction.reply({ content: "An error occurred", ephemeral: true });
      }

      if (results.length === 0) {
        return interaction.reply({ content: "That isn't a valid team", ephemeral: true });
      }

      connection.query('DELETE FROM teams WHERE roleid = ?', [roleid], async function (error, results, fields) {
        if (error) {
          console.log(error);
          return interaction.reply({ content: "An error occurred", ephemeral: true });
        }

        role.delete('Disbanding team')
            .then(() => console.log(`Deleted teamrole ${roleid}`))
            .catch(console.error);

        return interaction.reply({ content: "Team disbanded!", ephemeral: true });
      });
    });
  },
};
