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
};
