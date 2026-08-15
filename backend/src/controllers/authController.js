const authService = require('../services/authService');

async function registrar(req, res) {
    try {
        const { nome, email, senha } = req.body;

        const novoUsuario = await authService.registrarUsuario(nome, email, senha);

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Usuário cadastrado com sucesso!',
            dados: novoUsuario
        });

    } catch (error) {
        console.error("ERRO DETALHADO:", error);
        return res.status(500).json({
            sucesso: false,
            erro: "Erro ao registrar usuário no banco de dados!"
        });
    }
}

async function entrar(req, res) {
    try {
        const { email, senha } = req.body;
        
        const { usuario, token } = await authService.autenticarUsuario(email, senha);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            sucesso: true,
            menssagem: 'Login realizado com sucesso!',
            usuario
        });
    } catch (error) {
        return res.status(400).json({
            erro: error.message
        });
    }
}

module.exports = {
    registrar,
    entrar
};