const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const FREE_AGENT_ROLE_ID = '1334484749607108661';
const TRANSFER_LOG_CHANNEL_ID = '1334459801161437204';
const ADMIN_CHANNEL_ID = '1335691250237571132';
const ALLOWED_TEAMS = ['1334484868456775721', '1334471612015050792'];
const ALLOWED_CHANNEL_ID = '1334459839715217408';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confirm')
        .setDescription('Request to join a team')
        .addRoleOption(option => 
            option.setName('team')
                .setDescription('The team you want to join')
                .setRequired(true)
        ),

    async run(interaction) {
        if (interaction.channelId !== ALLOWED_CHANNEL_ID) {
            return await interaction.reply({ content: 'This command can only be used in the designated channel.', ephemeral: true });
        }
        
        const teamRole = interaction.options.getRole('team');
        const member = interaction.member;
        
        if (!member.roles.cache.has(FREE_AGENT_ROLE_ID)) {
            return await interaction.reply({ content: 'You can only use this command if you have the Free Agent role.', ephemeral: true });
        }
        
        if (!ALLOWED_TEAMS.includes(teamRole.id)) {
            return await interaction.reply({ content: 'You can only request to join an approved team.', ephemeral: true });
        }
        
        const requestMessage = await interaction.reply({
            content: `${member} has requested to join ${teamRole} for # seasons`,
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('approve').setLabel('Approve').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('deny').setLabel('Deny').setStyle(ButtonStyle.Danger)
                )
            ],
            fetchReply: true
        });

        const collector = requestMessage.createMessageComponentCollector({ time: 60000 });
        
        collector.on('collect', async buttonInteraction => {
            if (!buttonInteraction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                return await buttonInteraction.reply({ content: 'You do not have permission to approve or deny requests.', ephemeral: true });
            }
            
            if (buttonInteraction.customId === 'approve') {
                await member.roles.remove(FREE_AGENT_ROLE_ID);
                await member.roles.add(teamRole);
                await buttonInteraction.update({ content: `${member.displayName} requests to join ${teamRole.name} for # seasons\nApproved by ${buttonInteraction.user}`, components: [] });
                
                const transferLogChannel = buttonInteraction.guild.channels.cache.get(TRANSFER_LOG_CHANNEL_ID);
                if (transferLogChannel) {
                    transferLogChannel.send(`# :bust_in_silhouette: Free agent :arrow_right: <@&${teamRole.id}>
> <@${member.id}>
> for # seasons.
*(from <@${buttonInteraction.user.id}>)*`);
                }
                
                const adminChannel = buttonInteraction.guild.channels.cache.get(ADMIN_CHANNEL_ID);
                if (adminChannel) {
                    adminChannel.send(`${member.displayName} has been approved to join ${teamRole.name} by ${buttonInteraction.user}`);
                }
            } else if (buttonInteraction.customId === 'deny') {
                await buttonInteraction.update({ content: `${member.displayName} requests to join ${teamRole.name} for # seasons\nDenied by ${buttonInteraction.user}`, components: [] });
                
                const adminChannel = buttonInteraction.guild.channels.cache.get(ADMIN_CHANNEL_ID);
                if (adminChannel) {
                    adminChannel.send(`${member.displayName} has been denied to join ${teamRole.name} by ${buttonInteraction.user}`);
                }
            }
        });
    }
};
