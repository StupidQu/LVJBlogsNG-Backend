import { Handler } from '../../handler.js';
import { BlogModel } from '../../model/blog.js';
import { PRIV } from '../../model/user.js';

class BlogDeleteHandler extends Handler {
    async post() {
        const blogId = this.ctx.params.id;
        const blog = await BlogModel.get(blogId);
        if (!blog) return this.fail('Blog not found.');
        this.checkPriv(blog.author === this.user.uid ? PRIV.DELETE_SELF_BLOG : PRIV.DELETE_BLOG);
        await BlogModel.delete(blogId);
        this.response.body = { success: true };
    }
}

export async function apply(ctx) {
    ctx.Route('blog_delete', '/blog/delete/:id', BlogDeleteHandler);
}
