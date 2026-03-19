import {SlashCommandBuilder} from "discord.js";

export const simulate_join = new SlashCommandBuilder().setName(
    "simulate_join").setDescription(
    "Simulate Join").setDefaultMemberPermissions(8)

export const insult = new SlashCommandBuilder().setName("insult").setDescription("Insult another member").addUserOption(option => option.setName("user").setDescription("The server member to insult").setRequired(true));

export const location = new SlashCommandBuilder().setName("set_location").setDescription("Update your server name to contain your earthly location").addStringOption(option => option.setName("country").setDescription("The country or region you are from").setRequired(true).addChoices({name: "United States", value: "US"},{name: "United Kingdom",value:"UK"},{name:"Canada",value:"CA"},{name:"Mainland Europe",value:"EU"},{name:"Baltic Nations",value:"BA"},{name: "South Africa",value:"SA"}));