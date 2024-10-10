import { Handler } from '../../../handler.js';
import { BlogModel } from '../../../model/blog.js';
import { PRIV } from '../../../model/user.js';

class CommentDeleteHandler extends Handler {
    async post() {
        const { bid, id } = this.ctx.params;
        const blog = await BlogModel.get(bid);
        if (!blog) return this.fail('Blog not found.');
        const comment = await BlogModel.getComment(id);
        if (!comment) return this.fail('Comment not found.');

        this.checkPriv(comment.author === this.user.uid ? PRIV.DELETE_SELF_COMMENT : PRIV.DELETE_COMMENT);
        await BlogModel.deleteComment(id);
       
        this.response.body = { success: true };
    }
}

export async function apply(ctx) {
    ctx.Route('comment_delete', '/blog/:bid/comment/delete/:id', CommentDeleteHandler);
}
