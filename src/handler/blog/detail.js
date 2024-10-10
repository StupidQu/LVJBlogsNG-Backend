import _ from 'lodash';
import { Handler } from '../../handler.js';
import { BlogModel } from '../../model/blog.js';
import { PRIV, UserModel } from '../../model/user.js';

export class BlogDetailBaseHandler extends Handler {
    blogIdParam = 'id';

    async init() {
        this.blogId = this.ctx.params[this.blogIdParam];
        this.blog = await BlogModel.get(this.blogId);
        if (!this.blog) return this.fail('Blog not found.');
        if (!this.blog.password) return;
        const { password } = this.ctx.request.query;
        if (this.blog.password !== '' && password !== this.blog.password) return this.fail('Wrong password.', -1);
    }
}

class BlogDetailHandler extends BlogDetailBaseHandler {
    async get() {
        const blog = this.blog;
        const author = (await UserModel.getById(blog.author)).serialize();
        const canEdit = this.user.uid === blog.author ? this.user.hasPriv(PRIV.EDIT_SELF_BLOG) : this.user.hasPriv(PRIV.EDIT_BLOG);
        const canDelete = this.user.uid === blog.author ? this.user.hasPriv(PRIV.DELETE_SELF_BLOG) : this.user.hasPriv(PRIV.DELETE_BLOG);
        const comments = await BlogModel.getComments(this.blogId);
        const usersDict = _.keyBy(await UserModel.getList(_.uniq(comments.map(comment => comment.author))), 'uid');
        const canCommentsDelete = _.keyBy(comments.map(comment => {
            return { commentId: comment.commentId, canDelete: comment.author === this.user.uid ? this.user.hasPriv(PRIV.DELETE_SELF_COMMENT) : this.user.hasPriv(PRIV.DELETE_COMMENT) };
        }), 'commentId');
        this.response.body = { blog, author, canEdit, canDelete, comments, usersDict, canCommentsDelete };
    }
}

export async function apply(ctx) {
    ctx.Route('blog_detail', '/blog/detail/:id', BlogDetailHandler);
}
