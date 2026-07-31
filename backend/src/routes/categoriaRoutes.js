const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const verificarAutenticacao = require('../middlewares/authMiddleware');

router.use(verificarAutenticacao);

/**
 * @swagger
 * /api/categorias:
 *   post:
 *     summary: Cria uma nova categoria
 *     tags: [Categorias]
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
 *                 description: Nome da categoria
 *     responses:
 *       201:
 *         description: Categoria criada com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autorizado
 */
router.post('/', categoriaController.criar);

/**
 * @swagger
 * /api/categorias:
 *   get:
 *     summary: Lista todas as categorias do usuário
 *     tags: [Categorias]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *         description: Numero da pagina
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *         description: Itens por pagina
 *     responses:
 *       200:
 *         description: Sucesso
 *       401:
 *         description: Nao autorizado
 */
router.get('/', categoriaController.listar);

/**
 * @swagger
 * /api/categorias/{id}:
 *   put:
 *     summary: Atualiza uma categoria existente
 *     tags: [Categorias]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Novo nome da categoria
 *     responses:
 *       200:
 *         description: Categoria atualizada com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autorizado
 *       404:
 *         description: Categoria nao encontrada
 */
router.put('/:id', categoriaController.atualizar);

/**
 * @swagger
 * /api/categorias/{id}:
 *   delete:
 *     summary: Remove uma categoria pelo ID
 *     tags: [Categorias]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da categoria a ser excluida
 *     responses:
 *       200:
 *         description: Categoria removida com sucesso
 *       401:
 *         description: Nao autorizado
 *       404:
 *         description: Categoria nao encontrada
 */
router.delete('/:id', categoriaController.deletar);

module.exports = router;