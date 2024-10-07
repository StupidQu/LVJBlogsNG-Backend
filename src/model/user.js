import { nanoid } from 'nanoid';
import db from '../lib/db.js';
import _ from 'lodash';

/**
 * @readonly
 * @enum {number}
 */
export const PRIV = {
    ADD_BLOG: 1 << 0,
    DELETE_SELF_BLOG: 1 << 1,
    EDIT_SELF_BLOG: 1 << 2,
    EDIT_BLOG: 1 << 3,
    DELETE_BLOG: 1 << 4,

    ADD_COMMENT: 1 << 5,
    DELETE_SELF_COMMENT: 1 << 6,
    EDIT_SELF_COMMENT: 1 << 7,
    EDIT_COMMENT: 1 << 8,
    DELETE_COMMENT: 1 << 9,

    USER_PROFILE: 1 << 10,
};
export const DefaultPriv = PRIV.ADD_BLOG | PRIV.DELETE_SELF_BLOG | PRIV.EDIT_SELF_BLOG | PRIV.ADD_COMMENT | PRIV.EDIT_SELF_COMMENT | PRIV.USER_PROFILE | PRIV.USER_PROFILE;

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
    description TEXT
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
        return new User(row.uid, row.uname, row.password, row.email, row.priv);
    }

    /**
     * 
     * @param {string} uname 
     * @returns {Promise<User>}
     */
    static async getByName(uname) {
        const row = await db.get('SELECT * FROM user WHERE uname=?', [uname]);
        if (!row) throw new Error(`User ${uname} not found.`);
        return new User(row.uid, row.uname, row.password, row.email, row.priv);
    }

    /**
     * 
     * @param {User} user 
     * @returns {Promise<number>}
     */
    static async add(user) {
        const { lastID } = await db.run('INSERT INTO user(uname, password, email, priv, avatar, description) VALUES(?, ?, ?, ?, ?, ?)', [user.uname, user.password, user.email, user.priv, user.avatar, user.description]);
        return lastID;
    }

    /**
     * 
     * @param {User} user 
     * @returns {Promise<User>}
     */
    static async update(user) {
        await db.run('UPDATE user SET uname=?, password=?, email=?, priv=?, avatar=?, description=? WHERE uid=?', [user.uname, user.password, user.email, user.priv, user.uid, user.avatar, user.description]);
        return await UserModel.getById(user.uid);
    }

    /**
     * Determine if a username exists.
     * @param {string} uname 
     * @returns Promise<boolean>
     */
    static async exists(uname) {
        const row = await db.get('SELECT * FROM user WHERE uname=?', [uname]);
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
