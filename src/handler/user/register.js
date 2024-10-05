import { Handler } from '../../handler.js';
import { DefaultPriv, User, UserModel } from '../../model/user.js';
import validator from 'email-validator';
import { hash } from '../../lib/hash.js';

class UserRegisterHandler extends Handler {
    async post() {
        /**
         * @type {{uname: string, password: string, email: string}}
         */
        const { uname, password, email } = this.ctx.request.body;
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
        this.response.body = { success: true };
    }
}

export async function apply(ctx) {
    ctx.Route('user_register', '/user/register', UserRegisterHandler);
}
