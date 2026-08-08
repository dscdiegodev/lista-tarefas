const pool = require('../config/database');

async function inserir(dados, usuarioId) {
    const { titulo, descricao, prazo, prioridade, status, id_categoria } = dados;
    const [resultado] = await pool.execute(
        `INSERT INTO tarefas (titulo, descricao, prazo, prioridade, status, id_usuario, id_categoria)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [titulo, descricao || null, prazo, prioridade || 'Média', status || 'Pendente', usuarioId, id_categoria || null]
    );
    return resultado.insertId;
}

async function listarPorUsuario(usuarioId, filtros = {}) {
    let query = `
        SELECT DISTINCT t.*, c.nome as categoria_nome, c.cor as categoria_cor
        FROM tarefas t
        LEFT JOIN categorias c ON t.id_categoria = c.id
        LEFT JOIN tarefa_tags tt ON t.id = tt.id_tarefa
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
    if (filtros.tagId) {
        query += ` AND tt.id_tag = ?`;
        params.push(filtros.tagId);
    }

    query += ` ORDER BY t.prazo ASC`;
    const [tarefas] = await pool.execute(query, params);
    return tarefas;
}

async function buscarPorId(tarefaId, usuarioId) {
    const [linhas] = await pool.execute(
        `SELECT * FROM tarefas WHERE id = ? AND id_usuario = ?`,
        [tarefaId, usuarioId]
    );
    return linhas[0];
}

async function atualizar(tarefaId, dados, usuarioId) {
    const { titulo, descricao, prazo, prioridade, status, id_categoria } = dados;
    await pool.execute(
        `UPDATE tarefas
         SET titulo = COALESCE(?, titulo),
             descricao = COALESCE(?, descricao),
             prazo = COALESCE(?, prazo),
             prioridade = COALESCE(?, prioridade),
             status = COALESCE(?, status),
             id_categoria = COALESCE(?, id_categoria)
         WHERE id = ? AND id_usuario = ?`,
        [titulo || null, descricao || null, prazo || null, prioridade || null, status || null, id_categoria || null, tarefaId, usuarioId]
    );
}

async function deletar(tarefaId, usuarioId) {
    const [resultado] = await pool.execute(
        `DELETE FROM tarefas WHERE id = ? AND id_usuario = ?`,
        [tarefaId, usuarioId]
    );
    return resultado.affectedRows;
}

async function buscarTagsDaTarefa(tarefaId) {
    const [tags] = await pool.execute(
        `SELECT t.id, t.nome FROM tags t
         JOIN tarefa_tags tt ON t.id = tt.id_tag
         WHERE tt.id_tarefa = ?`,
        [tarefaId]
    );
    return tags;
}

async function associarTag(tarefaId, tagId) {
    await pool.execute(`INSERT INTO tarefa_tags (id_tarefa, id_tag) VALUES (?, ?)`, [tarefaId, tagId]);
}

async function removerTag(tarefaId, tagId) {
    const [resultado] = await pool.execute(`DELETE FROM tarefa_tags WHERE id_tarefa = ? AND id_tag = ?`, [tarefaId, tagId]);
    return resultado.affectedRows;
}

module.exports = {
    inserir,
    listarPorUsuario,
    buscarPorId,
    atualizar,
    deletar,
    buscarTagsDaTarefa,
    associarTag,
    removerTag
};