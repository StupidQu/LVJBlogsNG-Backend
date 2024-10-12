import { UserModel } from '../../model/user.js';
import { Handler } from '../../handler.js';
import PRIV from '../../lib/priv.js';

class UserUpdateHandler extends Handler {
    async post() {
        const { id } = this.ctx.params;
        this.checkPriv(PRIV.USER_PROFILE);
        if (!id) return this.fail('User not exists.');
        const user = await UserModel.getById(id);
        if (this.user.uid.toString() !== id) this.checkPriv(PRIV.EDIT_USER);
        const { description, avatar } = this.ctx.request.body;
        await UserModel.update({
            ...user,
            description,
            avatar,
        });
        this.response.body = { success: true };
    }
}

export async function apply(ctx) {
    ctx.Route('user_update', '/user/update/:id', UserUpdateHandler);
}
