/**
 * @module Moderator
 * @description Centralized module dealing with dork moderation features and functions
 * @author AzdenO
 * @version 0.8
 */
let Resources = null;
let Bot = null;
let Logger = null;

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
function init(resources, bot,logger){
    Resources = resources;
    Bot = bot;
    RecruitmentService.init(
        Resources.getServerConfig().moderation.recruitment,
        Resources.getEmbeds().modApp,
        bot,
        logger
    )
    Logger = logger
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
        Logger("Moderator Service","application successfully sent to "+applyData.member.displayName,"INFO")
    }catch(e){
        Logger("Moderator Service","Unable to send application:\n\t"+e.stack,"ERROR");
        await applyData.interact.reply(
            {
                content: "Dork-13 internal error, admin contacted"
            }
        )
    }

}
/////////////////////////////////////////////////////////////////////////////////////////////
async function approveMod(appData){

    console.log("Moderator Service","Approving application","INFO");
    try{
        RecruitmentService.approveRecruitment(appData)
    }catch(e){
        console.log("Moderator Service","Failed to approve application:\n\t"+e.message,"ERROR");
    }
}
/////////////////////////////////////////////////////////////////////////////////////////////
async function rejectMod(rejData){
    console.log("Moderator Service","Rejecting application","INFO");

    try{
        RecruitmentService.rejectRecruitment(rejData)
    }catch(e){
        console.log("Moderator Service","Failed to reject application:\n\t"+e.message,"ERROR");
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