const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const verificarAutenticacao = require('../middlewares/authMiddleware');

router.use(verificarAutenticacao);

/**
 * @swagger
 * /api/tags:
 *   post:
 *     summary: Cria uma nova tag
 *     tags: [Tags]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da tag
 *     responses:
 *       201:
 *         description: Tag criada com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autorizado
 */
router.post('/', tagController.criar);

/**
 * @swagger
 * /api/tags:
 *   get:
 *     summary: Lista todas as tags do usuário
 *     tags: [Tags]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sucesso
 *       401:
 *         description: Nao autorizado
 */
router.get('/', tagController.listar);

/**
 * @swagger
 * /api/tags/{id}:
 *   put:
 *     summary: Atualiza uma tag existente
 *     tags: [Tags]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tag a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Novo nome da tag
 *     responses:
 *       200:
 *         description: Tag atualizada com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autorizado
 *       404:
 *         description: Tag nao encontrada
 */
router.put('/:id', tagController.atualizar);

/**
 * @swagger
 * /api/tags/{id}:
 *   delete:
 *     summary: Remove uma tag pelo ID
 *     tags: [Tags]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tag a ser excluida
 *     responses:
 *       200:
 *         description: Tag removida com sucesso
 *       401:
 *         description: Nao autorizado
 *       404:
 *         description: Tag nao encontrada
 */
router.delete('/:id', tagController.deletar);

module.exports = router;