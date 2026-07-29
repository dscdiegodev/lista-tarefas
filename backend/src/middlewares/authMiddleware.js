const jwt = require('jsonwebtoken');

function verificarAutenticacao(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            sucesso: false,
            erro: 'Token de autenticação não fornecido.'
        });
    }

    const partesToken = authHeader.split(' ');

    if (partesToken.length !== 2) {
        return res.status(401).json({
            sucesso: false,
            erro: 'Erro no formato do token.'
        });
    }

    const [esquema, token] = partesToken;

    if (!/^Bearer$/i.test(esquema)) {
        return res.status(401).json({
            sucesso: false,
            erro: 'Token mal formatado.'
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