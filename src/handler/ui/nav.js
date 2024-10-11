import { Handler } from '../../handler.js';

class NavHandler extends Handler {
    async get() {
        const NavItems = {
            NavItems: [
                { label: 'Home', key: 'home' },
                ...(this.user.uid > 1 ? [{ label: 'Post Blog', key: 'post' }] : []),
                { label: 'User', key: 'user' },
            ],
        };
        this.response.body = {
            ...NavItems,
            currentUser: this.user,
        };
    }
}

export async function apply(ctx) {
    ctx.Route('nav', '/ui/nav', NavHandler);
}
