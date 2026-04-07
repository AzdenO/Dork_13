/**
 * @module Analytics
 * @description Module responsible for server analytic reporting, data aggregation, etc.
 * @version 0.1
 * @author AzdenO
 */
//////////////////////////////////////////////////////////////////////////////////

//Import declarations


//////////////////////////////////////////////////////////////////////////////////

//Global Declarations
let DBManager = null;
//////////////////////////////////////////////////////////////////////////////////
/**
 * Initialise this module
 * @param db Database Manager module
 * @param analytics The analytics channel object
 * @returns {Promise<void>}
 */
async function init(db,analytics){
    DBManager = db;
    analyticsChannel = analytics;
}
//////////////////////////////////////////////////////////////////////////////////
/**
 * Function called to register a server message, extract necessary analytic data from such, and add
 * that data to the database
 * @returns {Promise<void>}
 */
async function registerMessage(message){
    const data = {
        channel: message.channel.name,
        timestamp: message.createdTimestamp,
        member: message.author.displayName,
    }
}
/////////////////////////////////////////////////////////////////////////////////
/**
 * Function to create on the database a new days analytics document in the server analytics collection
 * @returns {Promise<void>}
 */
async function newDailyReport(){

}
////////////////////////////////////////////////////////////////////////////////
/**
 * Function to create on the database a new weekly analytics document in the server analytics collection
 * @returns {Promise<void>}
 */
async function newWeeklyReport(){

}