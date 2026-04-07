import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

/**
 *
 * @returns {Promise<void>}
 */
export default (channel, message, btnid) =>{
    try{
        const button = new ActionRowBuilder()
        button.components.push(
            new ButtonBuilder().setCustomId(btnid).setLabel("Apply!").setStyle(ButtonStyle.Secondary)
        )

        return {
            content: message,
            components: [button]
        }
    }catch(err){
        console.log("[Mod Application Message]: Error occured:\n\t"+err.message)
    }
}