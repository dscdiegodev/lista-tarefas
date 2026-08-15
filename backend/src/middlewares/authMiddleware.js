const jwt = require('jsonwebtoken');

function verificarAutenticacao(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            sucesso: false,
            erro: 'Acesso negado. Token de autenticação não fornecido nos cookies.'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                sucesso: false,
                erro: 'Token inválido ou expirado.'
            });
        }

        req.usuarioId = decoded.id;
        req.usuarioEmail = decoded.email;

        return next();
    });
}

module.exports = verificarAutenticacao;