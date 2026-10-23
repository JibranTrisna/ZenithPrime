const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const jokiController = require('../controllers/jokiController');
const { isStaff } = require('../middlewares/authMiddleware');
const { uploadJokiProof } = require('../middlewares/uploadMiddleware');

router.use(isStaff);
router.get('/', staffController.dashboard);
router.post('/process', staffController.processOrder);
router.get('/chat', staffController.chatDashboard);
router.get('/api/chat/:roomId', staffController.getChatHistory);
router.get('/api/chat/:roomId/user-info', staffController.getChatUserInfo);
router.post('/api/chat/:roomId/status', staffController.updateTicketStatus);

// Joki Game Worker Endpoints
router.get('/joki', jokiController.staffWorkspace);
router.post('/joki/claim', jokiController.staffClaimOrder);
router.post('/joki/complete', uploadJokiProof.single('proof_image'), jokiController.staffCompleteOrder);

module.exports = router;