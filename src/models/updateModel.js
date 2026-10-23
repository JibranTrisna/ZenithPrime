const db = require('../config/database');

exports.getLatestUpdates = async (limit = 4) => {
    const [rows] = await db.query(`
        SELECT *, DATE_FORMAT(created_at, "%d %b %Y") as formatted_date 
        FROM updates 
        ORDER BY created_at DESC 
        LIMIT ?`, [Number(limit)]);
    return rows;
};

exports.getAllUpdates = async () => {
    const [rows] = await db.query(`
        SELECT *, DATE_FORMAT(created_at, "%d %b %Y") as formatted_date 
        FROM updates 
        ORDER BY created_at DESC`);
    return rows;
};

exports.getUpdateBySlug = async (slug) => {
    const [rows] = await db.query(`
        SELECT *, DATE_FORMAT(created_at, "%d %b %Y, %H:%i WIB") as full_date 
        FROM updates 
        WHERE slug = ?`, [slug]);
    return rows[0];
};