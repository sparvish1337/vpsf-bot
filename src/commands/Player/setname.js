const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('setname')
       .setDescription('Change your nickname')
       .addStringOption(option => 
        option.setName('nickname')
        .setDescription('Your new nickname')
        .setRequired(true)
    ),

async run(interaction) {
    const newNickname = interaction.options.nickname.getString('nickname');
    const currentNickname = interaction.member.displayName;

    const [tag, username] = currentNickname.split(' | ');
    if (username) {
        const updatedNickname = `${tag} ${username}`;
        try {
            await interaction.member.setNickname(updatedNickname);
            return interaction.reply({ content: `Your nickname has been updated to "${updatedNickname}".`, ephemeral: true });
        
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'An error occurred while updating your nickname.', ephemeral: true });
        }
    }
    try {
        await interaction.member.setNickname(newNickname);
        return interaction.reply({ content: `Your nickname has been updated to "${newNickname}".`, ephemeral: true });

    }   catch (error) {
        console.error(error);
        return interaction.reply({ content: 'An error occurred while updating your nickname.', ephemeral: true });
    }
    }
}


