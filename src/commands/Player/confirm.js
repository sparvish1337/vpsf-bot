const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confirm')
        .setDescription('Request to join a club')
        .setDMPermission(false)
        .addRoleOption(option =>
            option.setName('club')
                .setDescription('Choose a club')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('seasons')
                .setDescription('Seasons (1-5)')
                .setMinValue(1)
                .setMaxValue(5)
                .setRequired(true)
        ),

    async run(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const club = interaction.options.getRole('club'); 
        const seasons = interaction.options.getInteger('seasons');
        const member = interaction.member;
        const user = interaction.guild.members.cache.get(member.id);

        const allowedClubs = ['1334471612015050792', '1334484868456775721'];

        const confirmChannelId = '1334459839715217408';
        const confirmPlayerId = '1334459822518833152';
        const logChannelId = '1334459801161437204';

        const freeAgentId = '1334484749607108661';
        const clubPlayerId = '1334484767252414504';

        const confirmChannel = interaction.guild.channels.cache.get(confirmChannelId);
        const confirmPlayer = interaction.guild.channels.cache.get(confirmPlayerId);
        const logChannel = interaction.guild.channels.cache.get(logChannelId);

        const freeAgent = interaction.guild.roles.cache.get(freeAgentId);
        const clubPlayer = interaction.guild.roles.cache.get(clubPlayerId);

        if (!allowedClubs.includes(club.id)) {
            return interaction.reply({ content: 'The selected role is not a valid club.', ephemeral: true });
        }

        if (member.roles.cache.has(clubPlayerId)) {
            return interaction.reply({ content: 'You are already in a club.', ephemeral: true });
        }

        const offer = await confirmChannel.send({
            content: `${member} has requested to join ${club} for ${seasons} season(s).`
        });

        await offer.react('✅');

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`approve_${offer.id}`)
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`deny_${offer.id}`)
                .setLabel('Deny')
                .setStyle(ButtonStyle.Danger)
        );

        const buttonMessage = await confirmPlayer.send({
            content: `${member} has requested to join ${club} for ${seasons} seasons.`,
            components: [buttons]
        });

        const filter = i => i.customId.startsWith(`approve_${offer.id}`) || i.customId.startsWith(`deny_${offer.id}`);
        const collector = confirmPlayer.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
            const approvingUser = i.user;

            if (i.customId.startsWith(`approve_${offer.id}`)) {
                await user.roles.remove(freeAgent);
                await user.roles.add(club);
                await user.roles.add(clubPlayer);

                await offer.edit({
                    content: `${member} has requested to join ${club} for ${seasons} seasons.\n*(Approved by ${approvingUser})*`
                });

                await buttonMessage.edit({
                    content: `${member} requested to join ${club} for ${seasons} seasons.`
                });

                await logChannel.send({
                    content: `## :bust_in_silhouette: Free agent → ${club}\n> ${member}\n> for ${seasons} seasons.\n*(Approved by ${approvingUser})*`
                });

            } else if (i.customId.startsWith(`deny_${offer.id}`)) {
                await offer.edit({
                    content: `${member} has requested to join ${club} for ${seasons} seasons.\n*(Denied by ${approvingUser})*`
                });

                await buttonMessage.edit({
                    content: `${member} has requested to join ${club} for ${seasons} seasons.`
                });
            }
        });
    }
};
