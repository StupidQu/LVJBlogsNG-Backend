import { Handler } from '../../handler.js';
import { DefaultPriv, PRIV, User, UserModel } from '../../model/user.js';
import validator from 'email-validator';
import { hash } from '../../lib/hash.js';
import TokenModel from '../../model/token.js';

class UserRegisterHandler extends Handler {
    async post() {
        /**
         * @type {{uname: string, password: string, email: string, code: string, tokenId: string }}
         */
        const { uname, password, email, code, tokenId } = this.ctx.request.body;
        if (!uname || !password || !email || !code || !tokenId) return this.fail('Invalid parameters.');
        await this.limit('add_user', 600, 10, true);
        const token = await TokenModel.get(tokenId);
        if (!token) return this.fail('Invalid token.');
        if (token.extraInfo.verifyCode !== code || token.extraInfo.ip !== this.ctx.request.ip) return this.fail('Invalid code or ip.');
        if (this.user.hasPriv(PRIV.USER_PROFILE)) {
            this.fail('You are already logged in.');
            return;
        }
        if (uname.length < 3 || uname.length > 20) {
            this.fail('Username must be between 3 and 20 characters.');
            return;
        }
        if (!/^[a-zA-Z0-9]+$/.test(uname)) {
            this.fail('Username must only contain letters and numbers.');
            return;
        }
        if (await UserModel.exists(uname)) {
            this.fail('Username already exists.');
            return;
        }
        if (!validator.validate(email) || email.length > 50) {
            this.fail('Invalid email.');
            return;
        }
        const passwordHashed = hash(password);
        await UserModel.add(new User(0, uname, passwordHashed, email, DefaultPriv));
        await TokenModel.delete(tokenId);
        this.response.body = { success: true };
    }
}

export async function apply(ctx) {
    ctx.Route('user_register', '/user/register', UserRegisterHandler);
}
