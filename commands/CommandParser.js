/**
 * @module CommandParser
 * @description Module dealing with parsing incoming bot commands, handing them off to the appropriate command handlers and returning the result to the bot
 * @author AzdenO
 * @version 0.1
 */
import {REST, Routes, MessageFlags} from "discord.js";
import {simulate_join, insult, location, activity, UncleProtocol, JoinClan} from "./CommandsRegister.js";

let botGlobal = null
let BotResources = null
let ServerBus = null

import simulateJoin from "./functions/SimulateJoin.js";
import InsultCommand from "./functions/insult.js";
import LocationCommand from "./functions/SetLocation.js";
import NotificationAssignment from "./functions/NotificationRoles.js"
import EventModalCreate from "./functions/EventModal.js";
import JoinClanFunc from "./functions/JoinClan.js";
////////////////////////////////////////////////////////////////////////////////////
function init(bot, resources, bus){
    registerCommands(bot);
    botGlobal = bot
    BotResources = resources;
    ServerBus = bus;
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
            break
        case "activity":
            await EventModalCreate(interaction);
            break;
        case "join-clan":
            await JoinClanFunc(interaction, BotResources.getServerConfig.clanLinks);
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
            break;
        case "activity":
            if(btnData[1]==="teacher" || btnData[1]==="learner" || btnData[1]==="join" || btnData[1]==="alt"){
                await interaction.deferReply({flags: MessageFlags.Ephemeral});
                ServerBus.emit("activity-join",{
                    joinMethod: btnData[1],
                    member: interaction.member.displayName,
                    activityid: btnData[2],
                    interact: interaction
                })
            }else if(btnData[1]==="leave"){
                await interaction.deferReply({flags: MessageFlags.Ephemeral});
                ServerBus.emit("activity-leave",{
                    member: interaction.member.displayName,
                    activityid: btnData[2],
                    interact: interaction
                })
            }else if(btnData[1]==="delete"){
                await interaction.deferReply({flags: MessageFlags.Ephemeral});
                ServerBus.emit("activity-delete",{
                    member: interaction.member.displayName,
                    activityid: btnData[2],
                    interact: interaction
                })
            }else if(btnData[1]==="edit"){
                ServerBus.emit("activity-editModal",{
                    member: interaction.member.displayName,
                    activityid: btnData[2],
                    interact: interaction
                })
            }
            break;
        case "moderate":
            if(btnData[1]==="apply"){
                ServerBus.emit("mod-apply",{
                    member: interaction.member,
                    interact: interaction
                })
            }
            if(btnData[1]==="apply-approve"){
                ServerBus.emit("mod-apply-approve",{
                    member: interaction.member,
                    interact: interaction,
                    appUser: btnData[2]
                })
            }
            if(btnData[1]==="apply-reject"){
                ServerBus.emit("mod-apply-reject",{
                    member: interaction.member,
                    interact: interaction,
                    appUser: btnData[2]
                })
            }
            break;

    }
}
////////////////////////////////////////////////////////////////////////////////////
function registerCommands(bot){
    const commands = [
        simulate_join.toJSON(),
        insult.toJSON(),
        location.toJSON(),
        activity.toJSON(),
        UncleProtocol.toJSON(),
        JoinClan.toJSON(),
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