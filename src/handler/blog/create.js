import { Handler } from '../../handler.js';
import { BlogModel } from '../../model/blog.js';
import { PRIV } from '../../model/user.js';

class BlogCreateHandler extends Handler {
    async post() {
        this.checkPriv(PRIV.ADD_BLOG);
        /** @type {{title: string, content: string}} */
        const { title, content } = this.ctx.request.body;
        if (title.length > 100 || content.length > 500 * 1024) {
            this.fail('Title or content too long.');
            return;
        }
        const blogId = await BlogModel.add(title, content, this.user.uid);
        this.response.body = {
            success: true,
            blogId,
        };
    }
}

export async function apply(ctx) {
    ctx.Route('blog_create', '/blog/create', BlogCreateHandler);
}
