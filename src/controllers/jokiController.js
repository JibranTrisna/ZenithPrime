const snap = require('../config/midtrans');
const JokiModel = require('../models/jokiModel');
const midtransSyncService = require('../services/midtransSyncService');

/**
 * Controller Joki Game Service
 */

// ==========================================
// 🎮 USER FACING CONTROLLERS
// ==========================================

exports.index = async (req, res) => {
    try {
        const games = await JokiModel.getJokiGames();
        const stats = await JokiModel.getJokiStats();

        res.render('joki/index', {
            title: 'Jasa Joki Game Terpercaya #1 - ZenithPrime',
            layout: 'layouts/main',
            active: 'joki',
            games,
            stats,
            user: req.session.user
        });
    } catch (error) {
        console.error('Joki Index Error:', error);
        res.status(500).render('404', { title: 'Terjadi Kesalahan', layout: 'layouts/main' });
    }
};

exports.orderPage = async (req, res) => {
    try {
        const { slug } = req.params;

        // Custom general request support
        if (slug === 'custom' || slug === 'custom-request') {
            const allGames = await JokiModel.getJokiGames();
            return res.render('joki/detail', {
                title: 'Formulir Request Joki Custom - ZenithPrime',
                layout: 'layouts/main',
                active: 'joki',
                game: {
                    id: 0,
                    name: 'Custom Game Request',
                    slug: 'custom',
                    thumbnail: 'ZenithPrimeLogoTransparant.png',
                    category: 'All Games'
                },
                services: [],
                categories: {},
                allGames: allGames,
                isCustomGame: true,
                user: req.session.user
            });
        }

        const game = await JokiModel.getGameBySlug(slug);
        if (!game) {
            req.flash('error_msg', 'Game joki tidak ditemukan.');
            return res.redirect('/joki');
        }

        const services = await JokiModel.getServicesByGameSlug(slug);

        // Group services by category if any
        const categories = {};
        if (services && services.length > 0) {
            services.forEach(srv => {
                if (!categories[srv.category]) {
                    categories[srv.category] = [];
                }
                categories[srv.category].push(srv);
            });
        }

        res.render('joki/detail', {
            title: `Request Joki ${game.name} - Rank & Winrate Sesuai Keinginan | ZenithPrime`,
            layout: 'layouts/main',
            active: 'joki',
            game,
            services: services || [],
            categories,
            isCustomGame: false,
            user: req.session.user
        });
    } catch (error) {
        console.error('Joki Detail Error:', error);
        res.status(500).render('404', { title: 'Terjadi Kesalahan', layout: 'layouts/main' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) {
            req.flash('error_msg', 'Silakan login terlebih dahulu untuk mengajukan request joki.');
            return res.redirect('/auth/login');
        }

        const {
            game_slug,
            service_id,
            request_type = 'Push Rank',
            current_rank,
            target_rank,
            play_mode = 'solo',
            custom_title,
            quantity,
            total_amount,
            login_via = 'Official',
            account_id,
            account_password,
            nickname,
            whatsapp,
            request_hero,
            notes
        } = req.body;

        if (!whatsapp) {
            req.flash('error_msg', 'Nomor WhatsApp wajib diisi untuk koordinasi request joki.');
            return res.redirect(req.get('Referrer') || '/joki');
        }

        // Jika mode Solo Joki Akun, wajib ID dan Password
        if (play_mode === 'solo' && (!account_id || !account_password)) {
            req.flash('error_msg', 'Untuk mode Joki Akun, User ID dan Password akun wajib diisi.');
            return res.redirect(req.get('Referrer') || '/joki');
        }

        let finalServiceId = service_id ? parseInt(service_id) : 0;
        let finalServiceName = custom_title || 'Request Joki';
        let finalQty = Math.max(1, parseInt(quantity) || 1);
        let calculatedAmount = parseInt(total_amount) || 0;

        // Jika user memilih paket dasar
        if (finalServiceId > 0) {
            const service = await JokiModel.getServiceById(finalServiceId);
            if (service && service.is_active) {
                finalServiceName = service.name;
                const minOrder = service.min_order || 1;
                finalQty = Math.max(minOrder, finalQty);
                if (!calculatedAmount || calculatedAmount <= 0) {
                    calculatedAmount = Math.round(Number(service.price) * finalQty);
                }
            }
        }

        // Format nama layanan berdasarkan request type
        if (request_type === 'Push Rank' && current_rank && target_rank) {
            finalServiceName = `Push Rank: ${current_rank} ➔ ${target_rank}`;
        } else if (request_type === 'GB Winrate') {
            finalServiceName = `GB Winrate Hero ${request_hero || 'Pilihan'} (${finalQty} Match)`;
        } else if (request_type === 'Joki Mabar Duo') {
            finalServiceName = `Joki Mabar Duo Party (${finalQty} Match/Bintang)`;
        } else if (custom_title) {
            finalServiceName = custom_title;
        }

        if (!calculatedAmount || calculatedAmount < 1000) {
            req.flash('error_msg', 'Total biaya request joki tidak valid (minimal Rp 1.000).');
            return res.redirect(req.get('Referrer') || '/joki');
        }

        const game = await JokiModel.getGameBySlug(game_slug || 'mobile-legends');
        const gameName = game ? game.name : 'Game';
        const finalGameSlug = game ? game.slug : (game_slug || 'mobile-legends');

        const orderId = `JK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const serviceDisplayName = `[${request_type}] ${finalServiceName}`.substring(0, 48);

        // Midtrans Snap Parameter
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: calculatedAmount
            },
            item_details: [{
                id: (finalServiceId || 1).toString(),
                price: calculatedAmount,
                quantity: 1,
                name: `Joki: ${gameName} - ${serviceDisplayName}`.substring(0, 50)
            }],
            customer_details: {
                first_name: user.name,
                email: user.email,
                phone: whatsapp
            }
        };

        const snapTransaction = await snap.createTransaction(parameter);

        await JokiModel.createOrder({
            order_id: orderId,
            user_id: user.id,
            service_id: finalServiceId,
            game_slug: finalGameSlug,
            service_name: finalServiceName,
            request_type,
            current_rank: current_rank || null,
            target_rank: target_rank || null,
            play_mode,
            quantity: finalQty,
            total_amount: calculatedAmount,
            login_via: login_via || 'Official',
            account_id: account_id || (play_mode === 'party' ? (nickname || 'Party Mode') : '-'),
            account_password: play_mode === 'party' ? 'NOT_REQUIRED_PARTY_MODE' : account_password,
            nickname: nickname || null,
            whatsapp,
            request_hero: request_hero || null,
            notes: notes || null,
            snap_token: snapTransaction.token,
            payment_status: 'pending',
            order_status: 'unpaid'
        });

        res.redirect(`/joki/checkout/${orderId}`);

    } catch (error) {
        console.error('Create Joki Order Error:', error);
        req.flash('error_msg', 'Gagal memproses request joki. Silakan coba beberapa saat lagi.');
        res.redirect(req.get('Referrer') || '/joki');
    }
};

exports.showCheckout = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.session.user.id;

        // Auto-check with Midtrans Sandbox API
        await midtransSyncService.syncTransaction(orderId);

        const order = await JokiModel.getOrderByOrderId(orderId, userId);
        if (!order) {
            return res.status(404).render('404', { title: 'Pesanan Tidak Ditemukan', layout: 'layouts/main' });
        }

        // If already paid, jump straight to live status tracking
        if (order.payment_status === 'success') {
            return res.redirect(`/joki/status/${orderId}`);
        }

        res.render('joki/checkout', {
            title: `Checkout Joki #${order.order_id} - ZenithPrime`,
            layout: 'layouts/main',
            active: 'joki',
            order,
            clientKey: process.env.MIDTRANS_CLIENT_KEY,
            user: req.session.user
        });

    } catch (error) {
        console.error('Joki Checkout Error:', error);
        res.status(500).render('404', { title: 'Terjadi Kesalahan', layout: 'layouts/main' });
    }
};

exports.syncOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const syncResult = await midtransSyncService.syncTransaction(orderId);
        const order = await JokiModel.getOrderByOrderId(orderId);

        return res.json({
            ...syncResult,
            order_status: order ? order.order_status : null,
            payment_status: order ? order.payment_status : null
        });
    } catch (error) {
        console.error('Joki Sync API Error:', error);
        return res.status(500).json({ success: false, message: 'Gagal melakukan sinkronisasi status.' });
    }
};

exports.orderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const user = req.session.user;

        // Auto sync with Midtrans first
        await midtransSyncService.syncTransaction(orderId);

        const order = await JokiModel.getOrderByOrderId(orderId);
        if (!order) {
            return res.status(404).render('404', { title: 'Pesanan Joki Tidak Ditemukan', layout: 'layouts/main' });
        }

        // Security check: only order owner or staff/admin can view full status
        const isOwner = user && user.id === order.user_id;
        const isStaff = user && (user.role === 'staff' || user.role === 'admin');

        if (!isOwner && !isStaff) {
            req.flash('error_msg', 'Anda tidak memiliki otorisasi untuk melihat detail pesanan ini.');
            return res.redirect('/joki');
        }

        res.render('joki/status', {
            title: `Progress Joki #${order.order_id} - ZenithPrime`,
            layout: 'layouts/main',
            active: 'joki',
            order,
            isOwner,
            isStaff,
            user: req.session.user
        });

    } catch (error) {
        console.error('Joki Order Status Error:', error);
        res.status(500).render('404', { title: 'Terjadi Kesalahan', layout: 'layouts/main' });
    }
};

// ==========================================
// 💼 STAFF & WORKER HANDLERS
// ==========================================

exports.staffWorkspace = async (req, res) => {
    try {
        const workerId = req.session.user.id;
        const queuedOrders = await JokiModel.getQueuedOrders();
        const activeOrders = await JokiModel.getStaffActiveOrders(workerId);
        const completedOrders = await JokiModel.getStaffCompletedOrders(workerId, 15);

        res.render('staff/joki', {
            title: 'Workspace Joki - Staff ZenithPrime',
            layout: 'layouts/main',
            active: 'staff_joki',
            queuedOrders,
            activeOrders,
            completedOrders,
            user: req.session.user
        });
    } catch (error) {
        console.error('Staff Joki Workspace Error:', error);
        res.status(500).send('Server Error di Workspace Joki');
    }
};

exports.staffClaimOrder = async (req, res) => {
    try {
        const { order_id } = req.body;
        const workerId = req.session.user.id;

        if (!order_id) {
            req.flash('error_msg', 'Order ID tidak valid.');
            return res.redirect('/staff/joki');
        }

        const claimed = await JokiModel.claimOrder(order_id, workerId);
        if (claimed) {
            req.flash('success_msg', `Berhasil mengambil pesanan #${order_id}. Silakan periksa detail akun dan mulai proses joki.`);
        } else {
            req.flash('error_msg', 'Pesanan ini sudah diambil oleh worker lain atau status belum dibayar.');
        }

        res.redirect('/staff/joki');
    } catch (error) {
        console.error('Staff Claim Order Error:', error);
        req.flash('error_msg', 'Gagal mengambil pesanan joki.');
        res.redirect('/staff/joki');
    }
};

exports.staffCompleteOrder = async (req, res) => {
    try {
        const { order_id, worker_notes } = req.body;
        const workerId = req.session.user.id;
        const isAdmin = req.session.user.role === 'admin';

        if (!order_id) {
            req.flash('error_msg', 'Order ID tidak valid.');
            return res.redirect('/staff/joki');
        }

        const proofImage = req.file ? req.file.filename : null;
        if (!proofImage) {
            req.flash('error_msg', 'Wajib menyertakan bukti screenshot rank/bintang yang telah tercapai!');
            return res.redirect('/staff/joki');
        }

        const updated = await JokiModel.completeOrder(order_id, workerId, proofImage, worker_notes, isAdmin);
        if (updated) {
            req.flash('success_msg', `Pesanan #${order_id} berhasil diselesaikan! Bukti screenshot telah tersimpan.`);
        } else {
            req.flash('error_msg', 'Gagal memperbarui status order.');
        }

        res.redirect('/staff/joki');
    } catch (error) {
        console.error('Staff Complete Order Error:', error);
        req.flash('error_msg', 'Terjadi kesalahan saat menyelesaikan pesanan joki.');
        res.redirect('/staff/joki');
    }
};

// ==========================================
// ⚡ ADMIN JOKI MANAGEMENT
// ==========================================

exports.adminIndex = async (req, res) => {
    try {
        const stats = await JokiModel.getJokiStats();
        const orders = await JokiModel.getAllOrdersAdmin();
        const services = await JokiModel.getAllServicesAdmin();
        const games = await JokiModel.getJokiGames();

        res.render('admin/joki', {
            title: 'Kelola Layanan & Transaksi Joki',
            layout: 'layouts/admin_layout',
            path: 'joki',
            stats,
            orders,
            services,
            games,
            user: req.session.user
        });
    } catch (error) {
        console.error('Admin Joki Error:', error);
        res.status(500).send('Server Error Admin Joki');
    }
};

exports.adminCreateService = async (req, res) => {
    try {
        const { game_slug, category, name, price, base_price, min_order, estimate_time, description } = req.body;

        if (!game_slug || !category || !name || !price) {
            req.flash('error_msg', 'Harap isi semua kolom wajib layanan joki.');
            return res.redirect('/admin/joki');
        }

        await JokiModel.createService({
            game_slug,
            category,
            name,
            price: Number(price),
            base_price: Number(base_price) || Number(price) * 0.7,
            min_order: Number(min_order) || 1,
            estimate_time: estimate_time || '1-24 Jam',
            description,
            is_active: 1
        });

        req.flash('success_msg', `Layanan joki "${name}" berhasil ditambahkan.`);
        res.redirect('/admin/joki');
    } catch (error) {
        console.error('Admin Create Service Error:', error);
        req.flash('error_msg', 'Gagal menambahkan layanan joki.');
        res.redirect('/admin/joki');
    }
};

exports.adminUpdateService = async (req, res) => {
    try {
        const { id, game_slug, category, name, price, base_price, min_order, estimate_time, description, is_active } = req.body;

        await JokiModel.updateService(id, {
            game_slug,
            category,
            name,
            price: Number(price),
            base_price: Number(base_price),
            min_order: Number(min_order) || 1,
            estimate_time,
            description,
            is_active: is_active === '1' || is_active === 1 ? 1 : 0
        });

        req.flash('success_msg', `Layanan #${id} berhasil diperbarui.`);
        res.redirect('/admin/joki');
    } catch (error) {
        console.error('Admin Update Service Error:', error);
        req.flash('error_msg', 'Gagal memperbarui layanan joki.');
        res.redirect('/admin/joki');
    }
};

exports.adminDeleteService = async (req, res) => {
    try {
        const { id } = req.params;
        await JokiModel.deleteService(id);
        req.flash('success_msg', `Layanan joki #${id} berhasil dihapus.`);
        res.redirect('/admin/joki');
    } catch (error) {
        console.error('Admin Delete Service Error:', error);
        req.flash('error_msg', 'Gagal menghapus layanan joki.');
        res.redirect('/admin/joki');
    }
};
