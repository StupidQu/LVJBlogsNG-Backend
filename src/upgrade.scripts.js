import db from './lib/db.js';

/**
 * @type { Function[] }
 */
export const upgradeScripts = [
    async () => {
        // This adds a "password" key for each blog in the database, default it is null
        await db.run('ALTER TABLE blog ADD COLUMN password TEXT NULL;');
    },
    async () => {
        // This adds a "unameLower" key for each user in the database.
        await db.run('ALTER TABLE user ADD COLUMN unameLower TEXT NOT NULL DEFAULT "";');
        await db.run('UPDATE user SET unameLower = LOWER(uname);');
    },
];