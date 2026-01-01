import db from "../../../config/db.js";

const aboutPageModel = {
    async get() {
        const [rows] = await db.query("SELECT * FROM about_page WHERE id = 1");
        return rows[0];
    },

    async create(content) {
        const [result] = await db.query(
            "INSERT INTO about_page (id, content) VALUES (1, ?)",
            [content]
        );
        return result;
    },

    async update(content) {
        const [result] = await db.query(
            "UPDATE about_page SET content = ?, updated_at = NOW() WHERE id = 1",
            [content]
        );
        return result;
    }
};

export default aboutPageModel;
