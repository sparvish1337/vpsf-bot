require('dotenv/config');

const { Client, IntentsBitField } = require('discord.js');
const { CommandKit } = require('commandkit');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]
});

new CommandKit({
    client,
    eventsPath: `${__dirname}/events`,
    commandsPath: `${__dirname}/commands`
});

client.login('MTMzNDQ2ODIyNDg5NjcyOTExMQ.GMjDI8.3VYi-ePlDRnu3MT_B40C2ijKK8nkWf6NpkzOyM');