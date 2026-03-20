import Discord from "discord.js";
import DotEnv from "dotenv";
import Commands from "./commands/CommandParser.js";
import Resources from "./resources/Resources.js";
import EventHandler from "./events/eventHandler.js";
import Dork from "./bot/Dork13.js"
import ServerManager from "./server/ServerManager.js";
///////////////////////////////////////////////////////////////////////////////////////
/**
 * Initialise new discord client object
 * @type {Client<boolean>} The discord Client object instance
 */
const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent,
    ]
});
/**
 * Initialise new Bot Object, providing the discord client object
 * @type {Dork}
 */
const DorkBot = new Dork(client);

//////////////////////////////////////////////////////////////////////////////////////
/**
 * Initialise resource manager
 * @type {Resources}
 */
const ResourceManager = new Resources();

/**
 * Config .env file so all variables are loaded into process.env
 */
DotEnv.configDotenv()

/**
 * Initialise commands module
 */
Commands.init(DorkBot.getClient(), ResourceManager);

/**
 * Initialise events handler module
 */
EventHandler.init({
    Resources: ResourceManager,
    Discord: Discord,
    CommandsParser: Commands
},DorkBot.getClient());

/**
 * Initialise top-level Server Manager
 */
ServerManager.init({
    Resources: ResourceManager,
    commands: Commands,
    events: EventHandler,
},DorkBot)
//////////////////////////////////////////////////////////////////////////////////////
ServerManager.startBot();


