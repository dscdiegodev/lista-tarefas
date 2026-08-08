const pool = require('../config/database');

async function criar(nome, usuarioId) {
    const [resultado] = await pool.execute(
        `INSERT INTO tags (nome, id_usuario) VALUES (?, ?)`,
        [nome, usuarioId]
    );
    return resultado.insertId;
}

async function listarPorUsuario(usuarioId) {
    const [tags] = await pool.execute(
        `SELECT id, nome FROM tags WHERE id_usuario = ? ORDER BY nome ASC`,
        [usuarioId]
    );
    return tags;
}

async function atualizar(tagId, nome, usuarioId) {
    const [resultado] = await pool.execute(
        `UPDATE tags SET nome = ? WHERE id = ? AND id_usuario = ?`,
        [nome, tagId, usuarioId]
    );
    return resultado.affectedRows;
}

async function deletar(tagId, usuarioId) {
    const [resultado] = await pool.execute(
        `DELETE FROM tags WHERE id = ? AND id_usuario = ?`,
        [tagId, usuarioId]
    );
    return resultado.affectedRows;
}

module.exports = {
    criar,
    listarPorUsuario,
    atualizar,
    deletar
};