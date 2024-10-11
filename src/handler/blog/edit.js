import { Handler } from '../../handler.js';
import { BlogModel } from '../../model/blog.js';
import { PRIV } from '../../model/user.js';

class BlogEditHandler extends Handler {
    async post() {
        /** @type {{title: string, content: string, password?: string}} */
        const { title, content, password } = this.ctx.request.body;
        const { id } = this.ctx.request.params;
        const blog = await BlogModel.get(id);
        if (!blog) {
            this.fail('Blog not found.');
            return;
        }
        this.checkPriv(blog.author === this.user.uid ? PRIV.EDIT_SELF_BLOG : PRIV.EDIT_BLOG);
        if (title.length > 100 || content.length > 500 * 1024) {
            this.fail('Title or content too long.');
            return;
        }
        
        await BlogModel.edit(id, title, content, password);
        
        this.response.body = {
            success: true,
        };
    }
}

export async function apply(ctx) {
    ctx.Route('blog_edit', '/blog/edit/:id', BlogEditHandler);
}
