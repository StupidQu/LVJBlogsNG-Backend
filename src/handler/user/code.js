import * as config from '../../model/config.js';
import TokenModel from '../../model/token.js';
import { Handler } from '../../handler.js';
import SendMail from '../../lib/mail.js';

class UserRegisterSendCodeHandler extends Handler {
    async post() {
        await this.limit('add_user_send_mail', 600, 10, true);
        const { uname, email } = this.ctx.request.body;
        const verifyCode = Math.random().toString().slice(2, 8);
        await SendMail(email, '注册验证码', config.get('registerMailTemplateId'), { username: uname, verifyCode });
        const tokenId = await TokenModel.add(Date.now() + 5 * 60 * 1000, {
            uname,
            verifyCode,
            ip: this.ctx.request.ip,
        });
        this.response.body = { success: true, tokenId };
    }
}

export async function apply(ctx) {
    ctx.Route('register_send_code', '/user/code', UserRegisterSendCodeHandler);
}
