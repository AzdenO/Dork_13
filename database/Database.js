/**
 * @module Database
 * @description module where all MongoDB database interaction occurs
 * @author AzdenO
 * @version 0.1
 */
let client = null;
//////////////////////////////////////////////////////////////////////////////////////
import Mongo from"mongodb"

//////////////////////////////////////////////////////////////////////////////////////
async function init(){
    await createConnection();
}
//////////////////////////////////////////////////////////////////////////////////////
/**
 * Create a connection to the remote MongoDB Atlas cluster
 * @returns {Promise<void>}
 */
async function createConnection(){

    console.log("[database]: Connecting to Skill Issues Inc database")
    //instantiate a mongo client object
    client = new Mongo.MongoClient(process.env.MONGOSTRING,{
        serverApi:{
            version: Mongo.ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        },
        maxPoolSize: 20
    });
    try{
        await client.connect();
        console.log("[Database]: Connected to Skill Issues Inc database");

    }catch(error){
        console.log("[Database]: Error in connection initialisation");
        throw new Error("Database connection failure");
    }
}
/////////////////////////////////////////////////////////////////////////////////////
async function getActivitiesDatabase(){
    return client.db("events")
}
/////////////////////////////////////////////////////////////////////////////////////
async function getCollection(collection,origin){
    const db = await client.db(origin);
    return await db.collection(collection);
}
/////////////////////////////////////////////////////////////////////////////////////
async function newDocument(document, collection){
    let result = null;
    try{
        result = await collection.insertOne(document);
        return true;
    }catch(error){
        console.log(error.message);
        return false;
    }
}
/////////////////////////////////////////////////////////////////////////////////////
async function updateDocument(collection,update) {
    let result = await collection.updateOne(update.identifier, update.mod);
    if (result.matchedCount && result.modifiedCount) {
        return "success"
    } else if (result.matchedCount === 0 && result.modifiedCount === 1) {
        return "found, no update"
    } else if (result.matchedCount === 0 && result.modifiedCount === 0) {
        return "fail"
    }
}
/////////////////////////////////////////////////////////////////////////////////////
async function getDocument(collection, identifier){
    return await collection.findOne(identifier);
}
/////////////////////////////////////////////////////////////////////////////////////
async function deleteDocument(collection, identifier){
    let result = await collection.deleteOne(identifier);
}
/////////////////////////////////////////////////////////////////////////////////////
export default{
    init,
    getCollection,
    newDocument,
    updateDocument,
    getDocument,
    deleteDocument
}