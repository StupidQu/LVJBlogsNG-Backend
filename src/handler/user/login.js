import { Handler } from '../../handler.js';
import { PRIV, UserModel } from '../../model/user.js';
import { hash } from '../../lib/hash.js';
import SessionModel from '../../model/session.js';

class UserLoginHandler extends Handler {
    async post() {
        /**
         * @type {{uname: string, password: string, email: string}}
         */
        const { uname, password } = this.ctx.request.body;
        if (this.user.hasPriv(PRIV.USER_PROFILE)) {
            this.fail('You are already logged in.');
            return;
        }
        if (!await UserModel.exists(uname)) {
            this.fail('User does not exist.');
            return;
        }  
        const passwordHashed = hash(password);
        const user = await UserModel.getByName(uname);
        if (user.password !== passwordHashed) {
            this.fail('Incorrect password.');
            return;
        }
        const session = await SessionModel.add(user.uid);
        this.response.body = {
            success: true,
            sessionId: session.sessionId,
        };
    }
}

export async function apply(ctx) {
    ctx.Route('user_login', '/user/login', UserLoginHandler);
}
