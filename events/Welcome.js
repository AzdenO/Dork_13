//////////////////////////////////////////////////////////////////////////////////
/**
 * Listener definition for when a new member joins the server
 * @param GuildMember Discord.js GuildMember object that is provided on the GuildMemberAdd event
 * @param Welcomes List of welcome messages loaded from resources
 * @param welcomeID Channel ID for the welcome text channel
 * @param registerID Channel ID for the charlemagne register channel
 * @param superID Channel ID for the Channel of Channels....channel
 * @returns {Promise<void>}
 */
export default async (GuildMember,Welcomes,welcomeID,registerID,superID) =>{
    const fetched = Welcomes.list[Math.floor(Math.random()*Welcomes.list.length)]//[Math.floor(Math.random() * Welcomes.length)];//fetch a randomly selected welcome message

    const welcomeChannel = GuildMember.guild.channels.cache.get(welcomeID);

    welcomeChannel.send(prepareWelcomeMessage(fetched,GuildMember,registerID,superID));


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
function prepareWelcomeMessage(msg,GuildMember,registerID,superID){
    return msg.replace('{mention-member}',`<@${GuildMember.id}>`).replace(
        '{register}',`<#${registerID}>`
    ).replace(
        '{SuperChannel}',`<#${superID}>`
    );

}
////////////////////////////////////////////////////////////////////////////////