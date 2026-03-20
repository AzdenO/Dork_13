/**
 *
 */
const codes = {
    UK: "[UK]",
    CA: "[CA]",
    EU: "[EU]",
    US: "[US]",
    SA: "[SA]",
    BA: "[BA]"
}
export default async(interaction, flags)=>{
    try{
        const localCode = codes[interaction.options.getString("country")];
        let name = interaction.member.displayName
        console.log("Name: "+name);
        const prepared_nickname = prepareNickname(name);
        interaction.member.setNickname(localCode+" "+prepared_nickname);
        interaction.reply({
            content: "Updated your location to"+localCode,
            flags: flags.Ephemeral
        });
    }catch(error){
        console.log("[Location Updater]: Error in main function:\n\t"+error.message);
        interaction.reply({
            content: "Unable to update location",
            flags: flags.Ephemeral
        })
    }

}
////////////////////////////////////////////////////////////////////////////////////////////////////
function prepareNickname(nickname){
    return nickname.replace(/^\[[A-Z]{2}\]\s*/,"");
}