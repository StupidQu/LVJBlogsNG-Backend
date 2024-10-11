import koa from 'koa';
import fs from 'fs';
import { User, UserModel } from './model/user.js';
import SessionModel from './model/session.js';
import Router from '@koa/router';
import koaBodyparser from 'koa-bodyparser';
import koaCors from '@koa/cors';
import * as config from './model/config.js';
import upgrade from './upgrade.js';
import getLogger from './lib/logger.js';

const app = new koa();
const router = new Router();

const logger = getLogger();
await upgrade();

export async function registerHandler(name, path, handlerClass) {
    router.all(name, path, async (ctx, next) => {
        const handler = new handlerClass(ctx);
        const method = ctx.method.toLowerCase();
        if (typeof handler[method] !== 'function' || !['get', 'post'].includes(method)) {
            ctx.throw(405);
            return;
        }
        const steps = ['__init', '_init', 'init', method, 'after', '_after', '__after'];
        logger.debug(`${ctx.state.user.uname}(${ctx.state.sessionId}) ${ctx.method}: ${path}.`);
        try {
            for (const step of steps) {
                if (typeof handler[step] === 'function') await handler[step]();
                if (handler.response.skipNext) break;
            }
            ctx.body = handler.response.body;
            ctx.response.status = 200;
            ctx.set({ 'Content-Type': 'application/json' });
        } catch (e) {
            ctx.response.status = 403;
            ctx.body = { success: false, msg: e.message };
            ctx.set({ 'Content-Type': 'application/json' });
            console.error(e.stack);
        }
        await next();
    });
};

app.use(koaCors());
app.use(koaBodyparser());
app.use(async (ctx, next) => {
    const sessionId = ctx.request.headers['x-session-id'] || '';
    let session = await SessionModel.get(sessionId);
    if (!session) {
        session = await SessionModel.getOneByUser(1);
        if (!session) session = await SessionModel.add(1);
    }
    ctx.state.sessionId = session.sessionId;
    ctx.state.user = session ? await UserModel.getById(session.uid) : new User(1, 'Guest');
    await next();
});
app
    .use(router.routes())
    .use(router.allowedMethods());


/**
 * 
 * @param {string} dir 
 */
async function processHandlerForDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const path = `${dir}/${file}`;
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
            await processHandlerForDir(path);
        } else if (file.endsWith('.js')) {
            try {
                (await import(path)).apply({
                    Route: registerHandler,
                });
            } catch (e) {
                console.error(`Failed to import ${path}: ${e}`);
            }
        }
    }
};
processHandlerForDir('./handler');

await SessionModel.clearExpired();

app.listen(config.get('serverPort'), config.get('serverHost'));
