const tarefaService = require('../services/tarefaService');

async function criar(req, res) {
    try {
        const { titulo, descricao, prazo, prioridade, id_categoria } = req.body;

        // Adicione estes logs para depurar no terminal:
        console.log("DADOS DO BODY:", req.body);
        console.log("USUARIO ID VINDO DO REQ:", req.usuarioId, req.usuario);

        const usuarioId = req.usuarioId || req.usuario?.id; // Tenta pegar de qualquer um dos dois padrões

        const novaTarefa = await tarefaService.criarTarefa(
            { titulo, descricao, prazo, prioridade, id_categoria },
            usuarioId
        );

        return res.status(201).json({
            sucesso: true,
            message: 'Tarefa criada com sucesso!',
            dados: novaTarefa
        });
    } catch (error) {
        console.error("ERRO NO CREATE TAREFA:", error);
        return res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
}

async function listar(req, res) {
    try {
        const usuarioId = req.usuarioId;
        const filtros = req.query;

        const listaTarefas = await tarefaService.listarTarefasPorUsuario(usuarioId, filtros);

        return res.status(200).json({
            sucesso: true,
            dados: listaTarefas
        });
    } catch (error) {
        return res.status(400).json({
            sucesso: false,
            erro: error.message
        });
    }
}

async function atualizar(req, res) {
    try {
        const tarefaId = req.params.id;
        const usuarioId = req.usuarioId;
        const dadosAtualizados = req.body;

        const resultado = await tarefaService.atualizarTarefa(tarefaId, dadosAtualizados, usuarioId);

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
        const tarefaId = req.params.id;
        const usuarioId = req.usuarioId;

        const resultado = await tarefaService.deletarTarefa(tarefaId, usuarioId);

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

async function adicionarTag(req, res) {
    try {
        const tarefaId = req.params.id;
        const { tagId } = req.body;
        const usuarioId = req.usuarioId;

        const resultado = await tarefaService.adicionarTagNaTarefa(tarefaId, tagId, usuarioId);

        return res.status(201).json({
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

async function removerTag(req, res) {
    try {
        const tarefaId = req.params.id;
        const tagId = req.params.tagId;
        const usuarioId = req.usuarioId;

        const resultado = await tarefaService.removerTagDaTarefa(tarefaId, tagId, usuarioId);

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
    deletar,
    adicionarTag,
    removerTag
};