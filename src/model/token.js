import { nanoid } from 'nanoid';
import db from '../lib/db.js';

await db.run(`CREATE TABLE IF NOT EXISTS token(
    tokenId INTEGER PRIMARY KEY AUTOINCREMENT,
    token VARCHAR(64),
    expireAt INTEGER,
    extraInfo TEXT
)`);

export default class TokenModel {
    static async add(expireAt, extraInfo = {}) {
        const token = nanoid();
        return (await db.run('INSERT INTO token(token, expireAt, extraInfo) VALUES(?, ?, ?)', [token, expireAt, JSON.stringify(extraInfo)])).lastID;
    }

    static async delete(tokenId) {
        await db.run('DELETE FROM token WHERE tokenId = ?', [tokenId]);
    }

    static async deleteByToken(token) {
        await db.run('DELETE FROM token WHERE token = ?', [token]);
    }

    static async get(tokenId) {
        const tokenDoc = await db.get('SELECT * FROM token WHERE tokenId = ?', [tokenId]);
        if (!tokenDoc || tokenDoc.expireAt < Date.now()) return null;
        tokenDoc.extraInfo = JSON.parse(tokenDoc.extraInfo);
        return tokenDoc;
    }

    static async getByToken(token) {
        const tokenDoc = await db.get('SELECT * FROM token WHERE token = ?', [token]);
        if (!tokenDoc || tokenDoc.expireAt < Date.now()) return null;
        tokenDoc.extraInfo = JSON.parse(tokenDoc.extraInfo);
        return tokenDoc;
    }
};
