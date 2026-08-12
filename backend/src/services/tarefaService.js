const tarefaRepository = require('../repositories/tarefaRepository');

async function criarTarefa(dadosTarefa, usuarioId) {
    const { titulo, prazo, prioridade, descricao, id_categoria, tags } = dadosTarefa;

    if (!titulo || !prazo) {
        throw new Error('O título e o prazo da tarefa são obrigatórios.');
    }

    try {
        const insertId = await tarefaRepository.inserir(dadosTarefa, usuarioId);

        if (tags && Array.isArray(tags) && tags.length > 0) {
            for (const tagId of tags) {
                await tarefaRepository.associarTag(insertId, tagId);
            }
        }

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

async function listarTarefas(usuarioId, status, idCategoria, ordenacao) {
    try {
        const tarefas = await tarefaRepository.listarPorUsuario(usuarioId, status, idCategoria, ordenacao);

        const tarefasComTags = await Promise.all(
            tarefas.map(async (tarefa) => {
                const tags = await tarefaRepository.buscarTagsDaTarefa(tarefa.id);
                return {
                    ...tarefa,
                    tags: tags || []
                };
            })
        );

        return tarefasComTags;
    } catch (error) {
        console.error('Erro detalhado no service:', error);
        throw new Error('Erro ao listar as tarefas.');
    }
}

async function atualizarTarefa(tarefaId, dadosAtualizados, usuarioId) {
    const { tags, ...dadosTarefa } = dadosAtualizados;

    const tarefaExistente = await tarefaRepository.buscarPorId(tarefaId, usuarioId);

    if (!tarefaExistente) {
        throw new Error('Tarefa não encontrada ou você não tem permissão para editá-la.');
    }

    await tarefaRepository.atualizar(tarefaId, dadosTarefa, usuarioId);

    if (tags !== undefined && Array.isArray(tags)) {
        await tarefaRepository.removerTodasTagsDaTarefa(tarefaId);

        for (const tagId of tags) {
            await tarefaRepository.associarTag(tarefaId, tagId);
        }
    }

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
    listarTarefas,
    listarTarefasPorUsuario: listarTarefas, // Mantém compatibilidade caso outro arquivo chame assim
    atualizarTarefa,
    deletarTarefa,
    adicionarTagNaTarefa,
    removerTagDaTarefa
};