const db = require('../config/database');

exports.getAllGames = async () => {
    const query = `
        SELECT g.*, 
               COALESCE(AVG(r.rating), 5.0) as rating, -- Default 5.0 jika belum ada review
               COUNT(r.id) as total_reviews
        FROM games g
        LEFT JOIN products p ON g.slug = p.game_slug
        LEFT JOIN transactions t ON p.id = t.product_id
        LEFT JOIN reviews r ON t.order_id = r.order_id
        GROUP BY g.id
        ORDER BY total_reviews DESC, g.name ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};

exports.getGameBySlug = async (slug) => {
    const [rows] = await db.query('SELECT * FROM games WHERE slug = ?', [slug]);
    return rows[0];
};

exports.getProductsByGameSlug = async (slug) => {
    const [rows] = await db.query('SELECT * FROM products WHERE game_slug = ? ORDER BY price ASC', [slug]);
    return rows;
};

exports.getProductById = async (id) => {
    const query = `
        SELECT p.*, g.name as game_name, g.thumbnail, g.slug as game_slug
        FROM products p 
        JOIN games g ON p.game_slug = g.slug 
        WHERE p.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0];
};