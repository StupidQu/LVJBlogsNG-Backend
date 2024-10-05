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
     */
    constructor(blogId, title, content, author, createTime, updateTime) {
        this.blogId = blogId;
        this.title = title;
        this.content = content;
        this.author = author;
        this.createTime = createTime;
        this.updateTime = updateTime;
    }
};

db.run(`CREATE TABLE IF NOT EXISTS blog(
    blogId INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    author INT,
    createTime TEXT,
    updateTime TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS comments(
    commentId INTEGER PRIMARY KEY AUTOINCREMENT,
    blogId INT,
    content TEXT,
    author INT,
    createTime TEXT,
    updateTime TEXT
)`);

export class BlogModel {
    /**
     * 
     * @param {string} title
     * @param {string} content
     * @param {number} author 
     * @returns {number}
     */
    static async add(title, content, author) {
        const { blogId } = await db.run('INSERT INTO blog(title, content, author, createTime, updateTime) VALUES(?, ?, ?, ?, ?)', [title, content, author, Date.now(), Date.now()]);
        return blogId;
    }

    /**
     * 
     * @param {number} blogId 
     * @returns {Promise<Blog>}
     */
    static async get(blogId) {
        const blog = await db.get('SELECT * FROM blog WHERE blogId=?', [blogId]);
        return blog;
    }

    /**
     * @param {number} blogId
     * @param {string} title
     * @param {string} content
     * @returns {Promise<void>}
     */
    static async edit(blogId, title, content) {
        await db.run('UPDATE blog SET title=?, content=?, updateTime=? WHERE blogId=?', [title, content, Date.now(), blogId]);
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
        const { commentId } = await db.run('INSERT INTO comments(blogId, content, author, createTime, updateTime) VALUES(?, ?, ?, ?, ?)', [blogId, content, author, Date.now(), Date.now()]);
        return commentId;
    }

    /**
     * 
     * @param {number} blogId 
     * @returns {Promise<Comment[]>}
     */
    static async getComments(blogId) {
        const comments = await db.all('SELECT * FROM comments WHERE blogId=?', [blogId]);
        return comments;
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
     * Get all the blogs by an author.
     * @param {number} author 
     * @returns Promise<{blogId: number}[]>
     */
    static async getByAuthor(author) {
        return await db.all('SELECT blogId FROM blog WHERE author=?', [author]);
    }

    /**
     * 
     * @returns Promise<{blogId: number}[]>
     */
    static async getMulti() {
        return await db.all('SELECT blogId FROM blog ORDER BY createTime DESC');
    }
};
