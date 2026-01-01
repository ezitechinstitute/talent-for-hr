import db from "../../../config/db.js";

const homeBannerModel = {
    async getAll() {
        const [rows] = await db.query(
            "SELECT * FROM home_banners ORDER BY created_at DESC"
        );
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(
            "SELECT * FROM home_banners WHERE id = ?",
            [id]
        );
        return rows[0];
    },

    async create(data) {
        const { title, image, imagePublicId } = data;
        const [result] = await db.query(
            "INSERT INTO home_banners (title, image, image_public_id) VALUES (?, ?, ?)",
            [title, image, imagePublicId]
        );
        return { 
            id: result.insertId, 
            title, 
            image, 
            imagePublicId 
        };
    },

    async update(id, data) {
        const { title, image, imagePublicId } = data;
        
        if (image && imagePublicId) {
            const [result] = await db.query(
                "UPDATE home_banners SET title = ?, image = ?, image_public_id = ?, updated_at = NOW() WHERE id = ?",
                [title, image, imagePublicId, id]
            );
            return { id, title, image, imagePublicId };
        } else {
            const [result] = await db.query(
                "UPDATE home_banners SET title = ?, updated_at = NOW() WHERE id = ?",
                [title, id]
            );
            return { id, title };
        }
    },

    async delete(id) {
        const [result] = await db.query(
            "DELETE FROM home_banners WHERE id = ?",
            [id]
        );
        return { id };
    }
};

export default homeBannerModel;