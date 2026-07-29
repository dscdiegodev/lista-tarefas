const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const verificarAutenticacao = require('../middlewares/authMiddleware');

router.use(verificarAutenticacao);

router.post('/', categoriaController.criar);
router.get('/', categoriaController.listar);
router.put('/:id', categoriaController.atualizar);
router.delete('/:id', categoriaController.deletar);

module.exports = router;