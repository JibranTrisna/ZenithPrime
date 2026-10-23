const db = require('../config/database');

exports.dashboard = async (req, res) => {
    try {
        const [pendingOrders] = await db.query(`
            SELECT t.*, u.name as user_name, p.name as product_name, g.name as game_name
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            JOIN products p ON t.product_id = p.id
            JOIN games g ON p.game_slug = g.slug
            WHERE t.status = 'pending'
            ORDER BY t.created_at ASC
        `);

        const [recentHistory] = await db.query(`
            SELECT t.*, u.name as user_name, p.name as product_name
            FROM transactions t 
            JOIN users u ON t.user_id = u.id 
            JOIN products p ON t.product_id = p.id
            WHERE t.status != 'pending'
            ORDER BY t.updated_at DESC LIMIT 5
        `);

        res.render('staff/dashboard', {
            layout: 'layouts/main',
            title: 'Staff Workspace',
            active: 'staff',
            pendingOrders,
            recentHistory,
            user: req.session.user
        });

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error di Staff Panel");
    }
};

exports.processOrder = async (req, res) => {
    const { id, status } = req.body;

    // Staff hanya boleh menyelesaikan atau menggagalkan order
    if (!['success', 'failed'].includes(status) || !/^\d+$/.test(String(id))) {
        req.flash('error_msg', 'Data order tidak valid.');
        return res.redirect('/staff');
    }
    
    try {
        await db.query('UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
        
        if(status === 'success') {
            req.flash('success_msg', `Order #${id} berhasil diselesaikan.`);
        } else {
            req.flash('error_msg', `Order #${id} telah dibatalkan.`);
        }
        
        res.redirect('/staff');

    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Gagal memproses order.');
        res.redirect('/staff');
    }
};

exports.chatDashboard = async (req, res) => {
    try {
        // Otomatis sinkronisasi tiket untuk room aktif di chat_messages yang belum tercatat di cs_tickets
        const [untrackedRooms] = await db.query(`
            SELECT DISTINCT cm.room_id
            FROM chat_messages cm
            LEFT JOIN cs_tickets t ON cm.room_id = t.room_id
            WHERE t.id IS NULL AND cm.created_at >= NOW() - INTERVAL 24 HOUR
        `);

        for (const r of untrackedRooms) {
            const userId = parseInt(r.room_id.replace('user_', ''), 10);
            if (userId && !isNaN(userId)) {
                await db.query(`
                    INSERT IGNORE INTO cs_tickets (room_id, user_id, category, urgency, status, summary, is_complaint, is_ai_paused)
                    VALUES (?, ?, 'GENERAL_QUERY', 'low', 'ai_handled', 'Sesi Chat AI Pelanggan', 0, 0)
                `, [r.room_id, userId]);
            }
        }

        // Ambil seluruh tiket / antrean pelanggan dengan metadata keluhan, AI status, dan waktu pesan terakhir
        const [tickets] = await db.query(`
            SELECT 
                t.*, 
                u.name as user_name, 
                u.email as user_email,
                u.created_at as user_registered_at,
                h.name as handler_name,
                (SELECT COUNT(*) FROM chat_messages m WHERE m.room_id = t.room_id AND m.created_at >= NOW() - INTERVAL 24 HOUR) as message_count,
                (SELECT message FROM chat_messages m WHERE m.room_id = t.room_id ORDER BY m.id DESC LIMIT 1) as latest_message,
                (SELECT is_staff_reply FROM chat_messages m WHERE m.room_id = t.room_id ORDER BY m.id DESC LIMIT 1) as latest_is_staff,
                (SELECT is_ai FROM chat_messages m WHERE m.room_id = t.room_id ORDER BY m.id DESC LIMIT 1) as latest_is_ai,
                (SELECT created_at FROM chat_messages m WHERE m.room_id = t.room_id ORDER BY m.id DESC LIMIT 1) as latest_message_time
            FROM cs_tickets t
            JOIN users u ON t.user_id = u.id
            LEFT JOIN users h ON t.handled_by = h.id
            ORDER BY 
                CASE 
                    WHEN t.status = 'needs_followup' AND t.urgency = 'urgent' THEN 1
                    WHEN t.status = 'needs_followup' AND t.urgency = 'high' THEN 2
                    WHEN t.status = 'needs_followup' THEN 3
                    WHEN t.status = 'in_progress' THEN 4
                    WHEN t.status = 'ai_handled' THEN 5
                    ELSE 6
                END,
                t.updated_at DESC
        `);

        // Hitung statistik antrian untuk badge staf
        const stats = {
            totalComplaints: tickets.filter(t => t.status === 'needs_followup').length,
            totalInProgress: tickets.filter(t => t.status === 'in_progress').length,
            totalResolved: tickets.filter(t => t.status === 'resolved').length,
            totalAiHandled: tickets.filter(t => t.status === 'ai_handled').length,
            totalTickets: tickets.length
        };

        res.render('staff/chat', {
            layout: 'layouts/main',
            title: 'Live CS Support & AI Bot Inbox',
            active: 'chat',
            tickets,
            stats,
            user: req.session.user
        });
    } catch (err) {
        console.error("Error Chat Dashboard:", err);
        res.status(500).send("Error Chat Dashboard");
    }
};

exports.getChatHistory = async (req, res) => {
    const { roomId } = req.params;

    // Hanya terima format room yang valid: user_<angka>
    if (!/^user_\d+$/.test(roomId)) {
        return res.status(400).json({ error: 'Room ID tidak valid.' });
    }

    try {
        const [chats] = await db.query(
            "SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC", 
            [roomId]
        );
        res.json(chats);
    } catch (err) {
        console.error("Chat History Error:", err);
        res.status(500).json({ error: 'Gagal memuat riwayat chat.' });
    }
};

exports.getChatUserInfo = async (req, res) => {
    const { roomId } = req.params;
    if (!/^user_\d+$/.test(roomId)) {
        return res.status(400).json({ error: 'Room ID tidak valid.' });
    }

    const userId = parseInt(roomId.replace('user_', ''), 10);

    try {
        // Info profil pelanggan
        const [userRows] = await db.query(
            'SELECT id, name, email, role, phone, created_at FROM users WHERE id = ?',
            [userId]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
        }
        const customer = userRows[0];

        // Status tiket terkini
        const [ticketRows] = await db.query(`
            SELECT t.*, h.name as handler_name
            FROM cs_tickets t
            LEFT JOIN users h ON t.handled_by = h.id
            WHERE t.room_id = ?
            LIMIT 1
        `, [roomId]);
        const ticket = ticketRows[0] || null;

        // 3 Transaksi Top Up Terakhir
        const [recentTransactions] = await db.query(`
            SELECT t.id, t.order_id, t.amount, t.status, t.payment_type as payment_method, t.target_id, t.zone_id, t.created_at,
                   p.name as product_name, g.name as game_name
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            JOIN games g ON p.game_slug = g.slug
            WHERE t.user_id = ?
            ORDER BY t.created_at DESC
            LIMIT 3
        `, [userId]);

        // 3 Pesanan Joki Terakhir (jika ada)
        const [recentJoki] = await db.query(`
            SELECT jo.id, jo.order_id, jo.service_name, jo.current_rank, jo.target_rank, 
                   jo.total_amount, jo.payment_status, jo.order_status, jo.play_mode, jo.created_at,
                   g.name as game_name, w.name as worker_name
            FROM joki_orders jo
            LEFT JOIN games g ON jo.game_slug = g.slug
            LEFT JOIN users w ON jo.worker_id = w.id
            WHERE jo.user_id = ?
            ORDER BY jo.created_at DESC
            LIMIT 3
        `, [userId]);

        res.json({
            success: true,
            customer,
            ticket,
            recentTransactions,
            recentJoki
        });
    } catch (err) {
        console.error("Get Chat User Info Error:", err);
        res.status(500).json({ error: 'Gagal memuat detail pelanggan.' });
    }
};

exports.updateTicketStatus = async (req, res) => {
    const { roomId } = req.params;
    const { action, notes } = req.body;

    if (!/^user_\d+$/.test(roomId)) {
        return res.status(400).json({ error: 'Room ID tidak valid.' });
    }

    const staffUser = req.session.user;

    try {
        if (action === 'takeover') {
            await db.query(`
                UPDATE cs_tickets SET 
                    is_ai_paused = 1,
                    status = 'in_progress',
                    handled_by = ?,
                    updated_at = NOW()
                WHERE room_id = ?
            `, [staffUser.id, roomId]);
        } else if (action === 'handover_ai') {
            await db.query(`
                UPDATE cs_tickets SET 
                    is_ai_paused = 0,
                    status = 'ai_handled',
                    updated_at = NOW()
                WHERE room_id = ?
            `, [roomId]);
        } else if (action === 'resolve') {
            await db.query(`
                UPDATE cs_tickets SET 
                    status = 'resolved',
                    is_ai_paused = 0,
                    notes = ?,
                    handled_by = ?,
                    updated_at = NOW()
                WHERE room_id = ?
            `, [notes || 'Selesai ditangani staf', staffUser.id, roomId]);
        } else if (action === 'add_note') {
            await db.query(`
                UPDATE cs_tickets SET 
                    notes = ?,
                    updated_at = NOW()
                WHERE room_id = ?
            `, [notes || '', roomId]);
        } else {
            return res.status(400).json({ error: 'Action tidak dikenal.' });
        }

        const [updated] = await db.query('SELECT * FROM cs_tickets WHERE room_id = ?', [roomId]);
        res.json({ success: true, ticket: updated[0] });
    } catch (err) {
        console.error("Update Ticket Status Error:", err);
        res.status(500).json({ error: 'Gagal memperbarui status tiket.' });
    }
};