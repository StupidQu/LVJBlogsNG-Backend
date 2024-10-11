import db from './lib/db.js';

/**
 * @type { Function[] }
 */
export const upgradeScripts = [
  () => {
      // This adds a "password" key for each blog in the database, default it is null
      db.run('ALTER TABLE blog ADD COLUMN password TEXT NULL;');
  }
];