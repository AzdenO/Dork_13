export default async(interaction, client) =>{
    const targetUser = interaction.options.getUser('target-user');

    let member;

    if (targetUser) {
        member =
            interaction.guild.members.cache.get(targetUser.id) ||
            (await interaction.guild.members.fetch(targetUser.id));
    } else {
        member = interaction.member;
    }

    client.emit('guildMemberAdd', member);

    interaction.reply('Simulated join!');
}