const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const PromoModel = require('../models/promoModel');
const TransactionModel = require('../models/transactionModel'); 
const { isValidTransactionStatus, ipJailManager, accountLockoutManager } = require('../middlewares/securityMiddleware');
const { logFilePath } = require('../utils/securityLogger');

exports.dashboard = async (req, res) => {
    res.render('admin/dashboard', {
        layout: 'layouts/admin_layout',
        title: 'Admin Dashboard',
        path: 'dashboard',
        user: req.session.user
    });
};

exports.getDashboardStats = async (req, res) => {
    try {
        const financials = await TransactionModel.getFinancialStats();
        const [users] = await db.query('SELECT COUNT(*) as total FROM users');
        const [games] = await db.query('SELECT COUNT(*) as total FROM games WHERE status = "active"');
        const recentOrders = await TransactionModel.getRecentOrders(5);
        const rawHourly = await TransactionModel.getHourlyRevenueToday();
        const hourlyLabels = [];
        const hourlyData = [];
        
        for (let i = 0; i < 24; i++) {
            const hourStr = i.toString().padStart(2, '0') + ":00";
            hourlyLabels.push(hourStr);
            const found = rawHourly.find(r => r.hour === hourStr);
            hourlyData.push(found ? Number(found.total) : 0);
        }

        const rawDaily = await TransactionModel.getDailyRevenueMonth();
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dailyLabels = Array.from({length: daysInMonth}, (_, i) => i + 1);
        const dailyData = dailyLabels.map(day => {
            const found = rawDaily.find(r => r.day === day);
            return found ? Number(found.total) : 0;
        });

        res.json({
            stats: {
                revenue: financials.revenue || 0,
                profit: financials.profit || 0,
                loss: financials.potential_loss || 0,
                pending: financials.pending_count || 0,
                users: users[0].total || 0,
                games: games[0].total || 0
            },
            charts: {
                hourly: { labels: hourlyLabels, data: hourlyData },
                daily: { labels: dailyLabels, data: dailyData }
            },
            recentOrders: recentOrders
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server Error" });
    }
};

exports.games = async (req, res) => {
    const [games] = await db.query('SELECT * FROM games ORDER BY name ASC');
    res.render('admin/games', { layout: 'layouts/admin_layout', title: 'Kelola Game', games, path: 'games', user: req.session.user });
};

exports.gameDetail = async (req, res) => {
    try {
        const gameId = req.params.id;
        const [game] = await db.query('SELECT * FROM games WHERE id = ?', [gameId]);
        
        if (game.length === 0) return res.redirect('/admin/games');

        const [products] = await db.query('SELECT * FROM products WHERE game_slug = ? ORDER BY price ASC', [game[0].slug]);

        res.render('admin/game_detail', {
            layout: 'layouts/admin_layout',
            title: `Kelola ${game[0].name}`,
            game: game[0],
            products: products,
            path: 'games',
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error detail game");
    }
};

exports.addGame = async (req, res) => {
    const { name, slug, developer, category } = req.body;
    const thumbnail = req.file ? req.file.filename : 'default.jpg';
    
    await db.query('INSERT INTO games (name, slug, developer, category, thumbnail, status, input_type) VALUES (?, ?, ?, ?, ?, "active", "id_only")', 
        [name, slug, developer, category, thumbnail]);
    res.redirect('/admin/games');
};

exports.updateGame = async (req, res) => {
    try {
        const { id, name, slug, developer, category, instructions, input_type, status } = req.body;
        
        let query = `UPDATE games SET name=?, slug=?, developer=?, category=?, instructions=?, input_type=?, status=?`;
        let params = [name, slug, developer, category, instructions, input_type, status];

        if (req.file) {
            query += `, thumbnail=?`;
            params.push(req.file.filename);
        }
        
        const requires_zone = (input_type === 'id_zone') ? 1 : 0;
        query += `, requires_zone=? WHERE id=?`;
        params.push(requires_zone, id);

        await db.query(query, params);
        
        await db.query('UPDATE products SET game_slug=? WHERE game_slug=(SELECT slug FROM games WHERE id=?)', [slug, id]);

        res.redirect(`/admin/games/${id}`);
    } catch (err) {
        console.error("Update Game Error:", err);
        res.redirect('/admin/games');
    }
};

exports.deleteGame = async (req, res) => {
    const { id } = req.body;
    const [g] = await db.query("SELECT slug FROM games WHERE id=?", [id]);
    if(g.length > 0) {
        await db.query('DELETE FROM products WHERE game_slug = ?', [g[0].slug]);
        await db.query('DELETE FROM games WHERE id = ?', [id]);
    }
    res.redirect('/admin/games');
};

exports.addProduct = async (req, res) => {
    const { game_slug, name, price, base_price, game_id } = req.body;
    await db.query('INSERT INTO products (game_slug, name, price, base_price) VALUES (?, ?, ?, ?)', 
        [game_slug, name, price, base_price]);
    res.redirect(`/admin/games/${game_id}`);
};

exports.editProduct = async (req, res) => {
    const { id, name, price, base_price, game_id } = req.body;
    await db.query('UPDATE products SET name=?, price=?, base_price=? WHERE id=?', 
        [name, price, base_price, id]);
    res.redirect(`/admin/games/${game_id}`);
};

exports.deleteProduct = async (req, res) => {
    const { id, game_id } = req.body;
    await db.query('DELETE FROM products WHERE id=?', [id]);
    res.redirect(`/admin/games/${game_id}`);
};

exports.transactions = async (req, res) => {
    const [orders] = await db.query(`
        SELECT t.*, u.name as user_name, p.name as product_name, g.name as game_name
        FROM transactions t 
        JOIN users u ON t.user_id = u.id 
        JOIN products p ON t.product_id = p.id
        JOIN games g ON p.game_slug = g.slug
        ORDER BY t.created_at DESC
    `);
    res.render('admin/transactions', { layout: 'layouts/admin_layout', title: 'Transaksi', orders, path: 'transactions', user: req.session.user });
};

exports.updateTransaction = async (req, res) => {
    const { id, status } = req.body;

    // Hanya status yang valid sesuai enum database
    if (!isValidTransactionStatus(status) || !/^\d+$/.test(String(id))) {
        req.flash('error_msg', 'Data transaksi tidak valid.');
        return res.redirect('/admin/transactions');
    }

    await db.query('UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    res.redirect('/admin/transactions');
};

exports.updates = async (req, res) => {
    const [news] = await db.query('SELECT * FROM updates ORDER BY created_at DESC');
    res.render('admin/updates', { layout: 'layouts/admin_layout', title: 'Kelola Berita', news, path: 'updates', user: req.session.user });
};

exports.addUpdate = async (req, res) => {
    const { title, type, content } = req.body;
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''); 
    await db.query('INSERT INTO updates (title, slug, type, content) VALUES (?, ?, ?, ?)', [title, slug, type, content]);
    res.redirect('/admin/updates');
};

exports.deleteUpdate = async (req, res) => {
    const { id } = req.body;
    await db.query('DELETE FROM updates WHERE id = ?', [id]);
    res.redirect('/admin/updates');
};

exports.promos = async (req, res) => {
    try {
        const promos = await PromoModel.getAllPromos();
        res.render('admin/promos', { 
            layout: 'layouts/admin_layout', 
            title: 'Kelola Voucher', 
            promos: promos, 
            path: 'promos', 
            user: req.session.user 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

exports.addPromo = async (req, res) => {
    try {
        const { code, discount_percent, max_discount, quota, status } = req.body;
        await PromoModel.createPromo({ code, discount_percent, max_discount, quota, status });
        res.redirect('/admin/promos');
    } catch (err) {
        console.error("Add Promo Error:", err);
        res.redirect('/admin/promos');
    }
};

exports.deletePromo = async (req, res) => {
    try {
        const { id } = req.body;
        await PromoModel.deletePromo(id);
        res.redirect('/admin/promos');
    } catch (err) {
        console.error("Delete Promo Error:", err);
        res.redirect('/admin/promos');
    }
};

exports.updatePromoStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        await PromoModel.updateStatus(id, status);
        res.redirect('/admin/promos');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/promos');
    }
};


// ==========================================
// 🛡️ GOOGLE-GRADE SECURITY COMMAND CENTER
// ==========================================
exports.securityCenter = async (req, res) => {
    try {
        let logs = [];
        if (fs.existsSync(logFilePath)) {
            const raw = fs.readFileSync(logFilePath, 'utf8');
            logs = raw.trim().split('\n').filter(Boolean).slice(-60).reverse();
        }

        const jailedIps = ipJailManager.getAllJailed();
        const lockedAccounts = accountLockoutManager.getAllLocked();

        res.render('admin/security', {
            layout: 'layouts/admin_layout',
            title: 'Google-Grade Security Center',
            path: 'security',
            user: req.session.user,
            logs,
            jailedIps,
            lockedAccounts
        });
    } catch (err) {
        console.error("Security Center Error:", err);
        res.status(500).send("Security Center Error");
    }
};

exports.unjailIp = (req, res) => {
    const { ip } = req.body;
    if (ip) {
        ipJailManager.unjail(ip);
        req.flash('success_msg', `IP ${ip} berhasil dibebaskan dari Karantina IP Jail.`);
    }
    res.redirect('/admin/security');
};

exports.unlockAccount = (req, res) => {
    const { identifier } = req.body;
    if (identifier) {
        accountLockoutManager.unlock(identifier);
        req.flash('success_msg', `Akun ${identifier} berhasil dibuka kuncinya.`);
    }
    res.redirect('/admin/security');
};
