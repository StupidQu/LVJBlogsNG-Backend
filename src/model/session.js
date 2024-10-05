import { nanoid } from 'nanoid';
import db from '../lib/db.js';

export class Session {
    /**
     * 
     * @param {number} uid 
     * @param {string} sessionId 
     * @param {number} expireAt
     */
    constructor(uid, sessionId, expireAt) {
        this.uid = uid;
        this.sessionId = sessionId;
        this.expireAt = expireAt;
        sessionCache.set(sessionId, this);
    }
};

db.run(`CREATE TABLE IF NOT EXISTS session(
    sessionId TEXT PRIMARY KEY,
    expireAt INTEGER,
    uid INTEGER
)`);

const TIME_3_HOURS = 3 * 60 * 60 * 1000;

/**
 * @type {Map<string, Session>}
 */
const sessionCache = new Map();

export default class SessionModel {
    static async add(uid) {
        const sessionId = nanoid();
        await db.run('INSERT INTO session(sessionId, uid, expireAt) VALUES(?, ?, ?)', [sessionId, uid, Date.now() + TIME_3_HOURS]);
        return new Session(uid, sessionId, Date.now() + TIME_3_HOURS);
    }

    static async get(sessionId) {
        const session = sessionCache.get(sessionId);
        if (session) {
            if (session.expireAt < Date.now()) {
                await this.delete(sessionId);
                return null;
            }
            db.run('UPDATE session SET expireAt = ? WHERE sessionId = ?', [Date.now() + TIME_3_HOURS, sessionId]); // can be done in async
            return session;
        }

        const row = await db.get('SELECT * FROM session WHERE sessionId = ?', [sessionId]);
        if (!row) return null;
        if (row.expireAt < Date.now()) {
            await this.delete(sessionId);
            return null;
        }

        return new Session(row.uid, row.sessionId, Date.now() + TIME_3_HOURS);
    }

    static async clearExpired() {
        await db.run('DELETE FROM session WHERE expireAt < ?', [Date.now()]);
    }

    static async delete(sessionId) {
        if (!this.get(sessionId)) return;
        await db.run('DELETE FROM session WHERE sessionId = ?', [sessionId]);
        sessionCache.delete(sessionId);
    }
};
