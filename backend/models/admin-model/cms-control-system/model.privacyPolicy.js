const db = require('../../../config/db.js');

const privacyPolicyModel = {
    async get() {
        const [rows] = await db.query("SELECT * FROM privacy_policy WHERE id = 1");
        return rows[0];
    },

    async create(content) {
        const [result] = await db.query(
            "INSERT INTO privacy_policy (id, content) VALUES (1, ?)",
            [content]
        );
        return result;
    },

    async update(content) {
        const [result] = await db.query(
            "UPDATE privacy_policy SET content = ?, updated_at = NOW() WHERE id = 1",
            [content]
        );
        return result;
    }
};

module.exports = privacyPolicyModel;