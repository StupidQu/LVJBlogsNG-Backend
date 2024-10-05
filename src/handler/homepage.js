import { Handler } from '../handler.js';
import { BlogModel } from '../model/blog.js';

export class HomepageHandler extends Handler {
    async get() {
        const blogs = (await BlogModel.getMulti()).slice(20);
        this.response.body = {
            blogs
        };
    }
};

export async function apply(ctx) {
    ctx.Route('homepage', '/', HomepageHandler);
}
