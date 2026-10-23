const snap = require('../config/midtrans');
const TransactionModel = require('../models/transactionModel');
const ProductModel = require('../models/productModel');
const PromoModel = require('../models/promoModel');
const midtransSyncService = require('../services/midtransSyncService');

const JokiModel = require('../models/jokiModel');

exports.history = async (req, res) => {
    try {
        const userId = req.session.user.id;

        // Auto-sync any recent pending orders with Midtrans Sandbox API
        await midtransSyncService.syncPendingTransactions(userId);

        const orders = await TransactionModel.getUserTransactions(userId);
        const jokiOrders = await JokiModel.getUserOrders(userId);
        
        res.render('history/index', {
            title: 'Riwayat Transaksi & Joki',
            layout: 'layouts/main',
            active: 'history',
            orders: orders,
            jokiOrders: jokiOrders,
            user: req.session.user
        });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).send("Server Error");
    }
};

exports.createTransaction = async (req, res) => {
    try {
        let { product_id, target_id, zone_id, promo_code } = req.body;
        const user = req.session.user;

        if (!user) {
            req.flash('error_msg', 'Silakan login terlebih dahulu.');
            return res.redirect('/auth/login');
        }

        const product = await ProductModel.getProductById(product_id);
        if (!product) return res.redirect('/');

        let basePrice = Math.round(product.price);
        let finalAmount = basePrice;
        let discountAmount = 0;
        let appliedPromo = null;

        if (promo_code) {
            promo_code = promo_code.trim();
            const promo = await PromoModel.findActiveByCode(promo_code);
            if (promo && promo.quota > 0) {
                discountAmount = Math.floor(basePrice * (promo.discount_percent / 100));
                if (discountAmount > promo.max_discount) discountAmount = Number(promo.max_discount);
                finalAmount = basePrice - discountAmount;
                appliedPromo = promo.code;
            }
        }

        const orderId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const itemName = `${product.game_name} - ${product.name}`.substring(0, 50);

        const parameter = {
            transaction_details: { order_id: orderId, gross_amount: finalAmount },
            item_details: [{ id: product.id.toString(), price: finalAmount, quantity: 1, name: itemName }],
            customer_details: { first_name: user.name, email: user.email, phone: user.phone || '08123456789' }
        };

        const transaction = await snap.createTransaction(parameter);

        await TransactionModel.createTransaction({
            order_id: orderId, user_id: user.id, product_id: product.id, 
            target_id: target_id, zone_id: zone_id || null, 
            amount: finalAmount, status: 'pending', snap_token: transaction.token,
            promo_code: appliedPromo, discount_amount: discountAmount
        });

        res.redirect(`/transaction/checkout/${orderId}`);

    } catch (error) {
        console.error("Transaction Error:", error);
        req.flash('error_msg', 'Gagal membuat transaksi.');
        res.redirect('/');
    }
};

exports.showCheckout = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.session.user.id;

        // Auto-check if transaction is already paid in Midtrans
        await midtransSyncService.syncTransaction(orderId);

        const transaction = await TransactionModel.getTransactionByOrderId(orderId, userId);

        if (!transaction) return res.status(404).render('404', { layout: 'layouts/main', title: '404' });

        res.render('transaction/checkout', {
            title: 'Selesaikan Pembayaran',
            layout: 'layouts/main',
            active: 'transaction',
            transaction: transaction,
            midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
            user: req.session.user
        });
    } catch (error) {
        console.error("Checkout Error:", error);
        res.status(500).send("Server Error");
    }
};

exports.syncTransaction = async (req, res) => {
    try {
        const { orderId } = req.params;
        const result = await midtransSyncService.syncTransaction(orderId);
        res.json(result);
    } catch (error) {
        console.error("Sync Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};