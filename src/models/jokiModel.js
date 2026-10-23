const db = require('../config/database');

/**
 * Model Joki Game Service
 * Menangani katalog joki, pemesanan, pembagian tugas joki (staff),
 * status live tracking, dan manajemen joki untuk admin.
 */

// ==========================================
// 🎮 KATALOG & LAYANAN JOKI
// ==========================================

exports.getJokiGames = async () => {
    const query = `
        SELECT g.id, g.name, g.slug, g.thumbnail, g.category,
               COUNT(js.id) as service_count,
               MIN(js.price) as min_price
        FROM games g
        INNER JOIN joki_services js ON g.slug = js.game_slug
        WHERE js.is_active = 1
        GROUP BY g.id, g.name, g.slug, g.thumbnail, g.category
        ORDER BY service_count DESC, g.name ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};

exports.getGameBySlug = async (slug) => {
    const [rows] = await db.query('SELECT * FROM games WHERE slug = ?', [slug]);
    return rows[0] || null;
};

exports.getServicesByGameSlug = async (slug) => {
    const query = `
        SELECT * FROM joki_services 
        WHERE game_slug = ? AND is_active = 1 
        ORDER BY category ASC, price ASC
    `;
    const [rows] = await db.query(query, [slug]);
    return rows;
};

exports.getServiceById = async (id) => {
    const query = `
        SELECT js.*, g.name as game_name, g.thumbnail as game_thumbnail
        FROM joki_services js
        LEFT JOIN games g ON js.game_slug = g.slug
        WHERE js.id = ?
    `;
    const [rows] = await db.query(query, [id]);
    return rows[0] || null;
};

// ==========================================
// 📦 PEMESANAN & TRANSAKSI JOKI
// ==========================================

exports.createOrder = async (data) => {
    const query = `
        INSERT INTO joki_orders 
        (order_id, user_id, service_id, game_slug, service_name, request_type, current_rank, target_rank, play_mode,
         quantity, total_amount, login_via, account_id, account_password, nickname, whatsapp, request_hero, notes, 
         snap_token, payment_status, order_status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    const values = [
        data.order_id,
        data.user_id,
        data.service_id || 0,
        data.game_slug,
        data.service_name,
        data.request_type || 'Push Rank',
        data.current_rank || null,
        data.target_rank || null,
        data.play_mode || 'solo',
        data.quantity || 1,
        data.total_amount,
        data.login_via || 'Official',
        data.account_id || '-',
        data.account_password || null,
        data.nickname || null,
        data.whatsapp,
        data.request_hero || null,
        data.notes || null,
        data.snap_token || null,
        data.payment_status || 'pending',
        data.order_status || 'unpaid'
    ];
    const [result] = await db.query(query, values);
    return result;
};

exports.getOrderByOrderId = async (orderId, userId = null) => {
    let query = `
        SELECT jo.*, 
               u.name as customer_name, u.email as customer_email,
               w.name as worker_name, w.email as worker_email,
               g.name as game_name, g.thumbnail as game_thumbnail,
               js.estimate_time, js.category as service_category
        FROM joki_orders jo
        JOIN users u ON jo.user_id = u.id
        LEFT JOIN users w ON jo.worker_id = w.id
        LEFT JOIN games g ON jo.game_slug = g.slug
        LEFT JOIN joki_services js ON jo.service_id = js.id
        WHERE jo.order_id = ?
    `;
    const params = [orderId];

    if (userId) {
        query += ' AND jo.user_id = ?';
        params.push(userId);
    }

    const [rows] = await db.query(query, params);
    return rows[0] || null;
};

exports.getUserOrders = async (userId) => {
    const query = `
        SELECT jo.*, 
               g.name as game_name, g.thumbnail as game_thumbnail,
               w.name as worker_name
        FROM joki_orders jo
        LEFT JOIN games g ON jo.game_slug = g.slug
        LEFT JOIN users w ON jo.worker_id = w.id
        WHERE jo.user_id = ?
        ORDER BY jo.created_at DESC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
};

exports.updatePaymentStatus = async (orderId, paymentStatus, paymentType = null) => {
    let orderStatusUpdate = '';
    if (paymentStatus === 'success') {
        orderStatusUpdate = ", order_status = CASE WHEN order_status = 'unpaid' THEN 'queued' ELSE order_status END";
    } else if (['failed', 'expired'].includes(paymentStatus)) {
        orderStatusUpdate = ", order_status = CASE WHEN order_status = 'unpaid' THEN 'canceled' ELSE order_status END";
    }

    const query = `
        UPDATE joki_orders 
        SET payment_status = ?, payment_type = ? ${orderStatusUpdate}, updated_at = NOW() 
        WHERE order_id = ?
    `;
    const [result] = await db.query(query, [paymentStatus, paymentType, orderId]);
    return result;
};

// ==========================================
// 💼 STAFF & WORKER WORKSPACE
// ==========================================

exports.getQueuedOrders = async () => {
    const query = `
        SELECT jo.*, u.name as customer_name, g.name as game_name, g.thumbnail as game_thumbnail,
               js.estimate_time
        FROM joki_orders jo
        JOIN users u ON jo.user_id = u.id
        LEFT JOIN games g ON jo.game_slug = g.slug
        LEFT JOIN joki_services js ON jo.service_id = js.id
        WHERE jo.order_status = 'queued' AND jo.payment_status = 'success'
        ORDER BY jo.created_at ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};

exports.getStaffActiveOrders = async (workerId) => {
    const query = `
        SELECT jo.*, u.name as customer_name, g.name as game_name, g.thumbnail as game_thumbnail,
               js.estimate_time
        FROM joki_orders jo
        JOIN users u ON jo.user_id = u.id
        LEFT JOIN games g ON jo.game_slug = g.slug
        LEFT JOIN joki_services js ON jo.service_id = js.id
        WHERE jo.worker_id = ? AND jo.order_status = 'in_progress'
        ORDER BY jo.updated_at DESC
    `;
    const [rows] = await db.query(query, [workerId]);
    return rows;
};

exports.getStaffCompletedOrders = async (workerId, limit = 10) => {
    const query = `
        SELECT jo.*, u.name as customer_name, g.name as game_name, g.thumbnail as game_thumbnail
        FROM joki_orders jo
        JOIN users u ON jo.user_id = u.id
        LEFT JOIN games g ON jo.game_slug = g.slug
        WHERE jo.worker_id = ? AND jo.order_status = 'completed'
        ORDER BY jo.updated_at DESC
        LIMIT ?
    `;
    const [rows] = await db.query(query, [workerId, Number(limit)]);
    return rows;
};

exports.claimOrder = async (orderId, workerId) => {
    const query = `
        UPDATE joki_orders 
        SET worker_id = ?, order_status = 'in_progress', updated_at = NOW() 
        WHERE order_id = ? AND order_status = 'queued'
    `;
    const [result] = await db.query(query, [workerId, orderId]);
    return result.affectedRows > 0;
};

exports.completeOrder = async (orderId, workerId, proofImage, notes, isAdmin = false) => {
    let query = `
        UPDATE joki_orders 
        SET order_status = 'completed', proof_image = ?, worker_notes = ?, updated_at = NOW() 
        WHERE order_id = ?
    `;
    const params = [proofImage, notes, orderId];

    if (!isAdmin) {
        query += ' AND worker_id = ?';
        params.push(workerId);
    }

    const [result] = await db.query(query, params);
    return result.affectedRows > 0;
};

// ==========================================
// ⚡ ADMIN MANAGEMENT & CRUD
// ==========================================

exports.getAllOrdersAdmin = async () => {
    const query = `
        SELECT jo.*, 
               u.name as customer_name, u.email as customer_email,
               w.name as worker_name,
               g.name as game_name, g.thumbnail as game_thumbnail
        FROM joki_orders jo
        JOIN users u ON jo.user_id = u.id
        LEFT JOIN users w ON jo.worker_id = w.id
        LEFT JOIN games g ON jo.game_slug = g.slug
        ORDER BY jo.created_at DESC
    `;
    const [rows] = await db.query(query);
    return rows;
};

exports.getAllServicesAdmin = async () => {
    const query = `
        SELECT js.*, g.name as game_name, g.thumbnail as game_thumbnail
        FROM joki_services js
        LEFT JOIN games g ON js.game_slug = g.slug
        ORDER BY js.game_slug ASC, js.category ASC, js.price ASC
    `;
    const [rows] = await db.query(query);
    return rows;
};

exports.createService = async (data) => {
    const query = `
        INSERT INTO joki_services 
        (game_slug, category, name, price, base_price, min_order, estimate_time, description, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        data.game_slug,
        data.category,
        data.name,
        data.price,
        data.base_price || (data.price * 0.7),
        data.min_order || 1,
        data.estimate_time || '1-24 Jam',
        data.description || null,
        data.is_active !== undefined ? data.is_active : 1
    ];
    const [result] = await db.query(query, values);
    return result;
};

exports.updateService = async (id, data) => {
    const query = `
        UPDATE joki_services 
        SET game_slug = ?, category = ?, name = ?, price = ?, base_price = ?, 
            min_order = ?, estimate_time = ?, description = ?, is_active = ?, updated_at = NOW()
        WHERE id = ?
    `;
    const values = [
        data.game_slug,
        data.category,
        data.name,
        data.price,
        data.base_price,
        data.min_order || 1,
        data.estimate_time,
        data.description,
        data.is_active,
        id
    ];
    const [result] = await db.query(query, values);
    return result;
};

exports.deleteService = async (id) => {
    const [result] = await db.query('DELETE FROM joki_services WHERE id = ?', [id]);
    return result;
};

exports.getJokiStats = async () => {
    const [revenueRows] = await db.query(`
        SELECT 
            COUNT(*) as total_orders,
            SUM(CASE WHEN payment_status = 'success' THEN total_amount ELSE 0 END) as total_revenue,
            SUM(CASE WHEN order_status = 'queued' THEN 1 ELSE 0 END) as queued_count,
            SUM(CASE WHEN order_status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
            SUM(CASE WHEN order_status = 'completed' THEN 1 ELSE 0 END) as completed_count
        FROM joki_orders
    `);

    const [workerRows] = await db.query(`
        SELECT COUNT(DISTINCT id) as total_workers FROM users WHERE role IN ('staff', 'admin')
    `);

    const [serviceCount] = await db.query(`
        SELECT COUNT(*) as total_services FROM joki_services WHERE is_active = 1
    `);

    return {
        ...revenueRows[0],
        total_workers: workerRows[0].total_workers || 0,
        total_services: serviceCount[0].total_services || 0
    };
};
