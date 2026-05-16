/**
 * @module Logger
 * @description Project wide logging module, should be instantiated as a singleton and passed to all modules.
 * The intended purpose is to replace console.log() statements with a logger such as this that can save logs to
 * a file, send them as messages or events, and more.
 * @author AzdenO
 * @version 0.3
 */
//import libraries
import DorkTime from "../../utils/time/Time.js"
import {genCode} from "../../utils/random/RandomGenerator.js"

//declare globals
let sessionID = null;
let ServerBus = null;
let ResourceManager = null;

//declare module enums or constants
let Flags = {
    ERROR: "error",
    WARN: "warning",
    DEBUG: "debug",
    INFO: "info",
}
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @function pre_init
 * @description Pre-initialise the module, such as passing in dependencies, etc.
 */
function pre_init(bus,resources){
    ServerBus = bus;
    ResourceManager = resources;
}
///////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @function init
 * @description complete the main block of module initialisation. Only call once the module has successfully
 * completed pre-initialisation
 */
function init(){
    //generate the ID of this run cycle
    sessionID = DorkTime.now("date-time:loose")+"-"+genCode(10);

    //create this sessions log file
    ResourceManager.createFile(sessionID,ResourceManager.getLoggerConfig().logDir);
}
///////////////////////////////////////////////////////////////////////////////////////////////////
function log(service,message,flag){

    if(!Flags.hasOwnProperty(flag)){
        throw new Error()
    }
    //format log message
    const string = `${DorkTime.now("time-only:strict")}[${service}/${Flags[flag]}]: ${message}\n`

    //if the config directs the logger to capture logs with this flag
    if(ResourceManager.getLoggerConfig().flagConf[flag].capture){
        ResourceManager.appendToFile(`${ResourceManager.getLoggerConfig().logDir}\\${sessionID}.txt`,string)
    }

    //if the config directs the logger to emit logs with this flag
    if(ResourceManager.getLoggerConfig().flagConf[flag].emit){
        ServerBus.emit("log-event",string);
    }

}
///////////////////////////////////////////////////////////////////////////////////////////////////
export default{
    pre_init,
    init,
    log
}