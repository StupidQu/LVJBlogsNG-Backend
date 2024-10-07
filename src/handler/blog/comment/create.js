import { Handler } from '../../../handler.js';
import { BlogModel } from '../../../model/blog.js';
import { PRIV } from '../../../model/user.js';

class CommentCreateHandler extends Handler {
    async post() {
        this.checkPriv(PRIV.ADD_COMMENT);
        /** @type {{title: string, content: string}} */
        const { content } = this.ctx.request.body;
        const { id } = this.ctx.request.params;
        const commentId = await BlogModel.addComment(id, content, this.user.uid);
        this.response.body = { success: true, commentId };
    }
}

export async function apply(ctx) {
    ctx.Route('comment_create', '/blog/:id/comment/create', CommentCreateHandler);
}
