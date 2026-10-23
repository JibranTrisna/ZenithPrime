const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

router.get('/', newsController.index);       // Halaman List Berita
router.get('/:slug', newsController.detail); // Halaman Baca Berita

module.exports = router;