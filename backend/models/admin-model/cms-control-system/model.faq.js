const db = require('../../../config/db.js');

const faqModel = {
    async getAll() {
        const [rows] = await db.query("SELECT * FROM faqs ORDER BY created_at DESC");
        return rows;
    },
    async getById(id) {
        const [rows] = await db.query("SELECT * FROM faqs WHERE id = ?", [id]);
        return rows[0];
    },
    async create(data) {
        const { question, answer } = data;
        const [result] = await db.query("INSERT INTO faqs (question, answer) VALUES (?, ?)", [question, answer]);
        return result;
    },
    async update(id, data) {
        const { question, answer } = data;
        const [result] = await db.query("UPDATE faqs SET question = ?, answer = ?, updated_at = NOW() WHERE id = ?", [question, answer, id]);
        return result;
    },
    async delete(id) {
        const [result] = await db.query("DELETE FROM faqs WHERE id = ?", [id]);
        return result;
    }
};

module.exports = faqModel;