const { SlashCommandBuilder, MessageFlags, Colors, PermissionsBitField } = require("discord.js");
const { connection } = require("../../functions/mysql");

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
        .setName("leagueid")
        .setDescription("The league the team is in")
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
    if (!(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator))) {
      return interaction.reply({ content: "You do not have permission to use this command", ephemeral: true });
    }

    let teamname = interaction.options.getString("teamname");
    let logo = interaction.options.getString("logo");
    let prefix = interaction.options.getString("prefix");
    let country = interaction.options.getString("nationality");
    let colour = interaction.options.getString("colour");

    let manager_raw = interaction.options.getUser("manager");
    let comanager_raw = interaction.options.getUser("co-manager");
    let league = interaction.options.getString("leagueid");

    let money = 250000;

    let manager = manager_raw["id"];
    let newcolor = colour.charAt(0).toUpperCase() + colour.slice(1);

    connection.query(
      "SELECT * FROM teams WHERE name = ?",
      [teamname],
      function (error, results) {
        if (error) {
          console.log(error);
          return interaction.reply({
            content: "An error occurred",
            ephemeral: true,
          });
        }

        if (results.length === 1) {
          return interaction.reply({
            content: "That teamname is already taken!",
            ephemeral: true,
          });
        }

        connection.query(
          "SELECT * FROM teams WHERE prefix = ?",
          [prefix],
          async function (error, results) {
            if (error) {
              console.log(error);
              return interaction.reply({
                content: "An error occurred",
                ephemeral: true,
              });
            }

            if (results.length === 1) {
              return interaction.reply({
                content: "That prefix is already taken!",
                ephemeral: true,
              });
            }

            connection.query(
              "SELECT * FROM leagues WHERE leagueid = ?",
              [league],
              async function (error, results) {
                if (error) {
                  console.log(error);
                  return interaction.reply({
                    content: "An error occurred",
                    ephemeral: true,
                  });
                }

                if (results.length === 0) {
                  return interaction.reply({
                    content: "That isn't a valid league!",
                    ephemeral: true,
                  });
                }

                const role = await interaction.guild.roles.create({
                  name: teamname,
                  color: newcolor,
                });

                let roleid = role["id"];
                if (!(comanager_raw == null)) {
                  let comanager = comanager_raw["id"];
                  connection.query(
                    "INSERT into teams (`name`, `logo`, `prefix`, `manager`, `co-manager`, `country`, `roleid`, `money`, `leagueid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                      teamname,
                      logo,
                      prefix,
                      manager,
                      comanager,
                      country,
                      roleid,
                      money,
                      league,
                    ],
                    async function (err, results) {
                      if (err) throw err;

                      console.log(roleid);
                      const manager = await interaction.guild.members.fetch(
                        manager_raw
                      );

                      const comanager = await interaction.guild.members.fetch(comanager_raw);

                      manager.roles.add(roleid);
                      comanager.roles.add(roleid);

                      await interaction.reply({
                        content: "Team successfully has been made!",
                        flags: MessageFlags.Ephemeral,
                      });
                    }
                  );
                } else {
                  connection.query(
                    "INSERT into teams (`name`, `logo`, `prefix`, `manager`, `co-manager`, `country`, `roleid`, `money`, `leagueid`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                      teamname,
                      logo,
                      prefix,
                      manager,
                      comanager_raw,
                      country,
                      roleid,
                      money,
                      league,
                    ],
                    async function (err, results) {
                      if (err) throw err;

                      console.log(roleid);
                      const guildMember = await interaction.guild.members.fetch(
                        manager_raw
                      );

                      guildMember.roles.add(roleid);

                      await interaction.reply({
                        content: "Team successfully has been made!",
                        flags: MessageFlags.Ephemeral,
                      });
                    }
                  );
                }
              }
            );
          }
        );
      }
    );
  },
};
