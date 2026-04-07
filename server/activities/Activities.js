/**
 * @module Activities
 * @description handles managing clan activities, such as creating raid/dungeon cards, editing them,etc.
 * @version.0.1
 * @author AzdenO
 */
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//Import modules
import {ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import {CardValidation} from "../../utils/validation/FormValidation.js";
import {MessageFlags} from "discord.js";

import GenerateCard from "./cards/GenerateCard.js";
import {genCode} from "../../utils/random/RandomGenerator.js"
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import dayjs from "dayjs";

//Configure dayjs
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

//Declare globals
let DBManager = null;
let Embeds = null;
let Channel = null;
let ActivityCollection = null;
let config = null;
let ServerBot = null;

let processing = false;

const maximums = {//const object with property name of join method, and a value of the associated maximum identifier
    teacher: "maxTeacher",
    learner: "maxLearn",
    join: "maxJoin",
}

let timezones = {
    GMT: "Europe/London",
    BST: "Europe/London",
    EST: "America/New_York",
    EDT: "America/New_York",
    CST: "America/Chicago",
    CDT: "America/Chicago",
    PST: "America/Los_Angeles"
}

/**
 * Initialise this module
 */

async function init(db,resources,conf,serverBot){
    DBManager = db || {};
    config = conf || {};
    Embeds = resources.getEmbeds();
    ActivityCollection = await DBManager.getCollection("raids","events");
    ServerBot = serverBot;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function assignActivityChannel(channel){
    Channel = channel;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function createActivityCard(interaction){

    console.log("[Activity Manager]: Processing new activity request...");

    processing = true;
    let destinationChannel = null;
    let sherpa=false;

    try{
        let activity = {
            id: genCode(4)
        }
        let maxJoin = null;
        let valData=null;
        if(interaction.customId ==="create-raid" || interaction.customId === "create-dungeon"){
            valData={
                time: interaction.fields.getTextInputValue("time"),
                sherpa: interaction.fields.getTextInputValue("sherpable"),
                sherpanum: interaction.fields.getTextInputValue("maxlearn"),
            }
            if(valData.sherpa==="yes"){
                destinationChannel = await ServerBot.getChannel(config.server.channels.sherpaRuns);
                sherpa=true;
            }else{
                destinationChannel = await ServerBot.getChannel(config.server.channels.raidCards);
            }
            if(interaction.customId==="create-raid"){
                maxJoin=6;
            }else if(interaction.customId==="create-dungeon"){
                maxJoin=3;
            }
        }else{
            destinationChannel = await ServerBot.getChannel(interaction.channelId);
            valData={

                time: interaction.fields.getTextInputValue("time"),
                players: interaction.fields.getTextInputValue("players")
            }
        }
        ////Validate input
        CardValidation.newCard(valData,interaction.customId, sherpa);
        console.log("Success");


        ////Create card
        const content = GenerateCard(interaction,Embeds.activity, activity.id)
        const message = await destinationChannel.send({
            embeds:[content.embed],
            components:[content.buttons.one, content.buttons.two]
        });

        //Create document
        if(sherpa){
            activity.teacher = [interaction.member.displayName];
            activity.learner = [];
            activity.maxLearn = Number(interaction.fields.getTextInputValue("maxlearn"));
            activity.maxTeacher = maxJoin-activity.maxLearn;
        }else{
            activity.join = [interaction.member.displayName];
            activity.maxJoin = maxJoin
        }
        activity.time = content.time;
        activity.inputTime = interaction.fields.getTextInputValue("time");
        activity.title = interaction.fields.getTextInputValue("event_name");
        activity.description = interaction.fields.getTextInputValue("description");
        activity.alt = [];
        activity.messageID = message.id;
        activity.channelID = destinationChannel.id;
        activity.owner = interaction.member.displayName;

        //Send document
        if(await DBManager.newDocument(activity,ActivityCollection)){
            interaction.editReply({
                content:"Card created",
                flags: MessageFlags.Ephemeral
            });
        }else{
            console.log("[Activity Manager]: Failed to send new activity to database")
            interaction.editReply({
                content: "Interal Error, admin contacted",
                flags: MessageFlags.Ephemeral
            });
            const msg = await Channel.messages.fetch(activity.messageID);
            await msg.delete();
        }
    }catch(err){
        let content = null;
        if(err.hasOwnProperty("code") && err.code==="ACVAL"){
            console.log("[Activity Manager]: User failure when creating new card:\n\t"+err.message)
            content = err.message;
        }else{
            console.log("[Activity Manager]: Unidentified error in creating new card: \n\t"+err.message);
            content = "Interal Error, admin contacted"
        }
        interaction.editReply({
            content: content,
            flags: MessageFlags.Ephemeral
        })
    }

    processing = false;


}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function addCardMember(joinData){

    processing = true;
    console.log(`[Activity Manager]: Processing join request by ${joinData.member} on activity ${joinData.activityid}`)
    try{
        let res = null;
        let update = {
            identifier: {id: joinData.activityid},
            mod: {}
        };
        ////Fetch raid document
        const doc = await DBManager.getDocument(ActivityCollection,{id: joinData.activityid});

        const membership = checkCardForMember(doc, joinData.member);

        let max = "NA";
        if(joinData.joinMethod!=="alt"){
            max = doc[maximums[joinData.joinMethod]];
        }
        if(!validateJoin(joinData.joinMethod,max,joinData.interact,joinData.member,update,doc[joinData.joinMethod])){
            processing = false;
            return;
        }


        //fetch old embed
        const msg = await (await ServerBot.getChannel(doc.channelID)).messages.fetch(doc.messageID);
        const oldembed = msg.embeds[0];
        const updated = EmbedBuilder.from(oldembed)
        const fields = updated.data.fields;
        let cardString = "";
        doc[joinData.joinMethod].push(joinData.member);
        if(joinData.joinMethod!=="alt"){
            cardString = getListCapacityLiteral(doc[joinData.joinMethod].length,doc[maximums[joinData.joinMethod]])+"\n";
        }
        for(let member of doc[joinData.joinMethod]){//for every member that exists in that list (we have removed player to be removed)
            cardString+=(member+"\n");//concatenate them onto string
        }
        fields[fields.findIndex(field => field.name === joinData.joinMethod)].value=cardString;

        //Check for removal from other join lists, update card field for this and add to db update object
        if(membership!=="none"){
            removePlayerFromJoinList(membership,update,doc[membership],joinData.member,fields,doc[maximums[membership]]);
        }
        ////Update database
        if(await DBManager.updateDocument(ActivityCollection,update)==="success"){

            updated.setFields(fields);
            await msg.edit({
                embeds:[updated]
            });
            joinData.interact.editReply({
                content:`You have joined the card`,
                flags: MessageFlags.Ephemeral
            })
        }else{
            console.log("[Activity Manager]: Failed to send activity update to database");
            joinData.interact.editReply({
                content:`Internal errror, admin contacted`,
                flags: MessageFlags.Ephemeral
            })
        }
    }catch(err){
        console.log("[Activity Manager]: Unidentified error caught in adding card member:\n\t"+err.message);
        joinData.interact.editReply(
            {
                flags: MessageFlags.Ephemeral,
                content: "Internal errror, admin contacted"
            }
        )
    }



    processing = false;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function removeCardMember(leaveData){

    processing = true;
    console.log(`[Activity Manager]: Processing leave request by ${leaveData.member} on activity ${leaveData.activityid}`);

    try{
        let doc = await getCardFromDB(leaveData.activityid);//get the document from DB
        const membership = checkCardForMember(doc,leaveData.member);//check card for member, all join lists

        let update = {mod:{},identifier: {id: leaveData.activityid}};//instantiate DB update object

        const msg = await (await ServerBot.getChannel(doc.channelID)).messages.fetch(doc.messageID);//fetch the card message
        const oldembed = msg.embeds[0];//create reference to card embed from message
        const updated = EmbedBuilder.from(oldembed)//create a new embed from the current one
        const fields = updated.data.fields;//grab reference to embed fields
        if(membership!=="none"){
            removePlayerFromJoinList(membership,update,doc[membership],leaveData.member,fields,doc[maximums[membership]]);//modifies update object and embed fields to remove player from joined list
        }else{//if membership does not exist
            leaveData.interact.editReply({
                content:`You are not on this card already`,
                flags: MessageFlags.Ephemeral
            });
            processing = false;
            return;
        }
        if(await DBManager.updateDocument(ActivityCollection,update)==="success"){//if update the document to the database is successful

            updated.setFields(fields);//give updated fields to Embed object
            await msg.edit({//edit message
                embeds:[updated]//pass new/updated embed
            });
            leaveData.interact.editReply({//good reply
                content:`You have left the card`,
                flags: MessageFlags.Ephemeral
            })
        }else {
            leaveData.interact.editReply({//bad reply
                content: `Failed to remove you from card`,
                flags: MessageFlags.Ephemeral
            })

        }

    }catch(err){
        console.log("[Activity Manager]: Unidentified error caught in removing card member:\n\t"+err.message);
        leaveData.interact.editReply(
            {
                flags: MessageFlags.Ephemeral,
                content: "Internal errror, admin contacted"
            }
        )
    }

    processing = false;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function editCard(interaction){

    try{
        const doc = await getCardFromDB(interaction.customId.split("/")[2]);
        const edits = {
            time: interaction.fields.getTextInputValue("time"),
            description: interaction.fields.getTextInputValue("description"),
            title: interaction.fields.getTextInputValue("event_name"),
        }
        if(!CardValidation.validateTime(edits.time)){
            await interaction.editReply({
                content: "Time and Date not in correct format"
            })
            return;
        }
        let update = {
            identifier: {id: interaction.customId.split("/")[2]},
            mod: {
                $set:{
                    inputTime: edits.time,
                    description: edits.description,
                    title: edits.title,
                    time: getUnixSeconds(edits.time)
                }
            }
        }
        const msg = await (await ServerBot.getChannel(doc.channelID)).messages.fetch(doc.messageID);//fetch the card message
        const oldembed = msg.embeds[0];//create reference to card embed from message
        const updated = EmbedBuilder.from(oldembed)//create a new embed from the current one
        const fields = updated.data.fields;//grab reference to embed fields
        fields[0].value = edits.title;
        fields[1].value = `<t:${getUnixSeconds(edits.time)}:F>
<t:${getUnixSeconds(edits.time)}:R>`
        fields[2].value = edits.description;

        if(await DBManager.updateDocument(ActivityCollection,update)==="success"){//if update the document to the database is successful

            updated.setFields(fields);//give updated fields to Embed object
            await msg.edit({//edit message
                embeds:[updated]//pass new/updated embed
            });
            interaction.editReply({//good reply
                content:`Card updated`,
                flags: MessageFlags.Ephemeral
            })
        }else {
            interaction.editReply({//bad reply
                content: `Failed to update card`,
                flags: MessageFlags.Ephemeral
            })

        }

    }catch(err){
        console.log("[Activity Manager]: Unidentified error in card editing:\n\t"+err.message);
        interaction.editReply({
            content: `Internal error, admin contacted`,
        })
    }




}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Function to send an activity edit modal to an interactors client, filling it in with activity information
 * @param editData
 * @returns {Promise<void>}
 */
async function getEditModal(editData){

    const doc = await getCardFromDB(editData.activityid);

    if(!verifyOwner(editData.interact,doc.owner)){
        console.log(`[Activity Manager]: ${editData.member} is not the owner of the card or an admin. Delete request rejected`);
        editData.interact.reply({
            content: "You are not the owner of this card or an admin"
        })
        return;
    }

    const form = new ModalBuilder()
    form.setCustomId("activity/edit/"+editData.activityid);
    form.setTitle("Edit Activity: "+doc.title);
    const eventName = new TextInputBuilder()
        .setCustomId("event_name")
        .setLabel("Set Event name")
        .setValue(doc.title)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const description = new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Set Event description")
        .setValue(doc.description)
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const time = new TextInputBuilder()
        .setCustomId("time")
        .setRequired(true)
        .setValue(doc.inputTime)
        .setLabel("Set Event time and date")
        .setStyle(TextInputStyle.Short)

    form.addComponents(
        new ActionRowBuilder().addComponents(time),
        new ActionRowBuilder().addComponents(description),
        new ActionRowBuilder().addComponents(eventName)
    )

    await editData.interact.showModal(form);

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function setRecur(){

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function deleteCard(deleteData){

    console.log(`[Activity Manager]: Processing card deletion request by ${deleteData.member} for activity ${deleteData.activityid}`);

    try{
        const doc = await getCardFromDB(deleteData.activityid);

        if(!verifyOwner(deleteData.interact,doc.owner)){
            console.log(`[Activity Manager]: ${deleteData.member} is not the owner of the card or an admin. Delete request rejected`);
            deleteData.interact.editReply({
                content: "You are not the owner of this card or an admin",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const msg = await (await ServerBot.getChannel(doc.channelID)).messages.fetch(doc.messageID);
        await msg.delete();

        await DBManager.deleteDocument(ActivityCollection,{id: deleteData.activityid});

        deleteData.interact.editReply({
            content: "Activity has been deleted",
            flags: MessageFlags.Ephemeral
        })
    }catch(err){
        console.log("[Activity Manager]: Unidentified error caught in removing card member:\n\t"+err.message);
        deleteData.interact.editReply({
            content: "Internal error, admin contacted",
            flags: MessageFlags.Ephemeral
        })
    }

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Function to remove a player from a join list they belong to, and provide an update property
 * @param membership {string} The list name of the join method the player currently belongs too
 * @param update {{identifier:{any},mod:{}}} Update object with "mod" as property. This function will add a property to this property
 * @param joinedList {Array<String>} The list/join method the player is currently a member of
 * @param player {String} Name/Display Name of player to be removed
 * @param fields  Fields fetched from activity message embed
 * @param listCapacity The maximum capacity of this join list
 *
 */
function removePlayerFromJoinList(membership, update, joinedList, player, fields,listCapacity){

    let oldFieldIndex = null;//instantiate empty variable to hold value of field index for join list where player is located

    oldFieldIndex = fields.findIndex(field => field.name === membership);//find the index in embed fields where membership exists
    let cardJoinString = "";//instantiate empty string which will be used to build new field value
    const index = joinedList.indexOf(player);//get the index in the join list where player is located
    joinedList.splice(index, 1);//remove player from that list
    if(membership!=="alt"){
        cardJoinString = getListCapacityLiteral(joinedList.length,listCapacity)+"\n";
    }
    for(let member of joinedList){//for every member that exists in that list (we have removed player to be removed)
        cardJoinString+=(member+"\n");//concatenate them onto string
    }
    fields[oldFieldIndex].value = cardJoinString;//give field new value
    switch(membership){//switch statement to append to update object the document modification to send to mongoDB cluster
        case "join":
            update.mod.$set = {join: joinedList};//e.g. with modified doc list, set the "join" property on the DB object to modified list
            break;
        case "teacher":
            update.mod.$set = {teacher: joinedList};
            break;
        case "learner":
            update.mod.$set = {learner: joinedList};
            break;
        case "alt":
            update.mod.$set = {alt: joinedList};
            break;
    }


}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Check if the member exists on the card and return the list they are in, otherwise return "none"
 * @param doc Activity document retrieved from database storage
 * @param member String value of member display name
 * @returns {string} String indicating list membership, or "none" if no membership found
 */
function checkCardForMember(doc, member){
    const lists = ["join","teacher","learner","alt"];

    for(let list of lists){
        if(doc[list]?.includes(member)){
            return list
        }
    }
    return "none";
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Validate the player joining the card in the method they wish to do so. If validated, add modification property to DB update
 * @param method {String} The method by which the player wishes to join the activity
 * @param max {Number/String} The maximum length/allow number of players in the desired join lsit
 * @param interact {Interaction} Discord callback object containing client interact data and a way to reply to discord
 * @param player {string} The name of the player wishing to join the activity
 * @param update {{identifier:{any},mod:{}}} Update object with "mod" as property. This function will add a property to this property
 */
function validateJoin(method,max,interact,player,update,joinList){
    if(joinList?.includes(player)){//if this join list already includes the player
        interact.editReply({//reply they are already included
            content:`You are already on this card as ${method}`,
            flags: MessageFlags.Ephemeral
        });
        return false;
    }
    else if(max!=="NA" && joinList?.length+1>max){//if a maximum exists and adding to the player would result in passing the max
        interact.editReply({//reply that the list is full
            content:`${method} list is full`,
            flags: MessageFlags.Ephemeral
        });
        return false;
    }else{//add property to update object, updating
        update.mod.$addToSet = {[method]: player};
        return true;
    }


}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Small function to verify a button click came from the only user allowed to edit the card, unless the
 * button clicker is Azden or has the role Supreme General
 */
function verifyOwner(interact, expected){
    if(interact.member.displayName!==expected){
        for(let role of config.server.adminRoles){
            if(interact.member.roles.cache.has(role)){
                return true;
            }
        }
        return false;
    }
    return true;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getCardFromDB(actid){
    return await DBManager.getDocument(ActivityCollection,{id: actid});
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function getUnixSeconds(input){
    const split = input.split(" ");
    const date = dayjs.tz(split[0]+" "+split[1],"DD/MM HH/mm",timezones[split[2]]);
    return Math.floor(date.valueOf() / 1000);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function getListCapacityLiteral(current, capacity){
    return "Capacity: "+current+"/"+capacity;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
export default{
    init,
    assignActivityChannel,
    createActivityCard,
    addCardMember,
    removeCardMember,
    editCard,
    deleteCard,
    getEditModal
}