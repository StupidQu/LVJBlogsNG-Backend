import { Handler } from '../../handler.js';
import { BlogModel } from '../../model/blog.js';
import { PRIV, UserModel } from '../../model/user.js';

class BlogDetailHandler extends Handler {
    async get() {
        const blogId = this.ctx.params.id;
        const blog = await BlogModel.get(blogId);
        if (!blog) return this.fail('Blog not found.');
        const author = (await UserModel.getById(blog.author)).serialize();
        const canEdit = this.user.uid === blog.author ? this.user.hasPriv(PRIV.EDIT_SELF_BLOG) : this.user.hasPriv(PRIV.EDIT_BLOG);
        const canDelete = this.user.uid === blog.author ? this.user.hasPriv(PRIV.DELETE_SELF_BLOG) : this.user.hasPriv(PRIV.DELETE_BLOG);
        this.response.body = { blog, author, canEdit, canDelete };
    }
}

export async function apply(ctx) {
    ctx.Route('blog_detail', '/blog/detail/:id', BlogDetailHandler);
}
