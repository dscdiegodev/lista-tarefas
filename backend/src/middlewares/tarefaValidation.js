function validarTarefa(req, res, next) {
    const { titulo, prazo } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim() === '') {
        return res.status(400).json({
            sucesso: false,
            erro: 'O campo "título" é obrigatório e deve ser um texto válido.'
        });
    }

    if (!prazo) {
        return res.status(400).json({
            sucesso: false,
            erro: 'O campo "prazo" é obrigatório.'
        });
    }

    next();
}

module.exports = { validarTarefa };