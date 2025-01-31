const { SlashCommandBuilder, MessageFlags } = require("discord.js");
//const { connection } = require("../../functions/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register")
    .setDescription("Link your steam profile to your discord!")
    .addStringOption((option) =>
      option
        .setName("pso_userid")
        .setDescription("Your PSO user id")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("nationality")
        .setDescription("The country you would like to represent")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("steam_id")
        .setDescription("Your steam64 id. (https://steamid.io/lookup)")
        .setRequired(true)
    ),
  run: async ({ interaction, client, handler }) => {
    let pso_userid = interaction.options.getString("pso_userid");
    let discord_userid = interaction.member.id;
    let steamid = interaction.options.getString("steam_id");
    let nationality = interaction.options.getString("nationality");
    let team = "N/A";
    let rating = 60;

    // TODO : Steam API Checks

    // * Checks if the user's discordid is already linked!
    connection.query(
      "SELECT id from players WHERE discord_userid = ?",
      [discord_userid],
      function (err, row) {
        if (row && row.length) {
          interaction.reply({
            content:
              "Already registered. If you believe this is a mistake please contact an admin.",
            flags: MessageFlags.Ephemeral,
          });
        } else {
          // * Checks if the user's pso id is already linked!
          connection.query(
            "SELECT id from players WHERE userid = ?",
            [pso_userid],
            function (err, row) {
              if (row && row.length) {
                interaction.reply({
                  content:
                    "Already registered. If you believe this is a mistake please contact an admin.",
                  flags: MessageFlags.Ephemeral,
                });
              } else {
                // * Checks if the user's steam id is already linked!
                connection.query(
                  "SELECT id from players WHERE steamid = ?",
                  [steamid],
                  function (err, row) {
                    if (row && row.length) {
                      interaction.reply({
                        content:
                          "Already registered. If you believe this is a mistake please contact an admin.",
                        flags: MessageFlags.Ephemeral,
                      });
                    } else {
                      // * Inserts the user into the database!
                      connection.query(
                        "INSERT into players (userid, discord_userid, steamid, nationality, team, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                          pso_userid,
                          discord_userid,
                          steamid,
                          nationality,
                          team,
                          rating,
                        ],
                        async function (err, results) {
                          if (err) throw err;
                          console.log(
                            `Added ${discord_userid} into the database under ${pso_userid}`
                          );
                          await interaction.reply({
                            content: "You have been successfully verified!",
                            flags: MessageFlags.Ephemeral,
                          });
                        }
                      );
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
    connection.end();
  },
};
