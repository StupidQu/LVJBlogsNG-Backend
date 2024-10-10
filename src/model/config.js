import { existsSync, readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import PRIV from '../lib/priv.js';

export class Config {
    loggerLevel = 'debug';
    
    defaultPriv = PRIV.ADD_BLOG | PRIV.DELETE_SELF_BLOG | PRIV.EDIT_SELF_BLOG | PRIV.ADD_COMMENT | PRIV.EDIT_SELF_COMMENT | PRIV.DELETE_SELF_COMMENT | PRIV.USER_PROFILE | PRIV.USER_PROFILE;
    
    dbVersion = 0;
    
    serverPort = 3030;
    serverHost = '0.0.0.0';
};

if (!existsSync('./data/config.yaml')) {
    writeFileSync('./data/config.yaml', yaml.dump({}));
}

/**
 * @type {Config}
 */
export const config = { ...new Config(), ...yaml.load(readFileSync('./data/config.yaml', 'utf8')) };

/**
 * Returns the value of the given config name.
 * @template {keyof Config} T
 * @param {T} name
 * @returns {Config[T]}
 */
export const get = (name) => config[name];
export const set = (name, value) => {
    config[name] = value;
    writeFileSync('./data/config.yaml', yaml.dump(config));
};
