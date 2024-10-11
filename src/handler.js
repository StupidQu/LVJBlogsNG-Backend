import OpLogModel from './model/oplog.js';
import { User } from './model/user.js';

export class Handler {
    user = new User(1, 'Guest');
    response = { body: {}, skipNext: false };
    /** @type {koa.Context} */
    ctx;

    /**
     * 
     * @param {koa.Context} ctx 
     */
    constructor(ctx) {
        this.ctx = ctx;
        this.user = this.ctx.state.user;
    }

    /**
     * If the user does not have the priv, it throws an error.
     * @param {number} priv 
     */
    checkPriv(priv) {
        if (!this.user.hasPriv(priv)) throw new Error(`You do not have the privilege ${priv}.`);
    } 

    /**
     * 
     * @param {string} msg
     * @param {number?} failStatusCode 
     */
    fail(msg, failStatusCode = 0) {
        this.response.body = { success: false, msg, failStatusCode };
        this.response.skipNext = true;
    }

    async __init() {
        await this.limit('access', 5, 10);
    }

    async __after() {
        const doSerialize = async (object) => {
            for (const key in object) {
                if (!object[key]) continue;
                if (typeof object[key] === 'object') await doSerialize(object[key]);
                if (typeof object[key]['serialize'] === 'function') object[key] = await object[key].serialize();
            }
        };
        await doSerialize(this.response.body);
    }

    /**
     * Limit the rate of a user.
     * @param {string} operation 
     * @param {number} duration In second.
     * @param {number} limit Max operations per duration.
     * @param {boolean} onlyByIp
     */
    async limit(operation, duration, limit, onlyByIp = false) {
        duration *= 1000;
        const [CountIp, CountUser] = await Promise.all([
            OpLogModel.countByIp(operation, this.ctx.request.ip, Date.now() - duration),
            OpLogModel.countByUser(operation, this.user.uid, Date.now() - duration)
        ]);
        if (CountIp >= limit || (!onlyByIp && CountUser >= limit)) throw new Error('Rate limit exceeded.');
        await OpLogModel.add(operation, this.user.uid, this.ctx.request.ip);
    }
};
