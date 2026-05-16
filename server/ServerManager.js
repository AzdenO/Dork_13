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
let LoggingMachine = null;

import Messaging from "./messaging/Messaging.js";
import ActivityManager from "./activities/Activities.js";
import ModerationManager from "./moderation/Moderator.js";
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

    Components.Logger("Server Management","initialising moderation service","INFO");
    ModerationManager.init(Components.Resources, ServerBot,Components.Logger);

    Components.Logger("Server Management","initialising messaging service","INFO");
    Messaging.init(Components.Resources,ServerBot,Components.Logger);

    Components.Logger("Server Management","Starting activities service...","INFO");
    ActivityManager.init(Components.DBManager,Components.Resources,Components.Resources.getServerConfig(),ServerBot,Components.Logger);

    Components.Logger("Server Management","Successfully initialised","INFO");
}
/////////////////////////////////////////////////////////////////////////
async function startBot(){
    Components.Logger("Server Management","Connecting DorkBot to server","INFO");
    if(!await ServerBot.connect()){
        Components.Logger("Server Management","ServerBot failed to connect","ERROR");
        return;
    }
    Components.Logger("Server Management","Assigning listeners to internal events","INFO");
    assignServerListeners();
    try{
        Components.Logger("Server Management","Collecting server manifest","INFO");
        await collectServerManifest();
        ActivityManager.assignActivityChannel(await ServerBot.getChannel(Components.Resources.getServerConfig().server.channels.raidCards))
        Components.Logger("Server Management","Reading initialisation tasks...","INFO");
        await initialisationTasks();
    }catch(err){
        Components.Logger("Server Management","Error in Dork Start-up process:\n\t"+err.message,"ERROR");
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
        Components.Logger("Server Management","Roles message required, sending...","INFO");
        const channel = await ServerBot.getChannel(Components.Resources.getServerConfig().server.channels.notificationRoles)
        const roles = Components.Resources.getServerConfig().notificationRoles.roles;
        const message = Components.Resources.getServerConfig().notificationRoles.message;
        await Messaging.sendNotifRolesMessage(channel,roles,message);
    }
    if(Components.Resources.getServerConfig().initTasks.sendLocationMessage){
        Components.Logger("Server Management","User location message required, sending...","INFO");

    }
    if(Components.Resources.getServerConfig().initTasks.sendModApplyMessage){
        Components.Logger("Server Management","Mod application message required, sending...","INFO");
        await Messaging.sendModApplyMessage(await ServerBot.getChannel(
            Components.Resources.getServerConfig().server.channels.modApply
        ));
        Components.Logger("Server Management","Mod application message successfully sent","INFO");
    }
    if(Components.Resources.getServerConfig().initTasks.sendGameRolesMessage){
        Components.Logger("Server Management","Game roles message required, sending...","INFO");
        await Messaging.sendGamesRoleMessage(
            await ServerBot.getChannel(Components.Resources.getServerConfig().gameRoles.messageChannel),
            Components.Resources.getServerConfig().gameRoles.roles,
            Components.Resources.getServerConfig().gameRoles.message,
            Components.Resources.getServerConfig().gameRoles.buttonId
        )
    }
    if(Components.Resources.getServerConfig().initTasks.sendRaidMasterApplyMessage){
        Components.Logger("Server Management","Raid master apply message required, sending...","INFO");
        await Messaging.sendRaidMasterApplyMessage();
        Components.Logger("Server Management","Raid Master application message successfully sent","INFO");
    }
    ActivityManager.compileJobs();//get the activity module to compile scheduled jobs for activities

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
        data.type = "moderator"
        ModerationManager.sendModApplyForm(data);
    });
    Components.ServerBus.on("raidmaster-apply",(data)=>{
        data.type = "raidmaster";
        ModerationManager.sendModApplyForm(data);
    });
    Components.ServerBus.on("mod-apply-submit",(data)=>{
        ModerationManager.processApplication({
            member: data.member,
            interact: data,
            type: "moderator"
        });
    });
    Components.ServerBus.on("raidmaster-apply-submit",(data)=>{
        ModerationManager.processApplication({
            member: data.member,
            interact: data,
            type: "raidmaster"

        })
    });
    Components.ServerBus.on("mod-apply-approve",(data)=>{
        data.type = "moderator";
        ModerationManager.approveMod(data)
    });
    Components.ServerBus.on("mod-apply-reject",(data)=>{
        data.type = "moderator";
        ModerationManager.rejectMod(data)
    })
    Components.ServerBus.on("raidmaster-apply-approve",(data)=>{
        data.type = "raidmaster";
        ModerationManager.approveMod(data)
    });
    Components.ServerBus.on("raidmaster-apply-reject",(data)=>{
        data.type = "raidmaster";
        ModerationManager.rejectMod(data)
    });
    Components.ServerBus.on("log-event",(message) => {
        if(Components.Resources.getServerConfig().flags.logAsMessage){
            Messaging.sendLogMessage(message);
        }
    })
}
/////////////////////////////////////////////////////////////////////////
function registerMessage(msg){
    if(msg.channel.id===Components.Resources.getServerConfig().server.channels.botLogs){
        return
    }else{
        Components.Logger("Server Management","Message registered in channel: "+msg.channel.name,"INFO");
    }
}
/////////////////////////////////////////////////////////////////////////

export default{
    init,
    terminateBot,
    startBot,
}