const express = require('express');
const router = express.Router();
const jokiController = require('../controllers/jokiController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { orderLimiter } = require('../middlewares/securityMiddleware');

// Katalog & Hub Layanan Joki
router.get('/', jokiController.index);

// Kalkulator & Formulir Pemesanan Joki per Game
router.get('/game/:slug', jokiController.orderPage);
router.get('/:slug', jokiController.orderPage);

// Pemrosesan Pemesanan & Pembayaran Midtrans Snap
router.post('/order', isAuthenticated, orderLimiter, jokiController.createOrder);
router.get('/checkout/:orderId', isAuthenticated, jokiController.showCheckout);
router.all('/sync/:orderId', jokiController.syncOrder);

// Live Progress Tracker Joki
router.get('/status/:orderId', isAuthenticated, jokiController.orderStatus);

module.exports = router;
