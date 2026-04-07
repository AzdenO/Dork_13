import {SlashCommandBuilder} from "discord.js";

export const simulate_join = new SlashCommandBuilder().setName(
    "simulate_join").setDescription(
    "Simulate Join").setDefaultMemberPermissions(8)

export const insult = new SlashCommandBuilder().setName("insult").setDescription("Insult another member").addUserOption(option => option.setName("user").setDescription("The server member to insult").setRequired(true));

export const location = new SlashCommandBuilder().setName("set_location").setDescription("Update your server name to contain your earthly location").addStringOption(option => option.setName("country").setDescription("The country or region you are from").setRequired(true).addChoices({name: "United States", value: "US"},{name: "United Kingdom",value:"UK"},{name:"Canada",value:"CA"},{name:"Mainland Europe",value:"EU"},{name:"Baltic Nations",value:"BA"},{name: "South Africa",value:"SA"}));

export const activity = new SlashCommandBuilder().setName("activity")
    .setDescription("create, edit or delete an activity")
    //CREATE RAID
    .addSubcommand(sub=>
        sub.setName("create-raid")
           .setDescription("create a raid activity")
            .addStringOption(option=>
                option
                    .setName("raid")
                    .setDescription("Select a raid")
                    .setRequired(true)
                    .addChoices(
                    {name:"Vault of Glass", value:"Vault of Glass"},
                        {name:"Vow of the Disciple", value: "Vow of the Disciple"},
                        {name:"Kings Fall", value: "Kings Fall"},
                        {name:"Salvations Edge",value:"Salvations Edge"},
                        {name:"Desert Perpetual",value:"Desert Perpetual"},
                        {name:"Desert Perpetual Epic",value:"Desert Perpetual Epic"},
                        {name:"Garden of Salvation",value:"Garden of Salvation"},
                        {name:"Deep Stone Crypt",value:"Deep Stone Crypt"},
                        {name:"Crota's End",value:"Crota's End"},
                        {name:"Last Wish",value:"Last Wish"},
                        {name:"Root of Nightmares",value:"Root of Nightmares"}
                    )

            )
    )
    .addSubcommand(sub=>
        sub
            .setName("create-dungeon")
            .setDescription("create a dungeon activity")
            .addStringOption(option=>
                option
                    .setName("dungeon")
                    .setDescription("Select a dungeon")
                    .setRequired(true)
                    .addChoices(
                    {name:"Prophecy",value:"prof"},
                        {name:"Warlord's Ruin", value:"wr"},
                        {name:"Duality",value:"dual"},
                        {name:"Vesper's Host",value:"vh"},
                        {name:"Sundered Doctrine",value:"sd"},
                        {name:"Equilibrium",value:"eq"},
                        {name:"Shattered Throne",value:"st"},
                        {name:"Grasp of Avarice",value:"ga"},
                        {name:"Spire of the Watcher",value:"sw"}
                    )
            )
    )
    .addSubcommand(sub=>
        sub
            .setName("custom")
            .setDescription("Create a custom activity")
    )
export const UncleProtocol = new SlashCommandBuilder()
    .setName("dunk-protocol")
    .setDescription("Enable Protocol Grumble-Uncle 1-A-A")
    .setDefaultMemberPermissions(8)
    .addStringOption(option =>
        option
            .setName("state")
            .setDescription("Enable or Disable")
            .setRequired(true)
            .addChoices(
                {name:"Enable",value:"off"},
                {name: "Disable",value:"on"}
            )
    )