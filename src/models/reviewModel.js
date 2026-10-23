const db = require('../config/database');

exports.createReview = async (userId, orderId, rating, comment) => {
    const query = `
        INSERT INTO reviews (user_id, order_id, rating, comment) 
        VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [userId, orderId, rating, comment]);
    return result;
};

exports.getLatestReviews = async () => {
    const query = `
        SELECT r.*, u.name as user_name, g.name as game_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN transactions t ON r.order_id = t.order_id 
        JOIN products p ON t.product_id = p.id
        JOIN games g ON p.game_slug = g.slug
        ORDER BY r.created_at DESC
        LIMIT 6
    `;
    const [rows] = await db.query(query);
    return rows;
};

exports.checkIfReviewed = async (orderId) => {
    const [rows] = await db.query('SELECT id FROM reviews WHERE order_id = ?', [orderId]);
    return rows.length > 0;
};