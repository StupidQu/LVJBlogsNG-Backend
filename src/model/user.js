import { nanoid } from 'nanoid';
import db from '../lib/db.js';
import _ from 'lodash';

/**
 * @readonly
 * @enum {BigInt}
 */
export const PRIV = {
    ADD_BLOG: 1n,
    DELETE_SELF_BLOG: 2n,
    EDIT_SELF_BLOG: 4n,
    EDIT_BLOG: 8n,
    DELETE_BLOG: 16n,

    ADD_COMMENT: 32n,
    DELETE_SELF_COMMENT: 64n,
    EDIT_SELF_COMMENT: 128n,
    EDIT_COMMENT: 256n,
    DELETE_COMMENT: 512n,

    USER_PROFILE: 1024n,
};

export class User {
    /**
     * @param {number} [uid=0]
     * @param {string} [uname=""]
     * @param {string} [password=""]
     * @param {string} [email="default@zshfoj.com"]
     * @param {BigInt} [priv=0]
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
     * @param {BigInt} priv
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
    priv BIGINT
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
        return new User(row.uid, row.uname, row.password, row.email, BigInt(row.priv));
    }

    /**
     * 
     * @param {string} uname 
     * @returns {Promise<User>}
     */
    static async getByName(uname) {
        const row = await db.get('SELECT * FROM user WHERE uname=?', [uname]);
        if (!row) throw new Error(`User ${uname} not found.`);
        return new User(row.uid, row.uname, row.password, row.email, BigInt(row.priv));
    }

    /**
     * 
     * @param {User} user 
     * @returns {Promise<number>}
     */
    static async add(user) {
        const { uid } = await db.run('INSERT INTO user(uname, password, email, priv) VALUES(?, ?, ?, ?)', [user.uname, user.password, user.email, user.priv]);
        return uid;
    }

    /**
     * 
     * @param {User} user 
     * @returns {Promise<User>}
     */
    static async update(user) {
        await db.run('UPDATE user SET uname=?, password=?, email=?, priv=? WHERE uid=?', [user.uname, user.password, user.email, user.priv, user.uid]);
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
};

await (async () => {
    try {
        await UserModel.getById(1);
    } catch {
        await UserModel.add(new User(1, 'Guest', nanoid()));
    };
})();
