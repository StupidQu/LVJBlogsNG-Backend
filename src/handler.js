import { User } from './model/user.js';

export class Handler {
    user = new User(0, 'Guest');
    response = { body: {} };
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
     * @param {BigInt} priv 
     */
    checkPriv(priv) {
        if (!this.user.hasPriv(priv)) throw new Error(`You do not have the privilege ${priv}.`);
    } 

    /**
     * 
     * @param {string} msg 
     */
    fail(msg) {
        this.response.body = { success: false, msg };
    }
};
