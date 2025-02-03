const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, PermissionsBitField } = require('discord.js');


const APPROVAL_CHANNEL_ID = '1335708929560150078'; // Replace with the actual approval channel ID
const CONFIRMATION_CHANNEL_ID = '1334160136796770307'; // Replace with the actual confirmation channel ID
const FREE_AGENT_ROLE_ID = '1335707059638767736'; // Replace with the actual Free Agent role ID
const TRANSFER_LOG_CHANNEL_ID = '1334160298323611730'; // Replace with the actual transfer log channel ID
const ALLOWED_TEAM_ROLE_IDS = ['1335707053607616646', '1335707058921803937']; // Replace with actual team role IDs


client.once('ready', async () => {

try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: [
        new SlashCommandBuilder()
          .setName('confirm')
          .setDescription('Request to join a role for a number of seasons.')
          .addRoleOption(option => option.setName('role').setDescription('The role you want to join').setRequired(true))
          .addIntegerOption(option => option.setName('seasons').setDescription('Number of seasons (1-5)').setRequired(true).setMinValue(1).setMaxValue(5))
          .toJSON(),
        new SlashCommandBuilder()
          .setName('register')
          .setDescription('Register yourself in the system.')
          .addStringOption(option => option.setName('steamlink').setDescription('Link to your Steam account.').setRequired(true))
          .toJSON()
      ] }
    );
    console.log('Commands registered!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options, channel } = interaction;

  if (commandName === 'confirm') {
    if (channel.id !== CONFIRMATION_CHANNEL_ID) {
      return interaction.reply({ content: 'This command can only be used in the designated confirmation channel.', ephemeral: true });
    }

    const role = options.getRole('role');
    const seasons = options.getInteger('seasons');

    if (!interaction.member.roles.cache.has(FREE_AGENT_ROLE_ID)) {
      return interaction.reply({ content: 'You can only confirm if you are a Free Agent.', ephemeral: true });
    }

    if (!ALLOWED_TEAM_ROLE_IDS.includes(role.id)) {
      return interaction.reply({ content: 'You can only confirm to a designated team role.', ephemeral: true });
    }

    const approvalChannel = interaction.guild.channels.cache.get(APPROVAL_CHANNEL_ID);
    if (!approvalChannel) return;

    const approveButton = new ButtonBuilder().setCustomId('approve').setLabel('Approve').setStyle(ButtonStyle.Success);
    const denyButton = new ButtonBuilder().setCustomId('deny').setLabel('Deny').setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder().addComponents(approveButton, denyButton);

    const confirmationMessage = await interaction.reply({
      content: `${interaction.user} requests to join ${role} for ${seasons} season(s).`,
      fetchReply: true
    });

    const approvalMessage = await approvalChannel.send({
      content: `${interaction.user} has requested to join ${role} for ${seasons} season(s).`,
      components: [row]
    });

    const collector = approvalMessage.createMessageComponentCollector({
      filter: i => i.isButton() && i.member.permissions.has(PermissionsBitField.Flags.ManageRoles),
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.customId === 'approve') {
        await interaction.member.roles.remove(FREE_AGENT_ROLE_ID);
        await interaction.member.roles.add(role.id);

        const transferLogChannel = interaction.guild.channels.cache.get(TRANSFER_LOG_CHANNEL_ID);
        if (transferLogChannel) {
          await transferLogChannel.send(`:bust_in_silhouette: Free Agent :arrow_right: <@&${role.id}>
> <@${interaction.user.id}>
> for ${seasons} season(s).
*(from <@${i.user.id}>)*`);
        }

        await i.update({ content: `${interaction.user} approved to join ${role} for ${seasons} season(s) by ${i.user}.`, components: [] });
        await confirmationMessage.edit({ content: `${interaction.user} has been approved to join ${role} for ${seasons} season(s).` });
      } else if (i.customId === 'deny') {
        await i.update({ content: `${interaction.user}'s request to join ${role} for ${seasons} season(s) denied by ${i.user}.`, components: [] });
        await confirmationMessage.edit({ content: `${interaction.user}'s request to join ${role} for ${seasons} season(s) has been denied.` });
      }

      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        approvalMessage.edit({ content: 'The confirmation request has timed out.', components: [] });
        confirmationMessage.edit({ content: 'Your confirmation request has timed out.' });
      }
    });
    }  
});

