import fs from "node:fs"
/**
 * @class Resources
 * @description Singleton object passed to necessary components that on instantiation, loads all necessary resources
 * and provides them where necessary
 * @author AzdenO
 * @version 0.1
 */
/////////////////////////////////////////////////////////////////////////////////////////

export default class Resources {

    /////////////////////////////////////////////////////////////////////////////////////
    /**
     * @constructor
     * @description Loads all resources and stores them as object attributes
     */
    constructor(){
        this.config = this.loadResourceConfig();
        for(let resource of this.config.resources){
            this[(resource.split(".")[0])] = this.loadResources(resource);
        }
        for(let config of this.config.configs){
            this[(config.split(".")[0])] = this.loadConfigs(config);
        }
     }
    /////////////////////////////////////////////////////////////////////////////////////
    loadResourceConfig(){
        return JSON.parse(fs.readFileSync("./config/resourceConfig.json","utf-8"));
    }
    ////////////////////////////////////////////////////////////////////////////////////
    loadResources(filename){
        return JSON.parse(fs.readFileSync(this.config.resourceDir+filename,"utf-8"))
    }
    ////////////////////////////////////////////////////////////////////////////////////
    loadConfigs(filename){
        return JSON.parse(fs.readFileSync(this.config.configDir+filename,"utf-8"))
    }
    ////////////////////////////////////////////////////////////////////////////////////
    getWelcomes(){
        return this.welcomes;
    }
    ////////////////////////////////////////////////////////////////////////////////////
    getBotConfig(){
        return this.botConfig;
    }
    ////////////////////////////////////////////////////////////////////////////////////
    getAdvisoryChannels(){
        return {
            menu: this.serverConfig.server.channels.menu,
            supe: this.serverConfig.server.channels.channels,
            register: this.serverConfig.server.channels.register,
            welcome: this.serverConfig.server.channels.welcome,
        }
    }
    ////////////////////////////////////////////////////////////////////////////////////
    getServerConfig(){
        return this.serverConfig;
    }
    ///////////////////////////////////////////////////////////////////////////////////
    getEventsConfig(){
        return this.eventsConfig;
    }
    ///////////////////////////////////////////////////////////////////////////////////
    getEmbeds(){
        return this.embeds;
    }

}