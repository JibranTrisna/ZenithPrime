const db = require('../config/database');

exports.createTransaction = async (data) => {
    const status = data.status || 'pending';
    const query = `
        INSERT INTO transactions 
        (order_id, user_id, product_id, target_id, zone_id, amount, snap_token, status, promo_code, discount_amount, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
        data.order_id, data.user_id, data.product_id, data.target_id, data.zone_id || null, 
        data.amount, data.snap_token, status, data.promo_code || null, data.discount_amount || 0
    ];
    const [result] = await db.query(query, values);
    return result;
};

exports.getTransactionByOrderId = async (orderId, userId) => {
    const query = `
        SELECT t.*, p.name as item_name, g.name as game_name, g.thumbnail
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        JOIN games g ON p.game_slug = g.slug
        WHERE t.order_id = ? AND t.user_id = ?
    `;
    const [rows] = await db.query(query, [orderId, userId]);
    return rows[0];
};

exports.getUserTransactions = async (userId) => {
    const query = `
        SELECT t.*, 
               p.name as product_name, 
               g.name as game_name, 
               g.thumbnail,
               r.id as review_id, 
               r.rating as review_rating,
               r.comment as review_comment
        FROM transactions t
        JOIN products p ON t.product_id = p.id
        JOIN games g ON p.game_slug = g.slug
        LEFT JOIN reviews r ON t.order_id = r.order_id 
        WHERE t.user_id = ?
        ORDER BY t.created_at DESC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
};

exports.updateStatus = async (orderId, status, paymentType = null) => {
    const query = `UPDATE transactions SET status = ?, payment_type = ?, updated_at = NOW() WHERE order_id = ?`;
    const [result] = await db.query(query, [status, paymentType, orderId]);
    return result;
};

exports.getFinancialStats = async () => {
    const [rows] = await db.query(`
        SELECT 
            SUM(CASE WHEN t.status = 'success' THEN t.amount ELSE 0 END) as revenue,
            SUM(CASE WHEN t.status = 'success' THEN (t.amount - p.base_price) ELSE 0 END) as profit,
            SUM(CASE WHEN t.status IN ('failed', 'expired') THEN t.amount ELSE 0 END) as potential_loss,
            COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_count
        FROM transactions t
        JOIN products p ON t.product_id = p.id
    `);
    return rows[0];
};

exports.getRecentOrders = async (limit = 5) => {
    const [rows] = await db.query(`
        SELECT t.*, u.name as user_name, p.name as product_name 
        FROM transactions t 
        JOIN users u ON t.user_id = u.id 
        JOIN products p ON t.product_id = p.id 
        ORDER BY t.created_at DESC LIMIT ?
    `, [limit]);
    return rows;
};

exports.getHourlyRevenueToday = async () => {
    const query = `
        SELECT DATE_FORMAT(created_at, '%H:00') as hour, SUM(amount) as total
        FROM transactions
        WHERE status = 'success' 
        AND DATE(created_at) = CURDATE() -- Filter Data Hari Ini Saja
        GROUP BY hour
        ORDER BY hour ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};

exports.getDailyRevenueMonth = async () => {
    const query = `
        SELECT DAY(created_at) as day, SUM(amount) as total
        FROM transactions
        WHERE status = 'success' 
        AND MONTH(created_at) = MONTH(NOW()) 
        AND YEAR(created_at) = YEAR(NOW())
        GROUP BY day
        ORDER BY day ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};