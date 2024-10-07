import { Handler } from '../../handler.js';

class NavHandler extends Handler {
    async get() {
        const NavItems = {
            NavItems: [
                { label: 'Home', key: 'home' },
            ],
        };
        if (this.user.uid > 1) {
            NavItems.NavItems.push({ label: 'Post Blog', key: 'post' });
        }
        this.response.body = {
            ...NavItems,
            currentUser: this.user,
        };
    }
}

export async function apply(ctx) {
    ctx.Route('nav', '/ui/nav', NavHandler);
}
