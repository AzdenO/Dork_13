/**
 * @module Messaging
 * @description Centralised module for sending out messages to the server
 * @author AzdenO
 * @version 0.1
 */
import NotificationRoles from "./messages/NotificationRolesMessage.js";
import RecruitApplyMessage from "./messages/RecruitApplyMessage.js";
import GameRoles from "./messages/GameRolesMessage.js";

let Resources =null;
let Dork_13 = null;
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendNotifRolesMessage(channel, roles, message){
    try{
        console.log("[Messaging Service]: Sending notification roles message");
        await NotificationRoles(channel, roles, message);
        console.log("[Messaging Service]: Message Sent");
    }catch(error){
        console.log("[Messaging Service]: Failed to send notification roles message message:\n\t"+error.message);
    }

}
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendModApplyMessage(){

    const destChannel = await Dork_13.getChannel(Resources.getServerConfig().moderation.recruitment.moderator.apply_message_dest);

    const message = RecruitApplyMessage(destChannel, Resources.getServerConfig().moderation.recruitment.moderator.apply_message,Resources.getServerConfig().moderation.recruitment.moderator.apply_button_id)
    try{
        await destChannel.send(message);
    }catch (error){
        console.log("[Messaging Service]: Failed to send moderation application message\n\t"+error.message);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendRaidMasterApplyMessage(){
    const destChannel = await Dork_13.getChannel(Resources.getServerConfig().moderation.recruitment.raidmaster.apply_message_dest);

    const message = RecruitApplyMessage(destChannel, Resources.getServerConfig().moderation.recruitment.raidmaster.apply_message,Resources.getServerConfig().moderation.recruitment.raidmaster.apply_button_id)
    try{
        await destChannel.send(message);
    }catch (error){
        console.log("[Messaging Service]: Failed to send moderation application message\n\t"+error.message);
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendGamesRoleMessage(channel,roles,message,btnid){
    console.log("[Messaging Service]: Sending game roles message...");
    await GameRoles(channel,roles,message,btnid);
    console.log("[Messaging Service]: Game roles message sent");

}
///////////////////////////////////////////////////////////////////////////////////////////////////
function init(resources,dork){
    Resources = resources;
    Dork_13 = dork;
}
///////////////////////////////////////////////////////////////////////////////////////////////////
export default{
    sendNotifRolesMessage,
    init,
    sendModApplyMessage,
    sendGamesRoleMessage,
    sendRaidMasterApplyMessage
}