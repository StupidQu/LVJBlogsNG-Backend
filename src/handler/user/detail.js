import { BlogModel } from '../../model/blog.js';
import { UserModel } from '../../model/user.js';
import { Handler } from '../../handler.js';
import PRIV from '../../lib/priv.js';

class UserDetailHandler extends Handler {
    async get() {
        const { id } = this.ctx.params;
        const user = await UserModel.getById(id);
        if (!user) return this.fail('User does not exists.');
        const blogs = await BlogModel.getByAuthor(id);
        blogs.forEach(blog => {
            blog.content = blog.content.slice(0, 100);
            if (blog.password && blog.password !== '') blog.content = 'Password protected.';
        });
        await Promise.all(blogs.map(blog => (async () => {
            blog.commentsCount = await BlogModel.getCommentsCount(blog.blogId);
        })()));
        this.response.body = { user, blogs, canEdit: this.user.hasPriv(PRIV.EDIT_USER) || (user.uid === this.user.uid && this.user.hasPriv(PRIV.USER_PROFILE)) };
    }
}

export async function apply(ctx) {
    ctx.Route('user_detail', '/user/detail/:id', UserDetailHandler);
}
