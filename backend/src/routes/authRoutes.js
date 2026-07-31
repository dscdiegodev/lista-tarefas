const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/registrar:
 *   post:
 *     summary: Registra um novo usuário no sistema
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - email
 *               - senha
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome do usuário
 *               email:
 *                 type: string
 *                 description: E-mail do usuário
 *               senha:
 *                 type: string
 *                 description: Senha de acesso
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Erro de validação ou e-mail já cadastrado
 */
router.post('/registrar', authController.registrar);

/**
 * @swagger
 * /api/auth/entrar:
 *   post:
 *     summary: Realiza o login do usuário e retorna o token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - senha
 *             properties:
 *               email:
 *                 type: string
 *                 description: E-mail cadastrado
 *               senha:
 *                 type: string
 *                 description: Senha de acesso
 *     responses:
 *       200:
 *         description: Login realizado com sucesso, retorna o token Bearer
 *       401:
 *         description: Credenciais inválidas (e-mail ou senha incorretos)
 */
router.post('/entrar', authController.entrar);

module.exports = router;