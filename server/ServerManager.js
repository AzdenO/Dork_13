import {MessageFlags} from "discord.js";

/**
 * @module ServerManager
 * @description Main component for handling Server Management
 * @author AzdenO
 * @version 0.1
 */
let Components = null;
let ServerBot = null;
let Server = null;
let ServerEvents = null;

import Messaging from "./messaging/Messaging.js";
import ActivityManager from "./activities/Activities.js";
import ModerationManager from "./moderation/Moderator.js"
/////////////////////////////////////////////////////////////////////////
/**
 * Initialisation function for server module
 * @param dependencies Object of dependencies required by the manager
 * @param bot Discord client object for interacting on the server
 */
function init(dependencies, bot){
    Components = dependencies;
    ServerBot = bot;
    ServerEvents = Components.Resources.getEventsConfig().ServerEvents;

    console.log("[Server Management]: initialising moderation service");
    ModerationManager.init(Components.Resources, ServerBot);

    console.log("[Server Management]: initialising messaging service");
    Messaging.init(Components.Resources);

    console.log("[Server Management]: Assigning listeners to internal events");
    assignServerListeners();

    console.log("[Server Management]: Starting activities service...");
    ActivityManager.init(Components.DBManager,Components.Resources,Components.Resources.getServerConfig(),ServerBot);

    console.log("[Server Management]: Successfully initialised");
}
/////////////////////////////////////////////////////////////////////////
async function startBot(){
    console.log("[Server Management]: Connecting DorkBot to server");
    if(!await ServerBot.connect()){
        console.log("[Server Management]: ServerBot failed to connect");
        return;
    }
    try{
        console.log("[Server Management]: Collecting server manifest");
        await collectServerManifest();
        ActivityManager.assignActivityChannel(await ServerBot.getChannel(Components.Resources.getServerConfig().server.channels.raidCards))
        ModerationManager.assignAdminChannel(await ServerBot.getChannel(Components.Resources.getServerConfig().server.channels.modAppDump))
        console.log("[Server Management]: Reading initialisation tasks...");
        await initialisationTasks();
    }catch(err){
        console.log("[Server Management]: Error in Dork Start-up process:\n\t"+err.message);
    }

}
/////////////////////////////////////////////////////////////////////////
async function terminateBot(){

}
/////////////////////////////////////////////////////////////////////////
/**
 * Executes tasks the server must do upon the bot connecting to the server
 * @returns {Promise<void>}
 */
async function initialisationTasks(){
    if(Components.Resources.getServerConfig().initTasks.sendRolesMessage){
        console.log("[Server Management/Tasks]: Roles message required, sending...");
        const channel = await ServerBot.getChannel(Components.Resources.getServerConfig().server.channels.notificationRoles)
        const roles = Components.Resources.getServerConfig().notificationRoles.roles;
        const message = Components.Resources.getServerConfig().notificationRoles.message;
        await Messaging.sendNotifRolesMessage(channel,roles,message);
    }
    if(Components.Resources.getServerConfig().initTasks.sendLocationMessage){
        console.log("[Server Management/Tasks]: User location message required, sending...");

    }
    if(Components.Resources.getServerConfig().initTasks.sendModApplyMessage){
        console.log("[Server Management/Init Tasks]: Mod application message required, sending...");
        await Messaging.sendModApplyMessage(await ServerBot.getChannel(
            Components.Resources.getServerConfig().server.channels.modApply
        ));
        console.log("[Server Management]: Mod application message successfully sent");
    }
}
/////////////////////////////////////////////////////////////////////////
/**
 * Fetch a reference to the Guild object the bot holds for the server, for easier access and better
 * seperation of responsibilities
 * @returns {Promise<*>}
 */
async function collectServerManifest(){
    Server = await ServerBot.getServerManifest(Components.Resources.getServerConfig().server.serverID);
}
/////////////////////////////////////////////////////////////////////////
/**
 * Function called at initialisation to assign listener functions to the programs own event bus
 */
async function assignServerListeners(){
    Components.ServerBus.on("message", (message) => {
        registerMessage(message);
    });
    Components.ServerBus.on("event-create",async(interaction)=>{
        await interaction.deferReply({flags: MessageFlags.Ephemeral});
        ActivityManager.createActivityCard(interaction);
    });
    Components.ServerBus.on("activity-join",(data)=>{
        ActivityManager.addCardMember(data);
    });
    Components.ServerBus.on("activity-leave",(data)=>{
        ActivityManager.removeCardMember(data);
    });
    Components.ServerBus.on("activity-delete",(data)=>{
        ActivityManager.deleteCard(data);
    });
    Components.ServerBus.on("activity-editModal",async(data)=>{
        ActivityManager.getEditModal(data);
    });
    Components.ServerBus.on("activity-edit",async(interact)=>{
        await interact.deferReply({flags: MessageFlags.Ephemeral})
        ActivityManager.editCard(interact);
    });
    Components.ServerBus.on("mod-apply",(data)=>{
        ModerationManager.sendModApplyForm(data);
    });
    Components.ServerBus.on("mod-apply-submit",(data)=>{
        ModerationManager.processApplication({
            member: data.member,
            interact: data
        });
    });
    Components.ServerBus.on("mod-apply-approve",(data)=>{
        ModerationManager.approveMod(data)
    });
    Components.ServerBus.on("mod-apply-reject",(data)=>{
        ModerationManager.rejectMod(data)
    })
}
/////////////////////////////////////////////////////////////////////////
function registerMessage(msg){
    console.log("[Server Management]: Message registered in channel: "+msg.channel.name);
}
/////////////////////////////////////////////////////////////////////////

export default{
    init,
    terminateBot,
    startBot,
}