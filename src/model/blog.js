import db from '../lib/db.js';

export class Comment {
    constructor(commentId, blogId, content, author, createTime, updateTime) {
        this.commentId = commentId;
        this.blogId = blogId;
        this.content = content;
        this.author = author;
        this.createTime = createTime;
        this.updateTime = updateTime;
    }
};

export class Blog {
    /**
     * 
     * @param {number} blogId 
     * @param {string} title 
     * @param {string} content 
     * @param {number} author 
     * @param {number} createTime 
     * @param {number} updateTime 
     * @param {string?} password
     * @param {number?} commentsCount
     */
    constructor(blogId, title, content, author, createTime, updateTime, password = '', commentsCount = 0) {
        this.blogId = blogId;
        this.title = title;
        this.content = content;
        this.author = author;
        this.createTime = createTime;
        this.updateTime = updateTime;
        this.password = password;
        this.commentsCount = commentsCount;
    }

    serialize() {
        if (this.password && this.password !== '') this.protected = true;
        delete this.password;
        return this;
    }
};

function blogFromRow(row) {
    return new Blog(row.blogId, row.title, row.content, row.author, row.createTime, row.updateTime, row.password, row.commentsCount);
}

db.run(`CREATE TABLE IF NOT EXISTS blog(
    blogId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    author INTEGER,
    createTime INTEGER,
    updateTime INTEGER,
    password TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS comments(
    commentId INTEGER PRIMARY KEY AUTOINCREMENT,
    blogId INTEGER,
    content TEXT,
    author INTEGER,
    createTime INTEGER,
    updateTime INTEGER
)`);

export class BlogModel {
    /**
     * Add a blog.
     * @param {string} title
     * @param {string} content
     * @param {number} author 
     * @param {string?} password
     * @returns {Promise<number>}
     */
    static async add(title, content, author, password = undefined) {
        const { lastID } = await db.run('INSERT INTO blog(title, content, author, createTime, updateTime, password) VALUES(?, ?, ?, ?, ?, ?)', [title, content, author, Date.now(), Date.now(), password]);
        return lastID;
    }

    /**
     * 
     * @param {number} blogId 
     * @returns {Promise<Blog>}
     */
    static async get(blogId) {
        const blog = await db.get('SELECT * FROM blog WHERE blogId=?', [blogId]);
        return blogFromRow(blog);
    }

    /**
     * @param {number} blogId
     * @param {string} title
     * @param {string} content
     * @param {string?} password
     * @returns {Promise<void>}
     */
    static async edit(blogId, title, content, password = undefined) {
        await db.run('UPDATE blog SET title=?, content=?, updateTime=?, password=? WHERE blogId=?', [title, content, Date.now(), password, blogId]);
    }

    /**
     * 
     * @param {number} blogId 
     */
    static async delete(blogId) {
        await db.run('DELETE FROM blog WHERE blogId=?', [blogId]);
        await db.run('DELETE FROM comments WHERE blogId=?', [blogId]);
    }

    /**
     * 
     * @param {number} blogId 
     * @param {string} content
     * @param {number} author  
     * @returns {Promise<number>}
     */
    static async addComment(blogId, content, author) {
        const { lastID } = await db.run('INSERT INTO comments(blogId, content, author, createTime, updateTime) VALUES(?, ?, ?, ?, ?)', [blogId, content, author, Date.now(), Date.now()]);
        return lastID;
    }

    /**
     * Get all the comments of a blog.
     * @param {number} blogId 
     * @param {number?} limit
     * @returns {Promise<Comment[]>}
     */
    static async getComments(blogId, limit = 20) {
        const comments = await db.all('SELECT * FROM comments WHERE blogId=? ORDER BY createTime DESC LIMIT ?', [blogId, limit]);
        return comments;
    }

    /**
     * Get a comment.
     * @param {number} commentId 
     * @returns {Promise<Comment>}
     */
    static async getComment(commentId) {
        return await db.get('SELECT * FROM comments WHERE commentId=?', [commentId]);
    }

    /**
     * 
     * @param {number} commentId 
     */
    static async deleteComment(commentId) {
        await db.run('DELETE FROM comments WHERE commentId=?', [commentId]);
    }

    /**
     * 
     * @param {number} commentId 
     * @param {string} content 
     */
    static async editComment(commentId, content) {
        await db.run('UPDATE comments SET content=?, updateTime=? WHERE commentId=?', [content, Date.now(), commentId]);
    }

    /**
     * Return the number of comments.
     * @param {number} blogId 
     * @returns {Promise<number>}
     */
    static async getCommentsCount(blogId) {
        return (await db.get('SELECT COUNT(*) AS count FROM comments WHERE blogId=?', [blogId])).count;
    }

    /**
     * Get all the blogs by an author.
     * @param {number} author 
     * @returns {Promise<Blog[]>}
     */
    static async getByAuthor(author) {
        return (await db.all('SELECT * FROM blog WHERE author=?', [author])).map(row => blogFromRow(row));
    }

    /**
     * Get multi blogs
     * @param {number} skip
     * @param {number} limit
     * @param {string?} extraSQL
     * @returns {Promise<Blog[]>}
     */
    static async getMulti(skip = 0, limit = 10, extraSQL = '') {
        if (extraSQL.length > 0) extraSQL = `WHERE ${extraSQL}`;
        return (await db.all(`SELECT * FROM blog ${extraSQL} ORDER BY createTime DESC LIMIT ${limit} ${skip ? ('OFFSET ' + skip.toString()) : ''}`)).map(row => blogFromRow(row));
    }
};
 