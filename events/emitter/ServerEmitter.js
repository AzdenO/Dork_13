/**
 * @module ServerEmitter
 * @description The servers own event emitter, using nodes events class
 * @author AzdenO
 * @version 0.1
 */
/////////////////////////////////////////////////////////////////////////////////////////
import EventEmitter from "events"

const serverBus = new EventEmitter();

export default serverBus;