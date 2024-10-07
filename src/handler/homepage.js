import _ from 'lodash';
import { Handler } from '../handler.js';
import { BlogModel } from '../model/blog.js';
import { UserModel } from '../model/user.js';

export class HomepageHandler extends Handler {
    async get() {
        const blogs = await BlogModel.getMulti();
        const users = await UserModel.getList(_.uniq(blogs.map(blog => blog.author)));
        const usersDict = _.keyBy(users, 'uid');
        this.response.body = {
            blogs,
            usersDict,
            location: 'homepage',
        };
    }
};

export async function apply(ctx) {
    ctx.Route('homepage', '/', HomepageHandler);
}
