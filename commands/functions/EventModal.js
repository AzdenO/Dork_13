
import {TextInputBuilder, ModalBuilder, ActionRowBuilder, TextInputStyle} from "discord.js"

export default async (interaction, type)=>{

    const form = new ModalBuilder();
    form.setCustomId(interaction.options.getSubcommand());

    const eventName = new TextInputBuilder()
        .setCustomId("event_name")
        .setLabel("Set Event name")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const sherpa = new TextInputBuilder()
        .setCustomId("sherpable")
        .setLabel("Can learners join this? [yes/no]")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const maxLearners = new TextInputBuilder()
        .setCustomId("maxlearn")
        .setLabel("Max learners allowed")
        .setStyle(TextInputStyle.Short)
        .setRequired(false);

    const description = new TextInputBuilder()
        .setCustomId("description")
        .setLabel("Set Event description")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const players = new TextInputBuilder()
        .setCustomId("players")
        .setRequired(false)
        .setLabel("Max Player Count")
        .setStyle(TextInputStyle.Short)

    const time = new TextInputBuilder()
        .setCustomId("time")
        .setRequired(true)
        .setLabel("Set Event time and date")
        .setStyle(TextInputStyle.Short)

    switch(interaction.options.getSubcommand()){

        case "create-raid":
            form.setTitle("Create a Raid Event");
            eventName.setValue(interaction.options.getString("raid"));
            form.addComponents(
                new ActionRowBuilder().addComponents(sherpa),
                new ActionRowBuilder().addComponents(maxLearners)
            )
            break;

        case "create-dungeon":
            form.setTitle("Create a Dungeon Event");
            eventName.setValue(interaction.options.getString("dungeon"));
            form.addComponents(
                new ActionRowBuilder().addComponents(sherpa),
                new ActionRowBuilder().addComponents(maxLearners)
            )
            break;

        case "custom":
            form.setTitle("Create a Custom Event");
            eventName.setPlaceholder("Custom Event");
            form.addComponents(
                new ActionRowBuilder().addComponents(players)
            )
            break;
    }

    form.addComponents(
        new ActionRowBuilder().addComponents(eventName),
        new ActionRowBuilder().addComponents(time),
        new ActionRowBuilder().addComponents(description),
    )

    await interaction.showModal(form);





}