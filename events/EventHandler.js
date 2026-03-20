/**
 * @module EventHandler
 * @description Assigns listeners to Discord events, defining responses and handing off logic to appropriate components
 * @author AzdenO
 * @version 0.1
 */
///////////////////////////////////////////////////////////////////////////////////
import Welcome from "./Welcome.js";
import Resources from "../resources/Resources.js";
/**
 * define global variables
 */
let components = null
///////////////////////////////////////////////////////////////////////////////////
/**
 * @description Function to initialize module, providing dependencies as well as assign events to the bot and define listener logic
 * @param dependencies Object containing references to all bot components and dependencies directly required by the handler
 * @param bot The discord bot client
 */
function init(dependencies, bot){
    components = dependencies
    assignListeners(bot);
}
///////////////////////////////////////////////////////////////////////////////////
function assignListeners(bot){

    //New Member Event
    bot.on(components.Discord.Events.GuildMemberAdd, (member)=>{
        console.log(`[Event Handler]: New Member ${member.user.username} has joined Skill Issues Inc.`)
        Welcome(member,components.Resources.getWelcomes(),components.Resources.getAdvisoryChannels())
    });

    //Message Event
    bot.on(components.Discord.Events.MessageCreate, (msg)=>{

    });

    bot.on(components.Discord.Events.InteractionCreate, async(interaction)=>{
        if(interaction.isChatInputCommand()) {
            console.log(`[Event Handler]: Command /${interaction.commandName} used by ` + interaction.member.nickname)
            await components.CommandsParser.parseCommand(interaction);
        }
        else if(interaction.isButton()){
            console.log("[Event Handler]: Button used for "+(interaction.customId.split("/"))[0]);
            await components.CommandsParser.parseButton(interaction);
        }
    });
}
///////////////////////////////////////////////////////////////////////////////////
export default {
    init,
}