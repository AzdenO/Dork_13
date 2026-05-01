/**
 * @module Moderator
 * @description Centralized module dealing with dork moderation features and functions
 * @author AzdenO
 * @version 0.1
 */
let Resources = null;
let Bot = null;

import {
    TextInputStyle,
    MessageFlags,
    ButtonStyle
} from "discord.js"

import RecruitmentService from "./recruitment/Recruitment.js"
/////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Module init function
 * @param resources {Object}
 * @param bot {Dork13}
 */
function init(resources, bot){
    Resources = resources;
    Bot = bot;
    RecruitmentService.init(
        Resources.getServerConfig().moderation.recruitment,
        Resources.getEmbeds().modApp,
        bot
    )
}
/////////////////////////////////////////////////////////////////////////////////////////////
async function processApplication(appData){

    try{
        RecruitmentService.processApplication(appData)
    }catch(err){

    }
}
/////////////////////////////////////////////////////////////////////////////////////////////
async function sendModApplyForm(applyData){

    const form = RecruitmentService.sendRecruitForm(applyData.type);

    try{
        form.setTitle(applyData.interact.member.displayName);
        await applyData.interact.showModal(form);
        console.log("[Moderation Service]: Enforcer application successfully sent to "+applyData.member.displayName)
    }catch(e){
        console.log("[Moderation Service]: Unable to send enforcer application:\n\t"+e.stack);
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
        RecruitmentService.approveRecruitment(appData)
    }catch(e){
        console.log("[Moderation Service]: Failed to approve mod application:\n\t"+e.message);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////
async function rejectMod(rejData){
    console.log("[Moderation Service]: Rejecting moderator application");

    try{
        RecruitmentService.rejectRecruitment(rejData)
    }catch(e){
        console.log("[Moderation Service]: Failed to reject mod application:\n\t"+e.message);
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////
export default {
    init,
    processApplication,
    sendModApplyForm,
    approveMod,
    rejectMod,
}