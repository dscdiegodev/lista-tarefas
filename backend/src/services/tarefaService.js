const pool = require('../config/database');

async function criarTarefa(dadosTarefa, usuarioId) {
    const { titulo, descricao, prazo, prioridade, id_categoria } = dadosTarefa;

    if (!titulo || !prazo) {
        throw new Error('O título e o prazo da tarefa são obrigatórios.');
    }

    try {
        const [resultado] = await pool.execute(
            `INSERT INTO tarefas (titulo, descricao, prazo, prioridade, id_usuario, id_categoria)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                titulo,
                descricao || null,
                prazo,
                prioridade || 'Média',
                usuarioId,
                id_categoria || null
            ]
        );

        return {
            id: resultado.insertId,
            titulo,
            descricao,
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
    let query = `
        SELECT t.*, c.nome as categoria_nome
        FROM tarefas t
        LEFT JOIN categorias c ON t.id_categoria = c.id
        WHERE t.id_usuario = ?`;

    const params = [usuarioId];

    if (filtros.status) {
        query += ` AND t.status = ?`;
        params.push(filtros.status);
    }

    if (filtros.id_categoria) {
        query += ` AND t.id_categoria = ?`;
        params.push(filtros.id_categoria);
    }

    if (filtros.prioridade) {
        query += ` AND t.prioridade = ?`;
        params.push(filtros.prioridade);
    }

    query += ` ORDER BY t.prazo ASC`;

    const [tarefas] = await pool.execute(query, params);
    return tarefas;
}

async function atualizarTarefa(tarefaId, dadosAtualizados, usuarioId) {
    const { titulo, descricao, prazo, prioridade, status, id_categoria } = dadosAtualizados;

    const [tarefaExistente] = await pool.execute(
        `SELECT * FROM tarefas WHERE id = ? AND id_usuario = ?`,
        [tarefaId, usuarioId]
    );

    if (tarefaExistente.length === 0) {
        throw new Error('Tarefa não encontrada ou você não tem permissão para editá-la.');
    }

    const [resultado] = await pool.execute(
        `UPDATE tarefas
         SET titulo = COALESCE(?, titulo),
             descricao = COALESCE(?, descricao),
             prazo = COALESCE(?, prazo),
             prioridade = COALESCE(?, prioridade),
             status = COALESCE(?, status),
             id_categoria = COALESCE(?, id_categoria)
         WHERE id = ? AND id_usuario = ?`,
        [
            titulo,
            descricao || null,
            prazo,
            prioridade || 'Média',
            status || 'Pendente',
            id_categoria || null,
            tarefaId,
            usuarioId
        ]
    );

    return { mensagem: 'Tarefa atualizada com sucesso!' };
}

async function deletarTarefa(tarefaId, usuarioId) {
    const [resultado] = await pool.execute(
        `DELETE FROM tarefas WHERE id = ? AND id_usuario = ?`,
        [tarefaId, usuarioId]
    );

    if (resultado.affectedRows === 0) {
        throw new Error('Tarefa não encontrada ou você não tempermissão para excluí-la.');
    }

    return { mensagem: 'Tarefa excluída com sucesso!' };
}

async function adicionarTagNaTarefa(tarefaId, tagId, usuarioId) {
    const [tarefa] = await pool.execute(
        `SELECT id FROM tarefas WHERE id = ? AND id_usuario = ?`,
        [tarefaId, usuarioId]
    );

    if (tarefa.length === 0) {
        throw new Error('Tarefa não encontrada ou você não tem permissão.');
    }

    const [tag] = await pool.execute(
        `SELECT id FROM tags WHERE id = ? AND id_usuario = ?`,
        [tagId, usuarioId]
    );

    if (tag.length === 0) {
        throw new Error('Tag não encontrada ou você não tem permissão.');
    }

    try {
        await pool.execute(
            `INSERT INTO tarefa_tags (id_tarefa, id_tag) VALUES (?, ?)`,
            [tarefaId, tagId]
        );

        return { mensagem: 'Tag associada à tarefa com sucesso!' };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Esta tag já está associada a esta tarefa.');
        }
        throw new Error('Erro ao associar tag à tarefa.');
    }
}

async function removerTagDaTarefa(tarefaId, tagId, usuarioId) {
    const [tarefa] = await pool.execute(
        `SELECT id FROM tarefas WHERE id = ? AND id_usuario = ?`,
        [tarefaId, usuarioId]
    );

    if (tarefa.length === 0) {
        throw new Error('Tarefa não encontrada ou você não tem permissão.');
    }

    const [resultado] = await pool.execute(
        `DELETE FROM tarefa_tags WHERE id_tarefa = ? AND id_tag = ?`,
        [tarefaId, tagId]
    );

    if (resultado.affectedRows === 0) {
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