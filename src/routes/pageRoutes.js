const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/contact', pageController.contact);
router.get('/terms', pageController.terms);
router.get('/privacy', pageController.privacy);
router.get('/faq', pageController.faq);

module.exports = router;