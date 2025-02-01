const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('confirm')
        .setDescription('Request to join a club')
        .setDMPermission(false)

        .addRoleOption(option =>
            option.setName('club').setDescription('Choose a club').setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('seasons').setDescription('Seasons (1-5)').setMinValue(1).setMaxValue(5).setRequired(true)
        ),

    async run(interaction) {
        const club = interaction.options.getRole('club')
        const seasons = interaction.options.getInteger('seasons')
        const im = interaction.member
        const user = interaction.guild.members.cache.get(im.id)

        const clubs = ['1334471612015050792', '1334484868456775721']

        const ConfirmChannelId = '1334459839715217408'
        const ConfirmChannel = interaction.guild.channels.cache.get(ConfirmChannelId)

        const ConfirmPlayerId = '1334459822518833152'
        const ConfirmPlayer = interaction.guild.channels.cache.get(ConfirmPlayerId)

        const LogChannelId = '1334459801161437204'
        const LogChannel = interaction.guild.channels.cache.get(LogChannelId)

        const FreeAgentId = '1334484749607108661'
        const FreeAgent = interaction.guild.roles.cache.get(FreeAgentId)

        const ClubPlayerId = '1334484767252414504'
        const ClubPlayer = interaction.guild.roles.cache.get(ClubPlayerId)

        if (!clubs.includes(club.id)) {
            return interaction.reply({ content: 'The selected role is not a club', flags: 64 })
        }

        if (im.roles.cache.has(ClubPlayerId)) {
            return interaction.reply({ content: 'You are already in a club.', flags: 64 })
        }

        const Offer = await ConfirmChannel.send({
            content: `${im} has requested to join ${club} for ${seasons} season(s).`
        });

        await Offer.react('✅')

        const Buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                    .setCustomId(`approved_${Offer.id}`)
                    .setLabel('Approve')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`deny_${Offer.id}`)
                    .setLabel('Deny')
                    .setStyle(ButtonStyle.Danger)
        );

        const ButtonMessage = await ConfirmPlayer.send({
            content: `${im} has requested to join ${club} for ${seasons} seasons.`,
            components: [Buttons]
                
        });

        const filter = i => i.customId.startsWith(`approved_${Offer.id}`) || i.customId.startsWith(`deny_${Offer.id}`)
        const collector = ConfirmPlayer.createMessageComponentCollector({ filter })

        collector.on('collect', async i => {
            const iu = interaction.user

            if (i.customId.startsWith(`approved_${Offer.id}`)) {
                await user.roles.remove(FreeAgent)
                await user.roles.add(club)
                await user.roles.add(ClubPlayer)

                await Offer.edit({
                    content: `${im} has requested to join ${club} for ${seasons} seasons.\n*(Approved by ${iu})*`
                });

                await ButtonMessage.edit({
                    content: `${im} requested to join ${club} for ${seasons} seasons.`
                });

                await LogChannel.send({
                    content: `## :bust_in_silhouette: Free agent :arrow_right: ${club}\n> ${im}\n> for ${seasons} seasons.\n*(from ${iu})*`
                })

            }

            if (i.customId.startsWith(`deny_${Offer.id}`)) {

                await Offer.edit({
                    content: `${im} has requested to join ${club} for ${seasons} seasons.\n*(Denied by ${iu})*`
                });

                await ButtonMessage.edit({
                    content: `${im} has requested to join ${club} for ${seasons} seasons.`
                });

            }

        });
    }
}