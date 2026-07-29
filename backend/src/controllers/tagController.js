const tagService = require('../services/tagService');

async function criar(req, res) {
    try {
        const { nome } = req.body;
        const usuarioId = req.usuarioId;

        const novaTag = await tagService.criarTag(nome, usuarioId);

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Tag criada com sucesso!',
            dados: novaTag
        });
    } catch (error) {
        return res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
}

async function listar(req, res) {
    try {
        const usuarioId = req.usuarioId;
        const tags = await tagService.listarTagsPorUsuario(usuarioId);

        return res.status(200).json({
            sucesso: true,
            dados: tags
        });
    } catch (error) {
        return res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
}

module.exports = {
    criar,
    listar
};