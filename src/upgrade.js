import { upgradeScripts } from './upgrade.scripts.js';
import * as config from './model/config.js';
import getLogger from './lib/logger.js';

const logger = getLogger('upgrade');

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
