import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import dayjs from "dayjs";

import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from "discord.js";

let timezones = {
    GMT: "Europe/London",
    BST: "Europe/London",
    EST: "America/New_York",
    EDT: "America/New_York",
    CST: "America/Chicago",
    CDT: "America/Chicago",
    PST: "America/Los_Angeles"
}

//Configure dayjs
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
/**
 * Generate a new embed card
 * @param interaction
 * @param template
 * @param actID
 * @param sherpa
 */
export default (interaction, template, actID, sherpa) =>{
    ////Create embed
    let card = JSON.parse(JSON.stringify(template));
    //insert name
    card.fields[0].value = interaction.fields.getTextInputValue("event_name");//insert name

    //insert date
    const split = interaction.fields.getTextInputValue("time").split(" ");
    const date = dayjs.tz(split[0]+" "+split[1],"DD/MM HH/mm",timezones[split[2]]);
    const unixSeconds = Math.floor(date.valueOf() / 1000);
    card.fields[1].value = `<t:${unixSeconds}:F>
<t:${unixSeconds}:R>`

    //insert description
    card.fields[2].value = interaction.fields.getTextInputValue("description");

    if(interaction.customId!=="custom" && sherpa){

        let teachers = null;
        if(interaction.customId==="create-raid"){
            teachers = 6-interaction.fields.getTextInputValue("maxlearn");
        }else if(interaction.customId==="create-dungeon"){
            teachers = 3-interaction.fields.getTextInputValue("maxlearn");
        }
        card.fields.push({
            name: "teacher",
            value: "Capacity: 1/"+teachers+"\n"+interaction.member.displayName,
            inline: true
        },{
            name: "learner",
            value: "0/"+interaction.fields.getTextInputValue("maxlearn")+"\n",
            inline: true
        },{
            name: "alt",
            value: " ",
            inline: true
        })
    }else{
        let joinable = null
        if(interaction.customId==="custom"){
            joinable=interaction.fields.getTextInputValue("players");
        }else if(interaction.customId==="create-raid"){
            joinable = 6
        }else if(interaction.customId==="create-dungeon"){
            joinable = 3
        }
        card.fields.push({
            name: "join",
            value: "Capacity: 1/"+joinable+"\n"+interaction.member.displayName,
            inline: true
        },{
            name: "alt",
            value: " ",
            inline: true
        })
    }

    ////Send to database

    ////Send to Discord
    return {
        embed: new EmbedBuilder(card),
        buttons: buildConfigButtons(actID,sherpa),
        time: unixSeconds
    }
}

///////////////////////////////////////////////////////////////////////////////////
function buildConfigButtons(actID,sherpable){

    const row1 = new ActionRowBuilder();

    if(sherpable){
        row1.addComponents(
            new ButtonBuilder().setCustomId("activity/teacher/"+actID).setLabel("Join as Teacher").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("activity/learner/"+actID).setLabel("Join as Learner").setStyle(ButtonStyle.Primary)
        )
    }else{
        row1.addComponents(
            new ButtonBuilder().setCustomId("activity/join/"+actID).setLabel("Join").setStyle(ButtonStyle.Primary)
        )
    }
    row1.addComponents(
        new ButtonBuilder().setCustomId("activity/leave/"+actID).setLabel("Leave").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("activity/alt/"+actID).setLabel("Alt").setStyle(ButtonStyle.Primary)

    );

    const row2 = new ActionRowBuilder();

    row2.addComponents(
        new ButtonBuilder().setCustomId("activity/delete/"+actID).setLabel("Delete").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("activity/edit/"+actID).setLabel("Edit").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("activity/recur/"+actID).setLabel("Recur").setStyle(ButtonStyle.Secondary)
    )

    return {one: row1,two:row2};
}