//////////////////////////////////////////////////////////////////////////////////
/**
 * Listener definition for when a new member joins the server
 * @param GuildMember Discord.js GuildMember object that is provided on the GuildMemberAdd event
 * @param Welcomes List of welcome messages loaded from resources
 * @param channels Object containing ID's for all advisory channels (channels mentioned in a welcome message)
 * @returns {Promise<void>}
 */
export default async (GuildMember,Welcomes,channels) =>{
    const fetched = Welcomes.list[Math.floor(Math.random()*Welcomes.list.length)]//[Math.floor(Math.random() * Welcomes.length)];//fetch a randomly selected welcome message

    const welcomeChannel = GuildMember.guild.channels.cache.get(channels.welcome);

    welcomeChannel.send(prepareWelcomeMessage(fetched,GuildMember,channels.register,channels.supe, channels.menu));


}

/////////////////////////////////////////////////////////////////////////////////
/**
 * function to inject parameters into the welcome message
 * @param msg The message to be prepared
 * @param GuildMember The GuildMember object through discord.js
 * @param registerID The channel ID of the register channel
 * @param superID The channel ID for the channel of channels
 * @returns {string} finalized welcome message ready to be sent to the server
 */
function prepareWelcomeMessage(msg,GuildMember,registerID,superID, menuID){
    return msg.replace('{mention-member}',`<@${GuildMember.id}>`).replace(
        '{register}',`<#${registerID}>`
    ).replace(
        '{SuperChannel}',`<#${superID}>`
    ).replace(
        '{Menu}',`<#${menuID}>`
    );

}
////////////////////////////////////////////////////////////////////////////////