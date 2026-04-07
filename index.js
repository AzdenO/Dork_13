import Discord from "discord.js";
import DotEnv from "dotenv";
import Commands from "./commands/CommandParser.js";
import Resources from "./resources/Resources.js";
import EventHandler from "./events/eventHandler.js";
import Dork from "./bot/Dork13.js"
import ServerManager from "./server/ServerManager.js";
import ServerBus from "./events/emitter/ServerEmitter.js";
import DatabaseManager from "./database/Database.js";
///////////////////////////////////////////////////////////////////////////////////////

/**
 * Config .env file so all variables are loaded into process.env
 */
DotEnv.configDotenv()

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

await DatabaseManager.init();

//////////////////////////////////////////////////////////////////////////////////////
/**
 * Initialise resource manager
 * @type {Resources}
 */
const ResourceManager = new Resources();

/**
 * Initialise new Bot Object, providing the discord client object
 * @type {Dork}
 */
const DorkBot = new Dork(client, ResourceManager.getServerConfig());



/**
 * Initialise commands module
 */
Commands.init(DorkBot.getClient(), ResourceManager, ServerBus);

/**
 * Initialise events handler module
 */
EventHandler.init({
    Resources: ResourceManager,
    Discord: Discord,
    CommandsParser: Commands,
    ServerBus: ServerBus,
},DorkBot.getClient());

/**
 * Initialise top-level Server Manager
 */
ServerManager.init({
    Resources: ResourceManager,
    commands: Commands,
    events: EventHandler,
    ServerBus: ServerBus,
    DBManager: DatabaseManager
},DorkBot)
//////////////////////////////////////////////////////////////////////////////////////
ServerManager.startBot();


