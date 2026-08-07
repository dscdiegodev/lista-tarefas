const categoriaService = require('../services/categoriaService');

async function criar(req, res) {    
    try {
        const { nome, cor } = req.body;
        const usuarioId = req.usuarioId;

        console.log("DADOS RECEBIDOS - Nome:", nome, "| UsuarioId:", usuarioId);

        const novaCategoria = await categoriaService.criarCategoria({ nome, cor }, usuarioId);

        return res.status(201).json({
            sucesso: true,
            mensagem: 'Categoria criada com sucesso!',
            dados: novaCategoria
        });
    } catch (error) {
        console.error('ERRO NO CREATE CATEGORIA:', error);
        return res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
}

async function listar(req, res) {
    try {
        const usuarioId = req.usuarioId;
        const categorias = await categoriaService.listarCategoriasPorUsuario(usuarioId);

        return res.status(200).json({
            sucesso: true,
            dados: categorias
        });
    } catch (error) {
        console.error('ERRO LISTAR CATEGORIA:', error)
        return res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
}

async function atualizar(req, res) {
    try{
        const categoriaId = req.params.id;
        const usuarioId = req.usuarioId;
        const dadosAtualizados = req.body;

        const resultado = await categoriaService.atualizarCategoria(categoriaId, dadosAtualizados,usuarioId);

        return res.status(200).json({
            sucesso: true,
            ...resultado
        });
    } catch (error) {
        return res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
}

async function deletar(req, res) {
    try {
        const categoriaId = req.params.id;
        const usuarioId = req.usuarioId;

        const resultado = await categoriaService.deletarCategoria(categoriaId, usuarioId);

        return res.status(200).json({
            sucesso: true,
            ...resultado
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
    listar,
    atualizar,
    deletar
};