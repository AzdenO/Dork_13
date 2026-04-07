/**
 * @module FormValidation
 * @description Module to validate data submitted via discord modals. Exports several objects, each associated
 * with a different form
 * @author AzdenO
 * @version 0.1
 *
 */
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat.js'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

import ActivityValidationError from "../../errors/ActivityValidationError.js";

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
/**
 * Object containing methods for validating data submitted for event card creation and edits
 * @type {{}}
 */
export const CardValidation = {



    timezones: {
        GMT: "Europe/London",
        BST: "Europe/London",
        EST: "America/New_York",
        EDT: "America/New_York",
        CST: "America/Chicago",
        CDT: "America/Chicago",
        PST: "America/Los_Angeles"
    },
    dateregex: /^\d{2}\/\d{2}$/,
    timeregex: /^([01]\d|2[0-3]):([0-5]\d)$/,
    //////////////////////////////////////////////////////////////////////////////////////
    newCard(data,activityType){

        if(!this.validateTime(data.time)){
            throw new ActivityValidationError("date and/or time input is incorrect:\n\t- DD/MM HH:mm GMT/BST/CST etc.","ACVAL");
        }

        if(activityType === "create-raid"|| activityType === "create-dungeon"){
            if(!this.validateSherpa(data.sherpa)){
                throw new ActivityValidationError("sherpa option must be either yes/no. No capitals","ACVAL");
            }
            if(data.sherpa==="yes"){
                if(!this.validateMaxPlayers(data.sherpanum)){
                    throw new ActivityValidationError("Number of sherpas must be a number, and less than the activity maximum","ACVAL")
                }
            }

        }else{
            if(!this.validateMaxPlayers(data.players)){
                throw new ActivityValidationError("Maximum players must not exceeded activity maximum","ACVAL");
            }
        }
    },
    //////////////////////////////////////////////////////////////////////////////////////
    validateTime(time){

        const timeparts = time.split(" ");

        //Validate DD/MM
        if(!this.dateregex.test(timeparts[0])){
            return false;
        }
        const datesplit = timeparts[0].split("/");
        const day = Number(datesplit[0]);
        const month = Number(datesplit[1]);
         try{
            const date = dayjs.tz(timeparts[0]+" "+timeparts[1],"MM/DD HH/mm", this.timezones[timeparts[2]]);
         }catch(err){
            console.log("[Form Validation/Time Validation]: Dayjs failed to evaluate input ",err.message);
            return false;
         }

        //Validate HH:MM
        if(!this.timeregex.test(timeparts[1])){
            return false;
        }

        //Validate timezone
        if(!this.timezones.hasOwnProperty(timeparts[2])){
            return false;
        }
        return true;
    },
    /////////////////////////////////////////////////////////////////////////////////
    validateSherpa(sherpa){

      if(sherpa==="yes"){
          return true;
      }else if(sherpa==="no"){
          return true;
      }
      return false;
    },
    ////////////////////////////////////////////////////////////////////////////////
    validateMaxPlayers(players, max="NA"){
        try{
            let num = Number(players);
            if(isNaN(num)){
                return false;
            }
            if(num>max || num<1){
                return false;
            }else{
                return true;
            }
        }catch(err){
            return false;
        }
    }
}