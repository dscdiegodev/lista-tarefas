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

async function listarPorUsuarioPaginado(usuarioId, status, idCategoria, ordenacao, limite, offset) {
    let query = `
        SELECT
            t.*,
            c.nome AS categoria_nome,
            c.cor AS categoria_cor
        FROM tarefas t
        LEFT JOIN categorias c ON t.id_categoria = c.id
        WHERE t.id_usuario = ?
    `;
    const valores = [usuarioId];

    if (status) {
        query += ` AND t.status = ?`;
        valores.push(status);
    }

    if (idCategoria) {
        query += ` AND t.id_categoria = ?`;
        valores.push(idCategoria);
    }

    if (ordenacao === 'asc' || ordenacao === 'desc') {
        query += ` ORDER BY t.prazo ${ordenacao.toUpperCase()}`;
    } else {
        query += ` ORDER BY t.id DESC`;
    }

    const limiteInt = parseInt(limite, 10) || 10;
    const offsetInt = parseInt(offset, 10) || 0;

    query += ` LIMIT ${limiteInt} OFFSET ${offsetInt}`;

    const [tarefas] = await pool.execute(query, valores);
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

async function removerTodasTagsDaTarefa(tarefaId) {
    await pool.execute(`DELETE FROM tarefa_tags WHERE id_tarefa = ?`, [tarefaId]);
}

async function removerTag(tarefaId, tagId) {
    const [resultado] = await pool.execute(`DELETE FROM tarefa_tags WHERE id_tarefa = ? AND id_tag = ?`, [tarefaId, tagId]);
    return resultado.affectedRows;
}

module.exports = {
    inserir,
    listarPorUsuarioPaginado,
    buscarPorId,
    atualizar,
    deletar,
    buscarTagsDaTarefa,
    associarTag,
    removerTag,
    removerTodasTagsDaTarefa
};