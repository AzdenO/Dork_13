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
let Logger = null;
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendNotifRolesMessage(channel, roles, message){
    try{
        Logger.log("Messaging Service","Sending notification roles message","INFO");
        await NotificationRoles(channel, roles, message);
        Logger.log("Messaging Service", "Message Sent","INFO");
    }catch(error){
        Logger.log("Messaging Service","Failed to send notification roles message message:\n\t"+error.message,"ERROR");
    }

}
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendModApplyMessage(){

    const destChannel = await Dork_13.getChannel(Resources.getServerConfig().moderation.recruitment.moderator.apply_message_dest);

    const message = RecruitApplyMessage(
        destChannel,
        Resources.getServerConfig().moderation.recruitment.moderator.apply_message,
        Resources.getServerConfig().moderation.recruitment.moderator.apply_button_id)
    try{
        await destChannel.send(message);
    }catch (error){
        Logger.log("Messaging Service","Failed to send moderation application message\\n\\t\"+error.message","ERROR")

    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendRaidMasterApplyMessage(){
    const destChannel = await Dork_13.getChannel(Resources.getServerConfig().moderation.recruitment.raidmaster.apply_message_dest);

    const message = RecruitApplyMessage(destChannel, Resources.getServerConfig().moderation.recruitment.raidmaster.apply_message,Resources.getServerConfig().moderation.recruitment.raidmaster.apply_button_id)
    try{
        await destChannel.send(message);
    }catch (error){
        Logger.log("Messaging Service","Failed to send moderation application message\n\t"+error.message,"ERROR")

    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendGamesRoleMessage(channel,roles,message,btnid){
    Logger.log("Messaging Service","Sending game role message message","INFO");
    await GameRoles(channel,roles,message,btnid);
    Logger.log("Messaging Service","Game roles message sent","INFO");

}
///////////////////////////////////////////////////////////////////////////////////////////////////
async function sendLogMessage(message){
    let destination = await Dork_13.getChannel(Resources.getServerConfig().server.channels.botLogs);
    destination.send(message);
}
///////////////////////////////////////////////////////////////////////////////////////////////////
function init(resources,dork,logger){
    Resources = resources;
    Dork_13 = dork;
    Logger = logger;
}
///////////////////////////////////////////////////////////////////////////////////////////////////
export default{
    sendNotifRolesMessage,
    init,
    sendModApplyMessage,
    sendGamesRoleMessage,
    sendRaidMasterApplyMessage,
    sendLogMessage,
}