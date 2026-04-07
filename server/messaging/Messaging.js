/**
 * @module Messaging
 * @description Centralised module for sending out messages to the server
 * @author AzdenO
 * @version 0.1
 */
import NotificationRoles from "./messages/NotificationRolesMessage.js";
import ModApplyMessage from "./messages/ModApplyMessage.js";

let Resources =null;
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendNotifRolesMessage(channel, roles, message){
    try{
        console.log("[Messaging Service]: Sending notification roles message");
        NotificationRoles(channel, roles, message);
        console.log("[Messaging Service]: Message Sent");
    }catch(error){
        console.log("[Messaging Service]: Failed to send message:\n\t"+error.message);
    }

}
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendModApplyMessage(channel){
    const message = ModApplyMessage(channel, Resources.getServerConfig().moderation.apply_message, Resources.getServerConfig().moderation.apply_button_id)
    try{
        await channel.send(message);
    }catch (error){
        console.log("[Messaging Service]: Failed to send moderation application message\n\t"+error.message);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
function init(resources){
    Resources = resources;
}
///////////////////////////////////////////////////////////////////////////////////////////////////
export default{
    sendNotifRolesMessage,
    init,
    sendModApplyMessage
}