const db = require('../../../config/db.js');

const termsModel = {
    async get() {
        const [rows] = await db.query("SELECT * FROM terms_conditions WHERE id = 1");
        return rows[0];
    },

    async create(content) {
        const [result] = await db.query(
            "INSERT INTO terms_conditions (id, content) VALUES (1, ?)",
            [content]
        );
        return result;
    },

    async update(content) {
        const [result] = await db.query(
            "UPDATE terms_conditions SET content = ?, updated_at = NOW() WHERE id = 1",
            [content]
        );
        return result;
    }
};

module.exports = termsModel;