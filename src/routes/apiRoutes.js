const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { apiLimiter } = require('../middlewares/securityMiddleware');

router.post('/midtrans/notification', apiController.midtransNotification);
router.all('/transaction/sync/:orderId', apiController.syncTransaction);
router.post('/check-promo', apiLimiter, apiController.checkPromo);
router.get('/chat-history', apiController.getChatHistory);

module.exports = router;