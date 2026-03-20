/**
 * @module Messaging
 * @description Centralised module for sending out messages to the server
 * @author AzdenO
 * @version 0.1
 */
import NotificationRoles from "./messages/NotificationRolesMessage.js";
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
export default{
    sendNotifRolesMessage,
}