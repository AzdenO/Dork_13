import crypto from "crypto";
/**
 * Generate a random string of alphanumeric characters
 * @param length
 * @returns {string}
 */
export function genCode(length=4){
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes = crypto.randomBytes(length);

    return Array.from(bytes, byte => chars[byte % chars.length]).join('');
}

export function genNumber(min,max){
    return Math.floor(Math.random() * (max - min+1));
}