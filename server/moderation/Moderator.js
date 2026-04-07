/**
 * @module Moderator
 * @description Centralized module dealing with dork moderation features and functions
 * @author AzdenO
 * @version 0.1
 */
let Resources = null;
let AdminChannel = null;
let Bot = null;

import {
    TextInputBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputStyle,
    MessageFlags,
    EmbedBuilder,
    ButtonBuilder, ButtonStyle
} from "discord.js"
/////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Module init function
 * @param resources {Object}
 * @param bot {Dork13}
 */
function init(resources, bot){
    Resources = resources;
    Bot = bot;
}
/////////////////////////////////////////////////////////////////////////////////////////////
function assignAdminChannel(channel){
    AdminChannel = channel;
}
/////////////////////////////////////////////////////////////////////////////////////////////
async function processApplication(appData){

    const formConfig = Resources.getServerConfig().moderation.formData;

    console.log("[Moderation Service]: Application submitted");

    let card = JSON.parse(JSON.stringify(Resources.getEmbeds().modApp));

    for(let x=0; x<5; x++){
        card.fields.push(
            {
                name: formConfig.questions[x].value,
                value: appData.interact.fields.getTextInputValue(formConfig.questions[x].id),
                inline: false
            }
        )
    }
    card.title+=appData.member.displayName;

    try{
        const msg = await AdminChannel.send({
            embeds: [new EmbedBuilder(card)],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(formConfig.buttonIds.approve+appData.member.id)
                        .setLabel("Approve")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(formConfig.buttonIds.reject+appData.member.id)
                        .setLabel("Reject")
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        })
        await appData.interact.reply({
            content:"Your application has been sent",
            flags: MessageFlags.Ephemeral
        });
        console.log("[Moderation Service]: Application results forwarded to admin channel");
    }catch(e){
        console.log("[Moderation Service]: Error in sending application results\n\t"+e.message);
    }

}
/////////////////////////////////////////////////////////////////////////////////////////////
async function sendModApplyForm(applyData){
    console.log("[Moderation Service]: Application request received");
    const form = new ModalBuilder();
    const formConfig = Resources.getServerConfig().moderation.formData;
    form.setCustomId(formConfig.customid);
    form.setTitle("Apply to be a Skill Issues Inc. Enforcer");

    //iteratively add question text inputs to form
    for(let question of formConfig.questions){
        form.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId(question.id)
                    .setRequired(true)
                    .setLabel(question.value)
                    .setStyle(TextInputStyle.Paragraph),
            )
        )
    }

    try{
        await applyData.interact.showModal(form);
        console.log("[Moderation Service]: Enforcer application successfully sent to "+applyData.member.displayName)
    }catch(e){
        console.log("[Moderation Service]: Unable to send enforcer application:\n\t"+e.message);
        await applyData.interact.reply(
            {
                content: "Dork-13 internal error, admin contacted"
            }
        )
    }

}
/////////////////////////////////////////////////////////////////////////////////////////////
async function approveMod(appData){

    console.log("[Moderation Service]: Approving moderator application");
    try{
        const member = await Bot.getMember(appData.appUser);
        await member.roles.add(Resources.getServerConfig().server.modRole);
        await member.send("Woah! Those power hogs over at Skill Issues Inc. actually approved your moderator application. Thanks for wanting to be part of the team my guy!")
        console.log("[Moderation Service]: Approved moderator application for "+member.displayName);
        appData.interact.reply({
            content: "Successfully approved moderator application",
        })
    }catch(e){
        console.log("[Moderation Service]: Failed to approve mod application:\n\t"+e.message);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////
async function rejectMod(rejData){
    console.log("[Moderation Service]: Rejecting moderator application");

    try{
        const member = await Bot.getMember(rejData.appUser);
        await member.send("Apologies, your moderator application was rejected. They did the same thing to me, don't worry");
        console.log("[Moderation Service]: Rejected moderator application for "+member.displayName);
        rejData.interact.reply({
            content: "Successfully rejected moderator application",
        })
    }catch(e){
        console.log("[Moderation Service]: Failed to reject mod application:\n\t"+e.message);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////
export default {
    init,
    processApplication,
    sendModApplyForm,
    assignAdminChannel,
    approveMod,
    rejectMod,
}