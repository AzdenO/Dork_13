import Discord from "discord.js";

/**
 * @class Dork
 * @description Container/wrapper class for the Discord.js client (which is a bot in the server)
 * @author AzdenO
 * @version 0.1
 */
export default class Dork{

    ///////////////////////////////////////////////////////////////////////////////////
    /**
     * @constructor Constructor function for Dork
     * @param client The discord Client object associated with our bot
     */
    constructor(client){
        this.bot = client;
    }
    ///////////////////////////////////////////////////////////////////////////////////
    /**
     * Method to initialise connection to the server
     */
    async connect(){
        this.bot.once(Discord.Events.ClientReady, (LoggedIn)=>{
            console.log("[Dork-13] Successfully connected to Skill Issues Inc. ");
        });
        try{
            await this.bot.login(process.env.TOKEN);
            return true;
        }catch(e){
            console.log("[Dork-13]: Failed to connect to server:\n\t"+e.message);
            return false;
        }

    }
    ///////////////////////////////////////////////////////////////////////////////////
    /**
     * GET function for discord client attribute
     * @returns {*} The discord client instance
     */
    getClient(){
        return this.bot;
    }
    ///////////////////////////////////////////////////////////////////////////////////
}