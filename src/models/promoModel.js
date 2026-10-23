const db = require('../config/database');

exports.getAllPromos = async () => {
    const [rows] = await db.query('SELECT *, DATE_FORMAT(created_at, "%d %b %Y") as created_date FROM promo_codes ORDER BY created_at DESC');
    return rows;
};

exports.createPromo = async (data) => {
    const query = `
        INSERT INTO promo_codes (code, discount_percent, max_discount, quota, status) 
        VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [data.code.toUpperCase(), data.discount_percent, data.max_discount, data.quota, data.status]);
    return result;
};

exports.deletePromo = async (id) => {
    const query = 'DELETE FROM promo_codes WHERE id = ?';
    const [result] = await db.query(query, [id]);
    return result;
};

exports.updateStatus = async (id, status) => {
    const query = 'UPDATE promo_codes SET status = ? WHERE id = ?';
    const [result] = await db.query(query, [status, id]);
    return result;
};

exports.findActiveByCode = async (code) => {
    const query = "SELECT * FROM promo_codes WHERE code = ? AND status = 'active'";
    const [rows] = await db.query(query, [code]);
    return rows[0];
};