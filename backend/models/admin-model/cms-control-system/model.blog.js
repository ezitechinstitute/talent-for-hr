const db = require('../../../config/db.js');

const blogModel = {
    async getAll() {
        const [rows] = await db.query("SELECT * FROM blog_posts ORDER BY created_at DESC");
        return rows;
    },
    async getById(id) {
        const [rows] = await db.query("SELECT * FROM blog_posts WHERE id = ?", [id]);
        return rows[0];
    },
    async create(data) {
        const { title, content } = data;
        const [result] = await db.query("INSERT INTO blog_posts (title, content) VALUES (?, ?)", [title, content]);
        return result;
    },
    async update(id, data) {
        const { title, content } = data;
        const [result] = await db.query("UPDATE blog_posts SET title = ?, content = ?, updated_at = NOW() WHERE id = ?", [title, content, id]);
        return result;
    },
    async delete(id) {
        const [result] = await db.query("DELETE FROM blog_posts WHERE id = ?", [id]);
        return result;
    }
};


module.exports = blogModel;