import Discord from "discord.js";
import DotEnv from "dotenv";
import Commands from "./commands/CommandParser.js";
import Resources from "./resources/Resources.js";
import EventHandler from "./events/eventHandler.js";
import Dork from "./bot/Dork13.js";
import ServerManager from "./server/ServerManager.js";
import ServerBus from "./events/emitter/ServerEmitter.js";
import DatabaseManager from "./database/Database.js";
import {execSync} from "child_process";
import LoggingMachine from "./server/logging/Logger.js";
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
LoggingMachine.pre_init(ServerBus,ResourceManager);
LoggingMachine.init();
/**
 * Initialise new Bot Object, providing the discord client object
 * @type {Dork}
 */
const DorkBot = new Dork(client, ResourceManager.getServerConfig(),LoggingMachine.log);



/**
 * Initialise commands module
 */
Commands.init(DorkBot.getClient(), ResourceManager, ServerBus,LoggingMachine.log);

/**
 * Initialise events handler module
 */
EventHandler.init({
    Resources: ResourceManager,
    Discord: Discord,
    CommandsParser: Commands,
    ServerBus: ServerBus,
    Logger: LoggingMachine.log
},DorkBot.getClient());

/**
 * Initialise top-level Server Manager
 */
ServerManager.init({
    Resources: ResourceManager,
    commands: Commands,
    events: EventHandler,
    ServerBus: ServerBus,
    DBManager: DatabaseManager,
    Logger: LoggingMachine.log
},DorkBot)
//////////////////////////////////////////////////////////////////////////////////////
ServerManager.startBot();

process.on("uncaughtException", (err) => {
    LoggingMachine.log("Main","Uncaught exception: "+err.stack,"ERROR")
    execSync(`powershell -c (New-Object Media.SoundPlayer "O:/Storage/Dev/Level_4/dork_13/assets/audio/shutDown.wav").playSync();`)


})

