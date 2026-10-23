const { coreApi } = require('../config/midtrans');
const TransactionModel = require('../models/transactionModel');
const PromoModel = require('../models/promoModel');
const db = require('../config/database');

/**
 * Service to sync transaction status directly with Midtrans API without requiring Webhooks or Ngrok.
 * Supports both regular game top-up orders (TRX-...) and Joki orders (JK-...).
 * Uses outbound HTTPS request from localhost to Midtrans Sandbox GET /v2/{order_id}/status.
 */

/**
 * Synchronize a single transaction or joki order by order_id
 * @param {string} orderId 
 * @returns {Promise<{success: boolean, orderId: string, status: string, paymentType: string|null, message: string}>}
 */
async function syncTransaction(orderId) {
    if (!orderId) {
        return { success: false, message: 'Order ID is required' };
    }

    try {
        // Query Midtrans API directly (Outbound HTTPS - Works seamlessly on localhost without Ngrok)
        const statusResponse = await coreApi.transaction.status(orderId);

        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;
        const paymentType = statusResponse.payment_type || null;

        // Map Midtrans status to internal database enum ('pending', 'success', 'failed', 'expired')
        let internalStatus = 'pending';

        if (transactionStatus === 'capture') {
            internalStatus = fraudStatus === 'accept' ? 'success' : 'pending';
        } else if (transactionStatus === 'settlement') {
            internalStatus = 'success';
        } else if (transactionStatus === 'expire') {
            internalStatus = 'expired';
        } else if (['cancel', 'deny', 'failure'].includes(transactionStatus)) {
            internalStatus = 'failed';
        } else if (transactionStatus === 'pending') {
            internalStatus = 'pending';
        }

        // ==========================================
        // 🎮 JOKI ORDER HANDLING (Prefix: JK-)
        // ==========================================
        if (orderId.startsWith('JK-')) {
            const [jokiRows] = await db.query('SELECT payment_status, order_status FROM joki_orders WHERE order_id = ?', [orderId]);
            if (jokiRows.length > 0) {
                const JokiModel = require('../models/jokiModel');
                await JokiModel.updatePaymentStatus(orderId, internalStatus, paymentType);
                console.log(`[AutoSync:Joki] Order ${orderId}: Midtrans(${transactionStatus}) -> DB(${internalStatus})`);
            }

            return {
                success: true,
                orderId,
                midtransStatus: transactionStatus,
                status: internalStatus,
                paymentType,
                message: `Status joki berhasil diperbarui: ${internalStatus}`
            };
        }

        // ==========================================
        // 💎 TOP-UP ORDER HANDLING (Prefix: TRX-)
        // ==========================================
        const [rows] = await db.query('SELECT status, promo_code FROM transactions WHERE order_id = ?', [orderId]);
        if (rows.length > 0) {
            const prevStatus = rows[0].status;

            // Update database status
            await TransactionModel.updateStatus(orderId, internalStatus, paymentType);

            // If newly succeeded and had promo code, decrement promo quota if applicable
            if (internalStatus === 'success' && prevStatus !== 'success' && rows[0].promo_code) {
                try {
                    await db.query(
                        'UPDATE promo_codes SET quota = GREATEST(quota - 1, 0) WHERE code = ?',
                        [rows[0].promo_code]
                    );
                } catch (promoErr) {
                    console.warn(`[AutoSync] Could not update promo quota for ${rows[0].promo_code}:`, promoErr.message);
                }
            }

            console.log(`[AutoSync] Order ${orderId}: Midtrans(${transactionStatus}) -> DB(${internalStatus})`);
        }

        return {
            success: true,
            orderId,
            midtransStatus: transactionStatus,
            status: internalStatus,
            paymentType,
            message: `Status berhasil diperbarui: ${internalStatus}`
        };

    } catch (error) {
        // Check if Midtrans returned 404 (order not yet submitted or simulated on Midtrans)
        const is404 = (error.ApiResponse && (error.ApiResponse.status_code === '404' || error.httpStatusCode === '404')) ||
                      (error.message && error.message.includes('404'));

        if (is404) {
            return {
                success: true,
                orderId,
                status: 'pending',
                paymentType: null,
                message: 'Transaksi belum dibayar di Midtrans Sandbox.'
            };
        }

        console.error(`[AutoSync] Error checking order ${orderId}:`, error.message || error);
        return {
            success: false,
            orderId,
            message: error.message || 'Gagal terhubung ke Midtrans API'
        };
    }
}

/**
 * Synchronize recent pending transactions & joki orders for a user
 * @param {number|string} userId 
 */
async function syncPendingTransactions(userId) {
    if (!userId) return;

    try {
        // 1. Get recent pending top-up orders within last 48 hours
        const [pendingOrders] = await db.query(
            "SELECT order_id FROM transactions WHERE user_id = ? AND status = 'pending' AND created_at >= NOW() - INTERVAL 2 DAY ORDER BY created_at DESC LIMIT 5",
            [userId]
        );

        // 2. Get recent pending joki orders within last 48 hours
        const [pendingJokiOrders] = await db.query(
            "SELECT order_id FROM joki_orders WHERE user_id = ? AND payment_status = 'pending' AND created_at >= NOW() - INTERVAL 2 DAY ORDER BY created_at DESC LIMIT 5",
            [userId]
        );

        const allPending = [
            ...pendingOrders.map(o => o.order_id),
            ...pendingJokiOrders.map(o => o.order_id)
        ];

        if (allPending.length > 0) {
            await Promise.allSettled(allPending.map(id => syncTransaction(id)));
        }
    } catch (err) {
        console.error('[AutoSync] Error syncing user pending orders:', err.message);
    }
}

module.exports = {
    syncTransaction,
    syncPendingTransactions
};
