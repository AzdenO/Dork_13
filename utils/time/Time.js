/**
 * @module Time
 * @description abstraction layer over node time libraries used by certain bot services
 * @author AzdenO
 * @version 0.1
 */
//import libraries
import dayJs from 'dayjs';

//import error definitions
import TimeError from "../../errors/FormatError.js"

//declare globals
let acceptableFormats = [
    "time-only:strict",
    "time-only:loose",
    "date-time:loose",
    "unixseconds",
]

//////////////////////////////////////////////////////////////////////////////////////////
/**
 * @function now
 * @description get the current time, in a provided format
 * @param format {String} A string constant indicating the format of time to return
 */
function now(format){
    let dayjsFormat = null;
    if(!acceptableFormats.includes(format)){
        throw new TimeError("Invalid format provided:\n"+format);
    }
    //convert provided format into an acceptable dayjs format
    switch(format){
        case "time-only:strict":
            dayjsFormat = "HH:mm:ss";
            break;
        case "time-only:loose":
            dayjsFormat = "HH:mm";
            break;
        case "date-time:loose":
            dayjsFormat = "YYYY-MM-DD HH-mm";
    }
    return dayJs().format(dayjsFormat);
}
//////////////////////////////////////////////////////////////////////////////////////////
/**
 * @function midnight
 * @description returns the number of milliseconds until midnight
 */
function midnight(){

    const now = new Date();

    const midnight = new Date();

    midnight.setHours(24,0,0,0);

    return midnight - now;

}
/////////////////////////////////////////////////////////////////////////////////////////
/**
 * @function getDayMillis
 * @description Get the number of milliseconds in a day
 * @returns {Number} Number of milliseconds in a day
 */
function getDayMillis(){
    return 24 * 60 * 60 * 1000
}
export default{
    now,
    midnight,
    getDayMillis
}