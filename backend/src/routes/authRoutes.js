const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/registrar', authController.registrar);
router.post('/entrar', authController.entrar);

module.exports = router;