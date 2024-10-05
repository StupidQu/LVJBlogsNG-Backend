import crypto from 'crypto';

/**
 * Hash a string in sha256 with a fixed salt.
 * @param {string} str 
 * @returns {string}
 */
export function hash(str) {
    return crypto.createHash('sha256').update(`${str}_A_FIXED_SALT_MAY_BE_UNSAFE_BUT_IM_LAZY`).digest('hex');
}