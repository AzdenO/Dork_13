/**
 * @module Activities
 * @description handles managing clan activities, such as creating raid/dungeon cards, editing them, as well as scheduling
 * future activity jobs such as notifications and auto-deletion
 * @version 1.1.1
 * @author AzdenO
 */
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//Import modules
import {ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";//static classes imported from discord lib
import {CardValidation} from "../../utils/validation/FormValidation.js";//import card validations functions
import {MessageFlags} from "discord.js";//discord message flags such as ephemeral, so only the user can see bots reply

import GenerateCard from "./cards/GenerateCard.js";//import function to generate the actual embed and fill in info
import {genCode} from "../../utils/random/RandomGenerator.js"//import function to generate unique ID code for an activity
import customParseFormat from 'dayjs/plugin/customParseFormat.js'//this is all dayjs stuff used to create a date, needs to be centralised in a util module somewhere
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import dayjs from "dayjs";
import DorkTime from "../../utils/time/Time.js"

//Configure dayjs
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

//Declare globals
let DBManager = null;//Empty variable that will hold DB abstraction module object
let Embeds = null;//object of embeds fetched from resources module
let Channel = null;
let ActivityCollection = null;//the collection for activities on the database
let config = null;//variable to hold server config
let ServerBot = null;//variable to hold server bot class instance
let Logger = null;

let processing = false;//ignore this, will get rid of at some point

const maximums = {//const object with property name of join method, and a value of the associated maximum identifier on a db doc
    teacher: "maxTeacher",
    learner: "maxLearn",
    join: "maxJoin",
}

const timezones = {//map of timezones, mapping to dayjs valid strings for timezones
    GMT: "Europe/London",
    BST: "Europe/London",
    EST: "America/New_York",
    EDT: "America/New_York",
    CST: "America/Chicago",
    CDT: "America/Chicago",
    PST: "America/Los_Angeles"
}

let NotificationJobs = {}//dictionary to hold references to scheduled notification jobs
let DeletionJobs = {}//dictionary to hold references to scheduled notification jobs

/**
 * Initialise this module
 * @param db The object exported by the database abstraction module for use in DB operations
 * @param resources The object exported by the resources module, which handles all local IO operations and loading of resources and configs
 * @param conf The server config object
 * @param serverBot The instance of the Dork class, an layer of abstraction that wraps over the majority of the discord library
 */

async function init(db,resources,conf,serverBot,logger){
    DBManager = db || {};//if db null or undefined, an empty object
    config = conf || {};//if conf null or undefined, an empty object
    Embeds = resources.getEmbeds();//assign embeds
    ActivityCollection = await DBManager.getCollection("raids","events");//get the raids collection from the DB. This needs removing and a single identifier such as "activities" used to let the db know what collection it will need to use. Instead of system edges requiring to store a reference to their own collection
    ServerBot = serverBot;//assign server bot to globally accessible variable
    Logger = logger;

    scheduleReset();

}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @deprecated This function is no longer necessary
 * @param channel
 */
function assignActivityChannel(channel){
    Channel = channel;
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Function to create an activity from a form submission
 * @param interaction The interaction object provided by discord when a interaction such as form, command or button click is submitted
 * @returns {Promise<void>}
 */
async function createActivityCard(interaction){

    Logger("Activity Manager","Processing new activity request...","INFO");//log line

    processing = true;//ignore this flag, does nothing, needs removing
    let destinationChannel = null;//empty function global to assign the channel where the card will be send
    let sherpa=false;//boolean as to whether this activity will be created as a sherpa run

    try{
        let activity = {//instantiate activity object which will be sent to DB, and generate a unique 4-digit code to identify the activity with
            id: genCode(4)//takes as a parameter the length of the code to generate
        }
        let maxJoin = null;//global function variable to hold maximum allowed players for an activity
        let valData=null;//instantiate val data outside of if-block so can be used in validation function
        if(interaction.customId ==="create-raid" || interaction.customId === "create-dungeon"){//if were creating a raid or dungeon card
            valData={//object that is instantiated and given properties of form submission data. This is passed to the input validator
                time: interaction.fields.getTextInputValue("time"),
                sherpa: interaction.fields.getTextInputValue("sherpable"),
                sherpanum: interaction.fields.getTextInputValue("maxlearn"),
            }
            if(valData.sherpa==="yes"){//if this is a sherpa run
                destinationChannel = await ServerBot.getChannel(config.server.channels.sherpaRuns);//destination channel is sherpa runs
                sherpa=true;
            }else{//if not a sherpa run
                destinationChannel = await ServerBot.getChannel(config.server.channels.raidCards);//destination channel is normal runs
            }
            if(interaction.customId==="create-raid"){//if creating a raid
                maxJoin=6;//maximum allowed is 6
            }else if(interaction.customId==="create-dungeon"){//if creating a dungeon
                maxJoin=3;//maximum allowed is 3
            }
        }else{//if a custom activity
            destinationChannel = await ServerBot.getChannel(interaction.channelId);//the destination channel is the channel the command was used in
            maxJoin = Number(interaction.fields.getTextInputValue("players"));//convert max players of custom activity to a number
            valData={//fill val data

                time: interaction.fields.getTextInputValue("time"),
                players: interaction.fields.getTextInputValue("players")
            }
        }
        ////Validate input
        CardValidation.newCard(valData,interaction.customId, sherpa);
        Logger("Activity Manager",`New activity ${interaction.fields.getTextInputValue("event_name")} created successfully`,"INFO");


        ////Create card
        const content = GenerateCard(interaction,Embeds.activity, activity.id, sherpa)//generate the embed from form submission data as well as the embed template global
        const message = await destinationChannel.send({//send message
            embeds:[content.embed],//assign embed/card
            components:[content.buttons.one, content.buttons.two]//assign the two rows of buttons to be sent
        });

        //Fill in the rest of the DB document properties/attributes
        if(sherpa){//if a sherpa run
            activity.teacher = [interaction.member.id];//list with form submitter as an element
            activity.learner = [];//empty list
            activity.maxLearn = Number(interaction.fields.getTextInputValue("maxlearn"));//convert maximum number of learners from form into number and assign to document
            activity.maxTeacher = maxJoin-activity.maxLearn;//maximum amount of teachers is the maxJoin - the maximum learners
        }else{//if not a sherpa run
            activity.join = [interaction.member.id];//single join option
            activity.maxJoin = maxJoin//provide document with maximum allowed joined players
        }
        //fill in rest of document attributes not specific to either sherpa or normal runs
        activity.time = content.time;//time in unix seconds
        activity.inputTime = interaction.fields.getTextInputValue("time");//the time that was input
        activity.title = interaction.fields.getTextInputValue("event_name");//activity title
        activity.description = interaction.fields.getTextInputValue("description");//activity description
        activity.alt = [];//empty list for alts
        activity.messageID = message.id;//the id of the message we sent, so we can edit or delete the message later on
        activity.channelID = destinationChannel.id;//the destination channel id, so we can fetch the message from its channel when needed
        activity.owner = interaction.member.id;//set the owner of the activity

        //Send document
        if(await DBManager.newDocument(activity,ActivityCollection)){//if sending the document is successful
            scheduleActivityJobs(activity.id, activity.time*1000)//schedule the activity jobs such as auto-notify and auto-delete
            interaction.editReply({//reply to the submitter
                content:"Card created",
                flags: MessageFlags.Ephemeral//only the submitter can see the bots reply
            });
        }else{//if fail to send the document to the DB
            Logger("[Activity Manager]: Failed to send new activity to database")
            interaction.editReply({//reply with failure
                content: "Interal Error, admin contacted",
                flags: MessageFlags.Ephemeral
            });
            const msg = await destinationChannel.messages.fetch(activity.messageID);//fetch activity message
            await msg.delete();//delete it as it is not on the DB
        }
    }catch(err){//catch any thrown errors in this entire process
        let content = null;//empty variable to hold content to send back to submitter
        if(err.hasOwnProperty("code") && err.code==="ACVAL"){//if the error thrown has the code given by form validation
            Logger("Activity Manager","User failure when creating new card:\n\t"+err.message,"WARN")
            content = err.message;//send back santized error message to user
        }else{
            Logger("Activity Manager","Unidentified error in creating new card: \n\t"+err.message,"ERROR");//general unidentified error
            content = "Interal Error, admin contacted"
        }
        interaction.editReply({//send error reply
            content: content,
            flags: MessageFlags.Ephemeral
        })
    }

    processing = false;


}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Add a member to an activity/let someone join the card
 * @param joinData Object containing data necessary to fulfill this function
 * @returns {Promise<void>}
 */
async function addCardMember(joinData){

    processing = true;//deprecated flag, ignore
    Logger("Activity Manager",`Processing join request by ${joinData.member} on activity ${joinData.activityid}`,"INFO")
    try{
        let res = null;
        let update = {//instantiate update object, with id of activity and empty modification attribute, this is passed to the update document function of the DB to update an activity document
            identifier: {id: joinData.activityid},//document/activity identifier
            mod: {}
        };
        ////Fetch raid document
        const doc = await DBManager.getDocument(ActivityCollection,update.identifier);//fetch the activity document from the database

        const membership = checkCardForMember(doc, joinData.interact.member);//check whether the joiner is already on a join list of the card, and return the list they are a member of if so

        let max = "NA";
        if(joinData.joinMethod!=="alt"){//if the player isnt trying to join as an alt
            max = doc[maximums[joinData.joinMethod]];//fetch the maximum allowed of that join list
        }
        if(!validateJoin(joinData.joinMethod,max,joinData.interact,joinData.member,update,doc[joinData.joinMethod])){//check that the player isnt already on the join list they are trying to join to, and that the maximum of that list has not been reached
            processing = false;
            return;//exit if join validation fails, reply occurs inside this function, but should really occur on the outside, will change
        }


        //fetch old embed
        const msg = await (await ServerBot.getChannel(doc.channelID)).messages.fetch(doc.messageID);//fetch the activity message
        const oldembed = msg.embeds[0];//create reference to embed on the message
        const updated = EmbedBuilder.from(oldembed)//create a new embed builder from the old one
        const fields = updated.data.fields;//create reference to fields on the embed
        let cardString = "";//create empty string which will be constructed into the new data for a join field/list
        doc[joinData.joinMethod].push(joinData.interact.member.id);//add the users id to the join list they are wanting to join
        if(joinData.joinMethod!=="alt"){//if they are not trying to join as alt
            cardString = getListCapacityLiteral(doc[joinData.joinMethod].length,doc[maximums[joinData.joinMethod]])+"\n";//get capacity string of that join list
        }
        for(let member of doc[joinData.joinMethod]){//for every member that exists in that list
            const name = (await ServerBot.getMember(member)).displayName;//fetch member from discord and append their display name to cardJoinString
            cardString+=(name+"\n");//concatenate them onto string
        }
        fields[fields.findIndex(field => field.name === joinData.joinMethod)].value=cardString;//where the field on the embed is equal to the join list the user is wanting to join, reset its value to the constructed join string

        //Check for removal from other join lists, update card field for this and add to db update object
        if(membership!=="none"){//if the user already existed on a join list
            await removePlayerFromJoinList(membership,update,doc[membership],joinData.member,fields,doc[maximums[membership]],joinData.interact);//remove the player from that join list and add a property to the update.mod object
        }
        ////Update database
        if(await DBManager.updateDocument(ActivityCollection,update)==="success"){//update document to database

            updated.setFields(fields);//set the new embed/card fields
            await msg.edit({//edit the message, passing in the new embed
                embeds:[updated]
            });
            joinData.interact.editReply({//reply that they have joined the card
                content:`You have joined the card`,
                flags: MessageFlags.Ephemeral
            })
        }else{
            Logger("Activity Manager","Failed to send activity update to database","ERROR");
            joinData.interact.editReply({
                content:`Internal errror, admin contacted`,
                flags: MessageFlags.Ephemeral
            })
        }
    }catch(err){//catch any unidentified errors
        Logger("Activity Manager","Unidentified error caught in adding card member:\n\t"+err.stack,"ERROR");
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
    Logger("Activity Manager",`Processing leave request by ${leaveData.member} on activity ${leaveData.activityid}`,"INFO");

    try{
        let doc = await getCardFromDB(leaveData.activityid);//get the document from DB
        const membership = checkCardForMember(doc,leaveData.interact.member);//check card for member, all join lists

        let update = {identifier: {id: leaveData.activityid},mod:{}};//instantiate DB update object

        const msg = await (await ServerBot.getChannel(doc.channelID)).messages.fetch(doc.messageID);//fetch the card message
        const oldembed = msg.embeds[0];//create reference to card embed from message
        const updated = EmbedBuilder.from(oldembed)//create a new embed from the current one
        const fields = updated.data.fields;//grab reference to embed fields
        if(membership!=="none"){
            await removePlayerFromJoinList(membership,update,doc[membership],leaveData.member,fields,doc[maximums[membership]],leaveData.interact);//modifies update object and embed fields to remove player from joined list
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
        Logger("Activity Manager","Unidentified error caught in removing card member:\n\t"+err.stack,"ERROR");
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
    Logger("Activity Manager",`Processing edit request for activity ${interaction.customId.split("/")[2]} by ${interaction.member.displayName}`,"INFO")
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
            cancelActivityJobs(doc.id);
            scheduleActivityJobs(doc.id, getUnixSeconds(edits.time)*1000);
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
        Logger("Activity Manager","Unidentified error in card editing:\n"+err.stack,"ERROR");
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
        Logger("Activity Manager",`${editData.member} is not the owner of the card or an admin. Edit request rejected`,"WARN");
        editData.interact.reply({
            content: "You are not the owner of this card or an admin",
            flags: MessageFlags.Ephemeral
        })
        return;
    }

    const form = new ModalBuilder()
    form.setCustomId("activity/edit/"+editData.activityid);
    let title = "";
    let count = 0;
    for(let char of doc.title){
        title += char;
        count++;
        if(count===45){
            break;
        }
    }
    form.setTitle(title);
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
async function deleteCard(deleteData,override=false){

    Logger("Activity Manager",`Processing card deletion request by ${deleteData.member} for activity ${deleteData.activityid}`,"INFO");

    if(override){
        Logger("Activity Manager",`Deletion request by module override`,"INFO");
    }

    try{
        const doc = await getCardFromDB(deleteData.activityid);

        if(!verifyOwner(deleteData.interact,doc.owner,override)){
            Logger("Activity Manager",`${deleteData.member} is not the owner of the card or an admin. Delete request rejected`,"WARN");
            deleteData.interact.editReply({
                content: "You are not the owner of this card or an admin",
                flags: MessageFlags.Ephemeral
            })
            return;
        }

        const msg = await (await ServerBot.getChannel(doc.channelID)).messages.fetch(doc.messageID);
        msg.delete();

        await DBManager.deleteDocument(ActivityCollection,{id: deleteData.activityid});
        if(!override){
            deleteData.interact.editReply({
                content: "Activity has been deleted",
                flags: MessageFlags.Ephemeral
            })
        }

    }catch(err){
        Logger("Activity Manager","Unidentified error caught in deleting card:\n\t"+err.message,"INFO");
        if(!override){
            deleteData.interact.editReply({
                content: "Internal error, admin contacted",
                flags: MessageFlags.Ephemeral
            })
        }

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
async function removePlayerFromJoinList(membership, update, joinedList, player, fields,listCapacity,interact){

    let oldFieldIndex = null;//instantiate empty variable to hold value of field index for join list where player is located

    oldFieldIndex = fields.findIndex(field => field.name === membership);//find the index in embed fields where membership exists
    let cardJoinString = "";//instantiate empty string which will be used to build new field value
    const index = joinedList.indexOf(interact.member.id);//get the index in the join list where player is located
    joinedList.splice(index, 1);//remove player from that list
    if(membership!=="alt"){
        cardJoinString = getListCapacityLiteral(joinedList.length,listCapacity)+"\n";
    }
    for(let member of joinedList){//for every member that exists in that list (we have removed player to be removed)
        const name = (await ServerBot.getMember(member)).displayName
        cardJoinString+=(name+"\n");//concatenate them onto string
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
        if(doc[list]?.includes(member.id)){
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
    if(joinList?.includes(interact.member.id)){//if this join list already includes the player
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
        update.mod.$addToSet = {[method]: interact.member.id};
        return true;
    }


}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Small function to verify a button click came from the only user allowed to edit the card, unless the
 * button clicker is Azden or has the role Supreme General
 */
function verifyOwner(interact, expected,override){
    if(override){
        return true;
    }

    if(interact.member.id!==expected){
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
/**
 * Function to automatically notify people on a card when the event is close to start
 * @returns {Promise<void>}
 */
async function autoNotifyJoined(activityID){
    let joined = null;
    let max=null;

    Logger("Activity Manager","Sending activity notifications for activity "+activityID,"INFO");

    const doc = await getCardFromDB(activityID);

    if(doc.hasOwnProperty("teacher")){
        joined = [...doc.teacher,...doc.learner];
        max = doc.maxTeacher+doc.maxLearn
    }else{
        joined = doc.join
        max = doc.maxJoin
    }
    for(let memberid of joined){
        const member = await ServerBot.getMember(memberid);
        await member.send(`Activity ${doc.title} starting in 30 minutes`)
    }
    if(joined.length<max){
        for(let memberid of doc.alt){
            const member = await ServerBot.getMember(memberid);
            member.send(`You are required as an alt on activity ${doc.title} starting in 30 minutes`)
        }
    }


}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Function to delete a card, utilised as part of a scheduled job
 * @param activityID The ID of the activity to be deleted
 * @returns {Promise<void>}
 */
async function autoDelete(activityID){
    Logger("Activity Manager","Preparing to auto-delete activity "+activityID,"INFO");
    await deleteCard({
        activityid: activityID,
        member: "SCHEDULED DELETION",
        interact: null
    },true);
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 *
 * @param activityID The ID of the activity
 * @param eventTime The scheduled event time in unix milliseconds (milliseconds since the unix epoch)
 */
function scheduleActivityJobs(activityID,eventTime){

    const delay = config.activities.jobDelay//fetch configured job delay value (is a number in milliseconds)

    if(eventTime-Date.now()>DorkTime.getDayMillis()){
        Logger("Activity Manager","Activity commences in more than a day, deferring job scheduling","INFO");
        return;
    }

    if(eventTime - delay <= Date.now()){
        Logger("Activity Manager","Cannot schedule auto-notify for "+activityID+" when notification window has passed","WARN");
    }else{
        NotificationJobs[activityID]= setTimeout(async()=>{//schedule auto-notify
            await autoNotifyJoined(activityID);
        },(eventTime-delay)-Date.now())//notify sometime before event time
    }
    if(eventTime + delay <= Date.now()){
        Logger("Activity Manager","Cannot schedule auto-delete for "+activityID+" when event deletion window has passed","WARN");
    }else{
        DeletionJobs[activityID]= setTimeout(async()=>{//schedule delete
            await autoDelete(activityID);
        },(eventTime+delay)-Date.now())//delete some time after event time
    }
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function cancelActivityJobs(activityID){
    Logger("Activity Manager","Preparing to cancel scheduled jobs for activity "+activityID,"INFO");
    const notifyID = NotificationJobs[activityID]
    const deleteID = DeletionJobs[activityID]

    if(notifyID){
        clearTimeout(notifyID);
        delete NotificationJobs[activityID];
    }
    if(deleteID){
        clearTimeout(deleteID);
        delete DeletionJobs[activityID];
    }
    Logger("Activity Manager","Deleted scheduled jobs for activity "+activityID,"INFO");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Function called on start-up externally, to fetch all activities from the database and schedule auto-delete and auto-notify jobs
 * @returns {Promise<void>}
 */
async function compileJobs(){
    Logger("Activity Manager","Compiling auto jobs for all scheduled activities","INFO");
    const docs = await DBManager.getAllDocuments(ActivityCollection);
    for(let activity of docs){
        scheduleActivityJobs(activity.id, activity.time*1000);
        Logger("Activity Manager","Scheduled jobs for activity "+activity.id,"INFO");
    }
    Logger("Activity Manager","Job compilation complete","INFO");
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
async function getCardFromDB(actid){
    Logger("Activity Manager","Retrieving activity details from database","INFO")
    try{
        return await DBManager.getDocument(ActivityCollection,{id: actid});
    }catch(err){
        Logger("Activity Manager","Failed to acquire activity details from database","ERROR")
    }
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
/**
 * Function reset the module cached jobs
 * @returns {Promise<void>}
 */
async function reset(){
    Logger("Activity Manager","Midnight reset commencing, clearing jobs cache and re-compiling","INFO");

    //clear any active jobs, if any exist
    Object.values(DeletionJobs).forEach(job =>{
        clearTimeout(job)
    });
    Object.values(NotificationJobs).forEach(job =>{
        clearTimeout(job)
    });
    DeletionJobs = {};
    NotificationJobs = {};

    try{
        await compileJobs();
        Logger("Activity Manager","Reset completed","INFO");
    }catch(e){
        Logger("Activity Manager","Failed to transition to full reset:\n"+e.stack,"ERROR");
    }
    scheduleReset();
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function scheduleReset(){

    Logger("Activity Manager","Scheduling new midnight cache reset","INFO")

    //get the number of milliseconds until midnight
    const delay = DorkTime.midnight();

    setTimeout(async()=>{
        reset();
    },delay)
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
    getEditModal,
    compileJobs,
}