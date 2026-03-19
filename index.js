import Discord from "discord.js";
import DotEnv from "dotenv";
import Commands from "./commands/CommandParser.js";
import Resources from "./resources/Resources.js";
import EventHandler from "./events/eventHandler.js";
///////////////////////////////////////////////////////////////////////////////////////

const dork_13 = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent,
    ]
});

const ResourceManager = new Resources();

DotEnv.configDotenv()

Commands.init(dork_13, ResourceManager);

EventHandler.init({
    Resources: ResourceManager,
    Discord: Discord,
    CommandsParser: Commands
},dork_13);

//////////////////////////////////////////////////////////////////////////////////////

await dork_13.login(process.env.TOKEN);

dork_13.once(Discord.Events.ClientReady, (LoggedIn)=>{
    console.log("Bot Central:// Dork-13 has successfully connected");
});


