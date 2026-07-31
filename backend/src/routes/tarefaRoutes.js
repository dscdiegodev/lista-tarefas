const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefaController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

/**
 * @swagger
 * /api/tarefas:
 *   get:
 *     summary: Lista todas as tarefas do usuário com filtros e paginação
 *     tags: [Tarefas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por status
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
 */
router.get('/', tarefaController.listar);


/**
 * @swagger
 * /api/tarefas:
 *   post:
 *     summary: Cria uma nova tarefa
 *     tags: [Tarefas]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Titulo da tarefa
 *               descricao:
 *                 type: string
 *                 description: Descricao da tarefa
 *               status:
 *                 type: string
 *                 description: Status da tarefa
 *               prioridade:
 *                 type: string
 *                 description: Prioridade
 *               id_categoria:
 *                 type: integer
 *                 description: ID da categoria
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autorizado
 */
router.post('/', tarefaController.criar);

/**
 * @swagger
 * /api/tarefas/{id}:
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     tags: [Tarefas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 description: Novo titulo da tarefa
 *               descricao:
 *                 type: string
 *                 description: Nova descricao
 *               status:
 *                 type: string
 *                 description: Novo status
 *               prioridade:
 *                 type: string
 *                 description: Nova prioridade
 *               id_categoria:
 *                 type: integer
 *                 description: Novo ID da categoria
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       400:
 *         description: Erro de validacao
 *       401:
 *         description: Nao autorizado
 *       404:
 *         description: Tarefa nao encontrada
 */
router.put('/:id', tarefaController.atualizar);

/**
 * @swagger
 * /api/tarefas/{id}:
 *   delete:
 *     summary: Remove uma tarefa pelo ID
 *     tags: [Tarefas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa a ser excluida
 *     responses:
 *       200:
 *         description: Tarefa removida com sucesso
 *       401:
 *         description: Nao autorizado
 *       404:
 *         description: Tarefa nao encontrada
 */
router.delete('/:id', tarefaController.deletar);

/**
 * @swagger
 * /api/tarefas/{id}/tags:
 *   post:
 *     summary: Adiciona uma tag a uma tarefa
 *     tags: [Tarefas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagId
 *             properties:
 *               tagId:
 *                 type: integer
 *                 description: ID da tag a ser associada
 *     responses:
 *       201:
 *         description: Tag associada com sucesso
 *       400:
 *         description: Erro na requisicao
 *       401:
 *         description: Nao autorizado
 *       404:
 *         description: Tarefa ou Tag nao encontrada
 */
router.post('/:id/tags', tarefaController.adicionarTag);

/**
 * @swagger
 * /api/tarefas/{id}/tags/{tagId}:
 *   delete:
 *     summary: Remove uma tag de uma tarefa
 *     tags: [Tarefas]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tarefa
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da tag a ser removida
 *     responses:
 *       200:
 *         description: Tag removida com sucesso
 *       401:
 *         description: Nao autorizado
 *       404:
 *         description: Associacao nao encontrada
 */
router.delete('/:id/tags/:tagId', tarefaController.removerTag);

module.exports = router;