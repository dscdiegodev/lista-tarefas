const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefaController');
const verificarAutenticacao = require('../middlewares/authMiddleware');

router.use(verificarAutenticacao);

router.post('/:id/tags', tarefaController.adicionarTag);
router.post('/', tarefaController.criar);
router.get('/', tarefaController.listar);
router.put('/:id', tarefaController.atualizar);
router.delete('/:id', tarefaController.deletar);

module.exports = router;