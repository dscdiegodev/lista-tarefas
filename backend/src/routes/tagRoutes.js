const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const verificarAutenticacao = require('../middlewares/authMiddleware');

router.use(verificarAutenticacao);

router.post('/', tagController.criar);
router.get('/', tagController.listar);
router.put('/:id', tagController.atualizar);
router.delete('/:id', tagController.deletar);

module.exports = router;