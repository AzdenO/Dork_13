import {MessageFlags} from 'discord.js';

export default async (interaction, roleID) =>{
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
            console.log(`[Game Roles]: Removed role \"${role.name}\"`+` from user ${interaction.member.displayName}`);
            interaction.reply({
                content:`The game role ${role} has been removed`,
                flags: MessageFlags.Ephemeral
            })
        }else{
            await interaction.member.roles.add(role);
            console.log(`[Game Roles]: Added role \"${role.name}\"`+` to user ${interaction.member.displayName}`);
            interaction.reply({
                content:`The game role ${role} has been added`,
                flags: MessageFlags.Ephemeral
            });
        }
    }catch(err){
        console.log("[Game Roles]: Error:\n\t"+err.message);
    }
}