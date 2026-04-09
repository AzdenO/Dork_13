import {genNumber} from "../../utils/random/RandomGenerator.js";
import {MessageFlags} from "discord.js";

export default (interaction, clanLinks) =>{

    interaction.reply({
        content: "Here is your clan link:\n\t - "+clanLinks[genNumber(0,clanLinks.length-1)],
        flags: MessageFlags.Ephemeral
    })

}