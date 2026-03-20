/**
 *
 * @returns {Promise<void>}
 */
import {ActionRowBuilder, ButtonBuilder, ButtonStyle} from "discord.js";

export default async(channel, roles, message)=>{
    try{
        const buttons = new ActionRowBuilder();
        roles.forEach((role) => {
            buttons.components.push(
                new ButtonBuilder().setCustomId("notifAssign/"+role.id).setLabel(role.label).setStyle(ButtonStyle.Danger)
            )
        });

        channel.send({
            content: message,
            components: [buttons]
        })
    }catch(error){
        console.log(error.message);
        throw new Error("Unable to send notification roles message:\n\t"+error.message);

    }

}