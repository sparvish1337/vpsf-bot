const { SlashCommandBuilder, MessageFlags, Colors } = require("discord.js");
const { connection } = require("../../../functions/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("createslot")
    .setDescription("Create a team")
    .addStringOption((option) =>
      option
        .setName("teamname")
        .setDescription("Teams full name")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("logo")
        .setDescription("A *permanent* link to the teams logo")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("prefix")
        .setDescription("Team's abbreviation/prefix")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nationality")
        .setDescription("The country the team is from")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("colour")
        .setDescription("Colour of the team")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("manager")
        .setDescription("The user who is the manager")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("co-manager")
        .setDescription("The co-manager of the the team (OPTIONAL)")
        .setRequired(false)
    ),

  run: async ({ interaction, client, handler }) => {
    let teamname = interaction.options.getString("teamname");
    let logo = interaction.options.getString("logo");
    let prefix = interaction.options.getString("prefix");
    let manager_raw = interaction.options.getUser("manager");
    let comanager_raw = interaction.options.getUser("co-manager");
    let country = interaction.options.getString("nationality");
    let colour = interaction.options.getString("colour");
    let money = 250000;
    let manager = manager_raw["id"];

    try {
      connection.query(
        "SELECT * FROM teams WHERE name = ?",
        [teamname],
        function (err, row) {
          if (row && row.length) {
            interaction.reply({
              content: "Team name already taken!",
              flags: MessageFlags.Ephemeral,
            });
          } else {
            connection.query(
              "SELECT * FROM teams WHERE prefix = ?",
              [prefix],
              async function (err, row) {
                if (row && row.length) {
                  interaction.reply({
                    content: "Team prefix has already been taken!",
                    flags: MessageFlags.Ephemeral,
                  });
                } else {
                  const role = await interaction.guild.roles.create({
                    name: teamname,
                    color:
                      Colors.String(colour).charAt(0).toUpperCase() +
                      String(colour).slice(1),
                  });

                  let roleid = role["id"];
                  if (!(comanager_raw == null)) {
                    let comanager = comanager_raw["id"];
                    connection.query(
                      "INSERT into teams (`name`, `logo`, `prefix`, `manager`, `co-manager`, `country`, `roleid`, `money`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        teamname,
                        logo,
                        prefix,
                        manager,
                        comanager,
                        country,
                        roleid,
                        money,
                      ],
                      async function (err, results) {
                        if (err) throw err;

                        console.log(roleid);
                        const guildMember =
                          await interaction.guild.members.fetch(manager_raw);

                        guildMember.roles.add(roleid);

                        await interaction.reply({
                          content: "Team successfully has been made!",
                          flags: MessageFlags.Ephemeral,
                        });
                      }
                    );
                  } else {
                    connection.query(
                      "INSERT into teams (`name`, `logo`, `prefix`, `manager`, `co-manager`, `country`, `roleid`, `money`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                      [
                        teamname,
                        logo,
                        prefix,
                        manager,
                        comanager_raw,
                        country,
                        roleid,
                        money,
                      ],
                      async function (err, results) {
                        if (err) throw err;

                        console.log(roleid);
                        const guildMember =
                          await interaction.guild.members.fetch(manager_raw);

                        guildMember.roles.add(roleid);

                        await interaction.reply({
                          content: "Team successfully has been made!",
                          flags: MessageFlags.Ephemeral,
                        });
                      }
                    );
                  }
                }
              }
            );
          }
        }
      );
      connection.end();
    } catch (error) {
      console.log(error);
      return;
    }
  },
};
