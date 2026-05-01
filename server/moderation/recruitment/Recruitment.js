let RecruitmentConfig = null;
let appEmbed = null;
let Dork_13 = null;
/////////////////////////////////////////////////////////////////////////
function init(recruitconf,appembed,dork){
    RecruitmentConfig = recruitconf
    appEmbed = appembed
    Dork_13 = dork
}
/////////////////////////////////////////////////////////////////////////
import {
    ActionRowBuilder,
    ButtonBuilder, ButtonStyle,
    EmbedBuilder,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from "discord.js";

/**
 *
 * @param recruitType {String} String constant that evaluates to a recruitment type such as moderator or raid master
 * @returns {ModalBuilder} A correctly configured form
 */
function sendRecruitForm(recruitType){

    validateApplicationType(recruitType);

    console.log("[Moderation Service/Recruitment] sending recruitment form for "+recruitType);

    const form = new ModalBuilder();
    const formConfig = RecruitmentConfig[recruitType].formData;

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
    form.setCustomId(formConfig.customid);
    return form;
}
////////////////////////////////////////////////////////////////////////
async function approveRecruitment(appData){

    validateApplicationType(appData.type)

    console.log("[Moderation Service]: Approving recruitment application for " +appData.type);

    try{
        const member = await Dork_13.getMember(appData.appUser);
        await member.roles.add(RecruitmentConfig[appData.type].role);
        await member.send(RecruitmentConfig[appData.type].approveMessage);
        console.log(`[Moderation Service]: Approved ${appData.type} application for ${member.displayName}`);
        appData.interact.editReply({
            content: `Successfully approved ${appData.type} application`,
            flags: MessageFlags.Ephemeral
        })
    }catch(e){
        console.log(`[Moderation Service]: Failed to approve ${appData.type} application:\n\t`+e.message);
    }
}
////////////////////////////////////////////////////////////////////////
async function rejectRecruitment(appData){
    validateApplicationType(appData.type);

    console.log("[Moderation Service]: Rejecting recruitment application for " +appData.type);

    try{
        const member = await Dork_13.getMember(appData.appUser);
        await member.send(RecruitmentConfig[appData.type].rejectMessage);
        console.log(`[Moderation Service]: Rejected ${appData.type} application for ${member.displayName}`);
        appData.interact.editReply({
            content: `Successfully rejected ${appData.type} application`,
            flags: MessageFlags.Ephemeral
        })
    }catch(e){
        console.log("[Moderation Service]: Failed to reject application:\n\t"+e.message);
    }
}
////////////////////////////////////////////////////////////////////////
async function processApplication(appData){
    validateApplicationType(appData.type);

    const formConfig = RecruitmentConfig[appData.type].formData;

    console.log("[Moderation Service]: Application submitted");

    let card = JSON.parse(JSON.stringify(appEmbed));

    for(let x=0; x<RecruitmentConfig[appData.type].formData.questions.length; x++){
        card.fields.push(
            {
                name: formConfig.questions[x].value,
                value: appData.interact.fields.getTextInputValue(formConfig.questions[x].id),
                inline: false
            }
        )
    }
    card.title=appData.member.displayName;

    try{
        const destination = await Dork_13.getChannel(RecruitmentConfig[appData.type].appDestination);

        const msg = await destination.send({
            embeds: [new EmbedBuilder(card)],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(formConfig.buttonIds.approve+"/"+appData.member.id)
                        .setLabel("Approve")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(formConfig.buttonIds.reject+"/"+appData.member.id)
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
////////////////////////////////////////////////////////////////////////
function validateApplicationType(type){
    if(!RecruitmentConfig.validTypes.includes(type)){
        throw new Error(`Recruitment type (${type}) is not a valid recruitType`);
    }
}
////////////////////////////////////////////////////////////////////////
export default {
    sendRecruitForm,
    approveRecruitment,
    rejectRecruitment,
    processApplication,
    init,

}