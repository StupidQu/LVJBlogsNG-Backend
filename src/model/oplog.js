import db from '../lib/db.js';

await db.run(`CREATE TABLE IF NOT EXISTS oplog(
    opId INTEGER PRIMARY KEY AUTOINCREMENT,
    operation VARCHAR(255) NOT NULL,
    user INTEGER NOT NULL,
    ip VARCHAR(32) NOT NULL,
    time INTEGER NOT NULL,
    extraInfo TEXT
)`);

export default class OpLogModel {
    /**
     * Add an opeartion log.
     * @param {string} operation 
     * @param {number} user 
     * @param {string} ip 
     * @param {string?} extraInfo
     */
    static async add(operation, user, ip, extraInfo = '') {
        await db.run('INSERT INTO oplog(operation, user, ip, time, extraInfo) VALUES(?, ?, ?, ?, ?)', [operation, user, ip, Date.now(), extraInfo]);
    }

    /**
     * @param {string} operation 
     * @param {number} user 
     * @param {number?} fromTime 
     * @returns The count of the operation performed from time.
     */
    static async countByUser(operation, user, fromTime = 0) {
        return (await db.get('SELECT COUNT(*) AS count FROM oplog WHERE operation = ? AND user = ? AND time > ?', [operation, user, fromTime])).count;
    }

    /**
     * 
     * @param {string} operation 
     * @param {string} ip 
     * @param {number} fromTime 
     * @returns The count of the operation performed from time.
     */
    static async countByIp(operation, ip, fromTime = 0) {
        return (await db.get('SELECT COUNT(*) AS count FROM oplog WHERE operation = ? AND ip = ? AND time > ?', [operation, ip, fromTime])).count;
    }
}
