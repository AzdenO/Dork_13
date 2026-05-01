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
     * @param config
     */
    constructor(client, config){
        this.bot = client;
        this.config = config;
    }
    ///////////////////////////////////////////////////////////////////////////////////
    /**
     * Method to initialise connection to the server
     */
    async connect(){
        try{
            await this.bot.login(process.env.TOKEN);
            await this.awaitReady();
            console.log("[Dork-13]: Successfully connected to the server");
            this.setAutoWarns();
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
    async getChannel(channelID){
        return await this.bot.channels.fetch(channelID);
    }
    ///////////////////////////////////////////////////////////////////////////////////
    /**
     * GET function to retrieve server info/object
     */
    async getServerManifest(serverID){
        return await this.bot.guilds.fetch(serverID);
    }
    //////////////////////////////////////////////////////////////////////////////////
    async getMember(memberID){
        return await (await this.bot.guilds.cache.get(this.config.server.serverID)).members.fetch(memberID);
    }
    //////////////////////////////////////////////////////////////////////////////////
    /**
     * Function used primarily at start of program initialisation, to wait for the bots ready signal before
     * proceeding with any bot operations
     * @returns {Promise<unknown>}
     */
    async awaitReady(){
        return new Promise((resolve)=>{
            if(this.bot.isReady()){
                resolve();
            }else{
                this.bot.once("clientReady",()=>resolve());
            }
        })
    }
    //////////////////////////////////////////////////////////////////////////////////
    setAutoWarns(){
        this.bot.on("error",(err)=>{
            console.log("[Dork-13]: Error detected: "+err)
            console.log("[Dork-13]: Status "+this.bot.ws.status);
        });
        this.bot.on("warn",(err)=>{
            console.log("[Dork-13]: Warning detected: "+err);
            console.log("[Dork-13]: Status "+this.bot.ws.status);
        });
        this.bot.on("debug",(err)=>{
            console.log("[Dork-13]: Debug detected: "+err);
        })
    }
}