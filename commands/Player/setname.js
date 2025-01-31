const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
       .setName('setname')
       .setDescription('Set your nickname')
       .addStringOption(option => option
           .setName('nickname')
           .setDescription('Yhe nickname you want to have')
           .setRequired(true)
        ),

        
    async execute(interaction) {
        const newNickname = interaction.options.nickname.getString('nickname');
        const currentNickname = interaction.member.displayname;

        const [tag, username] = currentNickname.split(' | ');
        if (username) {
            const updatedNickname = `${tag} ${username}`;
            try {
                await interaction.member.setNickname(updatedNickname);
                interaction.reply({ content: `Nickname set to: ${updatedNickname}`, ephemeral: true });
            } catch (error) {
                interaction.reply({ content: `Error setting nickname: ${error.message}`, ephemeral: true });
                console.error(error);
            }
        }
        try {
            await interaction.member.setNickname(newNickname);
            interaction.reply({ content: `Nickname set to: ${newNickname}`, ephemeral: true });
        } catch (error) {
            interaction.reply({ content: `Error setting nickname: ${error.message}`, ephemeral: true });
            console.error(error);
        }
        
    }
    
}