const tarefaRepository = require('../repositories/tarefaRepository');

async function criarTarefa(dadosTarefa, usuarioId) {
    const { titulo, prazo, prioridade, descricao, id_categoria } = dadosTarefa;

    if (!titulo || !prazo) {
        throw new Error('O título e o prazo da tarefa são obrigatórios.');
    }

    try {
        const insertId = await tarefaRepository.inserir(dadosTarefa, usuarioId);

        return {
            id: insertId,
            titulo,
            descricao: descricao || null,
            prazo,
            prioridade: prioridade || 'Média',
            id_usuario: usuarioId,
            id_categoria: id_categoria || null
        };
    } catch (error) {
        throw new Error('Erro ao criar a tarefa no banco de dados.');
    }
}

async function listarTarefasPorUsuario(usuarioId, filtros = {}) {
    try {
        const tarefas = await tarefaRepository.listarPorUsuario(usuarioId, filtros);

        const tarefasComTags = await Promise.all(
            tarefas.map(async (tarefa) => {
                const tags = await tarefaRepository.buscarTagsDaTarefa(tarefa.id);
                return {
                    ...tarefa,
                    tags
                };
            })
        );

        return tarefasComTags;
    } catch (error) {
        throw new Error('Erro ao listar as tarefas.');
    }
}

async function atualizarTarefa(tarefaId, dadosAtualizados, usuarioId) {
    const tarefaExistente = await tarefaRepository.buscarPorId(tarefaId, usuarioId);

    if (!tarefaExistente) {
        throw new Error('Tarefa não encontrada ou você não tem permissão para editá-la.');
    }

    await tarefaRepository.atualizar(tarefaId, dadosAtualizados, usuarioId);

    return { mensagem: 'Tarefa atualizada com sucesso!' };
}

async function deletarTarefa(tarefaId, usuarioId) {
    const affectedRows = await tarefaRepository.deletar(tarefaId, usuarioId);

    if (affectedRows === 0) {
        throw new Error('Tarefa não encontrada ou você não tem permissão para excluí-la.');
    }

    return { mensagem: 'Tarefa excluída com sucesso!' };
}

async function adicionarTagNaTarefa(tarefaId, tagId, usuarioId) {
    const tarefa = await tarefaRepository.buscarPorId(tarefaId, usuarioId);
    if (!tarefa) {
        throw new Error('Tarefa não encontrada ou você não tem permissão.');
    }

    const tag = await tarefaRepository.verificarTagDoUsuario(tagId, usuarioId);
    if (!tag) {
        throw new Error('Tag não encontrada ou você não tem permissão.');
    }

    try {
        await tarefaRepository.associarTag(tarefaId, tagId);
        return { mensagem: 'Tag associada à tarefa com sucesso!' };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Esta tag já está associada a esta tarefa.');
        }
        throw new Error('Erro ao associar tag à tarefa.');
    }
}

async function removerTagDaTarefa(tarefaId, tagId, usuarioId) {
    const tarefa = await tarefaRepository.buscarPorId(tarefaId, usuarioId);
    if (!tarefa) {
        throw new Error('Tarefa não encontrada ou você não tem permissão.');
    }

    const affectedRows = await tarefaRepository.removerTag(tarefaId, tagId);
    if (affectedRows === 0) {
        throw new Error('Associação entre tarefa e tag não encontrada.');
    }

    return { mensagem: 'Tag removida da tarefa com sucesso!' };
}

module.exports = {
    criarTarefa,
    listarTarefasPorUsuario,
    atualizarTarefa,
    deletarTarefa,
    adicionarTagNaTarefa,
    removerTagDaTarefa
};