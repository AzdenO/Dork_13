/**
 * Module dealing with providing functionality for the insult command
 * @param interaction Discord.js InteractionCallBack object
 * @param insults a list of pre-prepared insults
 * @returns {Promise<void>}
 */
export default async(interaction, insults) => {
    const selected = insults[Math.floor(Math.random()*insults.length)];
    const insult = prepareInsult(selected, interaction.options.getMember("user"));
    interaction.reply(insult);
}
///////////////////////////////////////////////////////////////////////////
function prepareInsult(insult,user){
    return insult.replace("{member}",`<@${user.id}>`);
}