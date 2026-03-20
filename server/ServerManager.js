/**
 * @module ServerManager
 * @description Main component for handling Server Management
 * @author AzdenO
 * @version 0.1
 */
let Components = null;
let ServerBot = null;
let Server = null;

import Messaging from "./messaging/Messaging.js"
/////////////////////////////////////////////////////////////////////////
/**
 * Initialisation function for server module
 * @param dependencies Object of dependencies required by the manager
 * @param bot Discord client object for interacting on the server
 */
function init(dependencies, bot){
    Components = dependencies;
    ServerBot = bot;
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
    if(Components.Resources.getServerConfig().initTasks.sendRolesMessage){
        console.log("[Server Management/Tasks]: User location message required, sending...");

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
export default{
    init,
    terminateBot,
    startBot,
}