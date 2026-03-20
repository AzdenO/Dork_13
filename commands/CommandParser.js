/**
 * @module CommandParser
 * @description Module dealing with parsing incoming bot commands, handing them off to the appropriate command handlers and returning the result to the bot
 * @author AzdenO
 * @version 0.1
 */
import {REST, Routes, MessageFlags} from "discord.js";
import {simulate_join, insult, location} from "./CommandsRegister.js";

let botGlobal = null
let BotResources = null

import simulateJoin from "./functions/SimulateJoin.js";
import InsultCommand from "./functions/insult.js";
import LocationCommand from "./functions/SetLocation.js";
import NotificationAssignment from "./functions/NotificationRoles.js"
////////////////////////////////////////////////////////////////////////////////////
function init(bot, resources){
    registerCommands(bot);
    botGlobal = bot
    BotResources = resources;
}
////////////////////////////////////////////////////////////////////////////////////
async function parseCommand(interaction){
    switch(interaction.commandName){
        case "simulate_join":
            simulateJoin(interaction, botGlobal);
            break;
        case "insult":
            InsultCommand(interaction, BotResources.insults);
            break;
        case "set_location":
            await LocationCommand(interaction, MessageFlags);
            break;
        default:
            console.log("[Command Handler]: No such command /"+interaction.commandName);
    }
}
////////////////////////////////////////////////////////////////////////////////////
/**
 * Function to handle a button click and hand logic off to correct function
 * @param interaction
 * @returns {Promise<void>}
 */
async function parseButton(interaction){
    const btnData = interaction.customId.split("/");
    switch(btnData[0]){
        case "notifAssign":
            NotificationAssignment(interaction,btnData[1],MessageFlags);
    }
}
////////////////////////////////////////////////////////////////////////////////////
function registerCommands(bot){
    const commands = [
        simulate_join.toJSON(),
        insult.toJSON(),
        location.toJSON(),
    ]

    const rest = new REST({version:"10"}).setToken(process.env.TOKEN);

    (async ()=>{
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENTID,process.env.SERVERID),{body:commands}
        )
    })();
}
////////////////////////////////////////////////////////////////////////////////////
export default {
    parseCommand,
    parseButton,
    init
}