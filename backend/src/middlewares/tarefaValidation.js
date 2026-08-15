function validarTarefa(req, res, next) {
    const { titulo, prazo } = req.body;

    if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3 || titulo.trim().length > 255) {
        return res.status(400).json({
            sucesso: false,
            erro: 'O título deve ter entre 3 e 255 caracteres.'
        });
    }

    const dataPrazo = new Date(prazo);
    if (!prazo || isNaN(dataPrazo.getTime())) {
        return res.status(400).json({
            sucesso: false,
            erro: 'O campo "prazo" é obrigatório e deve ser uma data válida.'
        });
    }

    req.body.titulo = titulo.trim();

    next();
}

module.exports = { validarTarefa };