export default async (interaction, roleID, messageFlags) =>{
    const role = interaction.guild.roles.cache.get(roleID);
    if(!role){
        interaction.reply({
            content: "Pardon our dust, but I can't find this role"
        });
    }
    const hasRole = interaction.member.roles.cache.has(role.id);
    try{
        if(hasRole){
            await interaction.member.roles.remove(role);
            console.log(`[Notification Roles]: Removed role \"${role.name}\"`+` from user ${interaction.member.displayName}`);
            interaction.reply({
                content:`The notification role ${role} has been removed`,
                flags: messageFlags.Ephemeral
            })
        }else{
            await interaction.member.roles.add(role);
            console.log(`[Notification Roles]: Added role \"${role.name}\"`+` to user ${interaction.member.displayName}`);
            interaction.reply({
                content:`The notification role ${role} has been added`,
                flags: messageFlags.Ephemeral
            });
        }
    }catch(err){
        console.log("[Notification Roles]: Error:\n\t"+err.message);
    }

}