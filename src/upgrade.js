import * as config from './model/config.js';
import getLogger from './lib/logger.js';
import db from './lib/db.js';
import { readdirSync } from 'fs';

// TO ENSURE ALL THE MODELS HAVE BEEN LOADED
for (const model of readdirSync('./model/')) {
    await import(`./model/${model}`);
}

const logger = getLogger('upgrade');

/**
 * @type { Function[] }
 */
const upgradeScripts = [
    () => {
        // This adds a "password" key for each blog in the database, default it is null
        db.run('ALTER TABLE blog ADD COLUMN password TEXT NULL;');
    }
];

export const runScripts = async () => {
    const nowDbVersion = config.get('dbVersion');
    for (let ver = nowDbVersion; ver < upgradeScripts.length; ++ver) {
        logger.info(`Upgrading database from version ${ver} to ${ver + 1}`);
        try {
            await upgradeScripts[ver]();
        } catch (e) {
            logger.error(`Failed to upgrade database from version ${ver} to ${ver + 1}`, e);
        }
    }
    config.set('dbVersion', upgradeScripts.length);
};

export default runScripts;
