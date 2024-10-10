import { BlogDetailBaseHandler } from '../detail.js';
import { BlogModel } from '../../../model/blog.js';
import { PRIV } from '../../../model/user.js';

class CommentCreateHandler extends BlogDetailBaseHandler {
    async post() {
        this.checkPriv(PRIV.ADD_COMMENT);
        /** @type {{title: string, content: string}} */
        const { content } = this.ctx.request.body;
        const commentId = await BlogModel.addComment(this.blogId, content, this.user.uid);
        this.response.body = { success: true, commentId };
    }
}

export async function apply(ctx) {
    ctx.Route('comment_create', '/blog/:id/comment/create', CommentCreateHandler);
}
