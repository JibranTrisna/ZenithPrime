const { coreApi } = require('../config/midtrans');
const TransactionModel = require('../models/transactionModel');
const PromoModel = require('../models/promoModel');
const db = require('../config/database');

exports.midtransNotification = async (req, res) => {
    try {
        const statusResponse = await coreApi.transaction.notification(req.body);

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const paymentType = statusResponse.payment_type || null;

        console.log(`🔔 Midtrans Notification: Order ID: ${orderId}, Status: ${transactionStatus}, Fraud: ${fraudStatus}`);

        // Pemetaan status Midtrans → enum database ('pending','success','failed','expired')
        let internalStatus = 'pending';

        if (transactionStatus === 'capture') {
            // 'challenge' = butuh review manual fraud → tetap pending
            internalStatus = fraudStatus === 'accept' ? 'success' : 'pending';
        } else if (transactionStatus === 'settlement') {
            internalStatus = 'success';
        } else if (transactionStatus === 'expire') {
            internalStatus = 'expired';
        } else if (['cancel', 'deny', 'failure'].includes(transactionStatus)) {
            internalStatus = 'failed';
        }

        await TransactionModel.updateStatus(orderId, internalStatus, paymentType);
        console.log(`✅ Order ${orderId} updated to: ${internalStatus} (Payment: ${paymentType || 'N/A'})`);

        res.status(200).send('OK');

    } catch (error) {
        console.error("❌ Midtrans Notification Error:", error);
        res.status(500).send("Error");
    }
};

const midtransSyncService = require('../services/midtransSyncService');

exports.syncTransaction = async (req, res) => {
    try {
        const orderId = req.params.orderId || req.body.order_id;
        if (!orderId) {
            return res.status(400).json({ success: false, message: 'Order ID wajib diisi' });
        }

        const result = await midtransSyncService.syncTransaction(orderId);
        return res.json(result);
    } catch (error) {
        console.error("❌ Sync API Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.checkPromo = async (req, res) => {
    try {
        const { code, amount } = req.body;

        if (!code || !amount) {
            return res.json({ valid: false, message: 'Data tidak lengkap.' });
        }

        const promo = await PromoModel.findActiveByCode(code.trim().toUpperCase());

        if (!promo) {
            return res.json({ valid: false, message: 'Kode voucher tidak ditemukan atau tidak aktif.' });
        }

        if (promo.quota <= 0) {
            return res.json({ valid: false, message: 'Kuota voucher ini sudah habis.' });
        }

        let discountAmount = Math.floor(amount * (promo.discount_percent / 100));

        if (discountAmount > promo.max_discount) {
            discountAmount = Number(promo.max_discount);
        }

        const finalPrice = amount - discountAmount;

        return res.json({
            valid: true,
            discount: discountAmount,
            newPrice: finalPrice,
            message: `Kode dipakai! Hemat Rp ${discountAmount.toLocaleString('id-ID')}`
        });

    } catch (error) {
        console.error("❌ Check Promo Error:", error);
        return res.status(500).json({ valid: false, message: 'Terjadi kesalahan server.' });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'Harus login terlebih dahulu.' });
        }
        const roomId = `user_${req.session.user.id}`;
        const [chats] = await db.query(
            "SELECT id, sender_id, room_id, message, is_staff_reply, created_at FROM chat_messages WHERE room_id = ? AND created_at >= NOW() - INTERVAL 24 HOUR ORDER BY created_at ASC",
            [roomId]
        );
        return res.json({ success: true, chats });
    } catch (err) {
        console.error("❌ User Chat History Error:", err);
        return res.status(500).json({ error: 'Gagal memuat riwayat chat.' });
    }
};