/**
 * @module ServerManager
 * @description Main component for handling Server Management
 * @author AzdenO
 * @version 0.1
 */
let components = null;
let ServerBot = null;
/////////////////////////////////////////////////////////////////////////
/**
 * Initialisation function for server module
 * @param dependencies Object of dependencies required by the manager
 * @param bot Discord client object for interacting on the server
 */
function init(dependencies, bot){
    components = dependencies;
    ServerBot = bot;
    console.log("[Server Management]: Successfully initialised");
}
/////////////////////////////////////////////////////////////////////////
async function startBot(){
    console.log("[Server Management]: Connecting DorkBot to server");
    if(!ServerBot.connect()){
        console.log("[Server Management]: ServerBot failed to connect");
    }
}
/////////////////////////////////////////////////////////////////////////
async function terminateBot(){

}
/////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////
export default{
    init,
    terminateBot,
    startBot,
}