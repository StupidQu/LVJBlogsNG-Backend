import * as config from '../model/config.js';
import log4js from 'log4js';

/**
 * Get a logger.
 * @param {string} category 
 * @returns {import('log4js').Logger}
 */
export default function getLogger(category) {
    const logger = log4js.getLogger(category);
    logger.level = config.get('loggerLevel');
    return logger;
}
