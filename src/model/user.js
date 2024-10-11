import { nanoid } from 'nanoid';
import db from '../lib/db.js';
import _ from 'lodash';
import * as config from './config.js';
import __P from '../lib/priv.js';

/** @type {typeof __P} */
export const PRIV = __P; // why??
export const DefaultPriv = config.get('defaultPriv');

export class User {
    /**
     * @param {number} [uid=0]
     * @param {string} [uname=""]
     * @param {string} [password=""]
     * @param {string} [email="default@zshfoj.com"]
     * @param {number} [priv=0]
     * @param {string} [avatar=""]
     * @param {string} [description=""]
     */
    constructor(uid = 0, uname = '', password = '', email = 'default@zshfoj.com', priv = 0, avatar = '', description = '') {
        this.uid = uid;
        this.uname = uname;
        this.password = password;
        this.email = email;
        this.priv = priv;
        this.avatar = avatar;
        this.description = description;
        this.unameLower = uname.toLocaleLowerCase();
    }

    serialize() {
        return _.pick(this, ['uid', 'uname', 'email', 'priv', 'avatar', 'description']);
    }

    /**
     * 
     * @param {number} priv
     * @returns 
     */
    hasPriv(priv) {
        return (this.priv & priv) !== 0;
    }
};

await db.run(`CREATE TABLE IF NOT EXISTS user(
    uid INTEGER PRIMARY KEY AUTOINCREMENT,
    uname TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT NOT NULL,
    priv INTEGER,
    avatar TEXT,
    description TEXT,
    unameLower TEXT
)`);
await db.run('CREATE UNIQUE INDEX IF NOT EXISTS user_uname ON user(uname)');

export class UserModel {
    /**
     * 
     * @param {number} uid 
     * @returns {Promise<User>}
     */
    static async getById(uid) {
        const row = await db.get('SELECT * FROM user WHERE uid=?', [uid]);
        if (!row) throw new Error(`User ${uid} not found.`);
        return new User(row.uid, row.uname, row.password, row.email, row.priv, row.avatar, row.description);
    }

    /**
     * 
     * @param {string} uname 
     * @returns {Promise<User>}
     */
    static async getByName(uname) {
        const row = await db.get('SELECT * FROM user WHERE unameLower=?', [uname.toLowerCase()]);
        if (!row) throw new Error(`User ${uname} not found.`);
        return new User(row.uid, row.uname, row.password, row.email, row.priv, row.avatar, row.description);
    }

    /**
     * 
     * @param {User} user 
     * @returns {Promise<number>}
     */
    static async add(user) {
        const { lastID } = await db.run('INSERT INTO user(uname, password, email, priv, avatar, description, unameLower) VALUES(?, ?, ?, ?, ?, ?, ?)', [user.uname, user.password, user.email, user.priv, user.avatar, user.description, user.uname.toLowerCase()]);
        return lastID;
    }

    /**
     * 
     * @param {User} user 
     * @returns {Promise<User>}
     */
    static async update(user) {
        await db.run('UPDATE user SET uname=?, password=?, email=?, priv=?, avatar=?, description=?, unameLower=? WHERE uid=?', [user.uname, user.password, user.email, user.priv, user.avatar, user.description, user.uname.toLocaleLowerCase(), user.uid]);
        return await UserModel.getById(user.uid);
    }

    /**
     * Determine if a username exists.
     * @param {string} uname 
     * @returns Promise<boolean>
     */
    static async exists(uname) {
        const row = await db.get('SELECT * FROM user WHERE unameLower=?', [uname.toLowerCase()]);
        return !!row;
    }

    /**
     * Get a list of users for render.
     * @param {number[]} users 
     */
    static async getList(users) {
        return await db.all(`SELECT uid, uname, description, avatar FROM user WHERE uid IN (${users.join(',')})`);
    }
};

await (async () => {
    try {
        await UserModel.getById(1);
    } catch {
        await UserModel.add(new User(1, 'Guest', nanoid()));
    };
})();
