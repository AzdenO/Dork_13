/**
 * @module EventHandler
 * @description Assigns listeners to Discord events, defining responses and handing off logic to appropriate components
 * @author AzdenO
 * @version 0.1
 */
///////////////////////////////////////////////////////////////////////////////////
//module dependencies
import EventEmitter from "events"

//import event functions
import Welcome from "./functions/Welcome.js";

/**
 * define global variables
 */
let components = null
let ServerEvents = null
///////////////////////////////////////////////////////////////////////////////////
/**
 * @description Function to initialize module, providing dependencies as well as assign events to the bot and define listener logic
 * @param dependencies Object containing references to all bot components and dependencies directly required by the handler
 * @param bot The discord bot client
 */
function init(dependencies, bot){
    components = dependencies
    ServerEvents=components.Resources.getEventsConfig();
    assignListeners(bot);
}
///////////////////////////////////////////////////////////////////////////////////
function assignListeners(bot){

    //New Member Event
    bot.on(components.Discord.Events.GuildMemberAdd, async(member)=>{
        await memberJoin(member);
    });

    //Message Event
    bot.on(components.Discord.Events.MessageCreate, async(msg)=>{
        await messageListener(msg);
    });

    bot.on(components.Discord.Events.InteractionCreate, async(interaction)=>{
        await interactionListener(interaction);
    });
}
///////////////////////////////////////////////////////////////////////////////////
async function messageListener(msg){
    components.ServerBus.emit("message",msg);
}
///////////////////////////////////////////////////////////////////////////////////
async function interactionListener(interaction){
    if(interaction.isChatInputCommand()) {
        components.ServerBus.emit(ServerEvents.COMMAND,interaction);
        console.log(`[Event Handler]: Command /${interaction.commandName} used by ` + interaction.member.nickname)
        await components.CommandsParser.parseCommand(interaction);
    }
    else if(interaction.isButton()){
        components.ServerBus.emit(ServerEvents.BUTTON,interaction);
        console.log("[Event Handler]: Button used for "+(interaction.customId.split("/"))[0]);
        await components.CommandsParser.parseButton(interaction);
    }
    else if(interaction.isModalSubmit()){
        console.log("[Event Handler]: Form submission from "+interaction.member.user.username);
        console.log(interaction.customId);
        if(["create-raid","create-dungeon","custom"].includes(interaction.customId)){
            console.log("[Event Handler]: Form submission for event creation by "+interaction.member.user.username);
            components.ServerBus.emit("event-create",interaction);
        }else if(interaction.customId.split("/")[0]==="activity"){
            console.log("[Event Handler]: Form submission for destination service Activity");
            components.ServerBus.emit("activity-edit",interaction);
        }else if(interaction.customId==="moderate-application"){
            components.ServerBus.emit("mod-apply-submit",interaction);
        }
    }
}
///////////////////////////////////////////////////////////////////////////////////
async function memberJoin(member){
    components.ServerBus.emit(ServerEvents.NEWMEMBER,member);
    console.log(`[Event Handler]: New Member ${member.user.username} has joined Skill Issues Inc.`);
    Welcome(member,components.Resources.getWelcomes(),components.Resources.getAdvisoryChannels());
}
///////////////////////////////////////////////////////////////////////////////////
export default {
    init,
}