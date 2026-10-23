const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const transactionController = require('../controllers/transactionController');
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middlewares/authMiddleware');
const { orderLimiter } = require('../middlewares/securityMiddleware');

// Katalog & Halaman Game
router.get('/', productController.getAllGames);
router.get('/games', productController.getAllGamesCatalog);
router.get('/topup/:slug', productController.getGameDetail);

// Transaksi & Riwayat (Memerlukan Login & Proteksi Spam Order)
router.get('/history', isAuthenticated, transactionController.history);
router.post('/transaction/process', isAuthenticated, orderLimiter, transactionController.createTransaction);
router.get('/transaction/checkout/:orderId', isAuthenticated, transactionController.showCheckout);
router.all('/transaction/sync/:orderId', isAuthenticated, transactionController.syncTransaction);

// Review Produk
router.post('/reviews/submit', isAuthenticated, reviewController.submitReview);

module.exports = router;