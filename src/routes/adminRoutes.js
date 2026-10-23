const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/authMiddleware');
const { uploadGameThumbnail } = require('../middlewares/uploadMiddleware');

// Proteksi akses hanya untuk Admin
router.use(isAdmin);

router.get('/', adminController.dashboard);
router.get('/api/stats', adminController.getDashboardStats);

// Kelola Games
router.get('/games', adminController.games);
router.post('/games/add', uploadGameThumbnail.single('thumbnail'), adminController.addGame);
router.post('/games/delete', adminController.deleteGame);
router.get('/games/:id', adminController.gameDetail);
router.post('/games/update', uploadGameThumbnail.single('thumbnail'), adminController.updateGame);

// Kelola Produk Game
router.post('/products/add', adminController.addProduct);
router.post('/products/edit', adminController.editProduct);
router.post('/products/delete', adminController.deleteProduct);

// Kelola Transaksi
router.get('/transactions', adminController.transactions);
router.post('/transactions/update', adminController.updateTransaction);

// Kelola Berita & Updates
router.get('/updates', adminController.updates);
router.post('/updates/add', adminController.addUpdate);
router.post('/updates/delete', adminController.deleteUpdate);

// Kelola Promo
router.get('/promos', adminController.promos);
router.post('/promos/add', adminController.addPromo);
router.post('/promos/delete', adminController.deletePromo);
router.post('/promos/status', adminController.updatePromoStatus);

// Kelola Layanan & Transaksi Joki
const jokiController = require('../controllers/jokiController');
router.get('/joki', jokiController.adminIndex);
router.post('/joki/services/create', jokiController.adminCreateService);
router.post('/joki/services/update', jokiController.adminUpdateService);
router.post('/joki/services/delete/:id', jokiController.adminDeleteService);

module.exports = router;