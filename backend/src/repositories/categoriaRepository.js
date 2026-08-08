const pool = require('../config/database');

async function criar(nome, cor, usuarioId) {
    const [resultado] = await pool.execute(
        `INSERT INTO categorias (nome, cor, id_usuario) VALUES (?, ?, ?)`,
        [nome, cor, usuarioId]
    );
    return resultado.insertId;
}

async function listarPorUsuario(usuarioId) {
    const [categorias] = await pool.execute(
        `SELECT id, nome, cor FROM categorias WHERE id_usuario = ? ORDER BY nome ASC`,
        [usuarioId]
    );
    return categorias;
}

async function atualizar(categoriaId, nome, cor, usuarioId) {
    const [resultado] = await pool.execute(
        `UPDATE categorias SET nome = ?, cor = ? WHERE id = ? AND id_usuario = ?`,
        [nome, cor, categoriaId, usuarioId]
    );
    return resultado.affectedRows;
}

async function deletar(categoriaId, usuarioId) {
    const [resultado] = await pool.execute(
        `DELETE FROM categorias WHERE id = ? AND id_usuario = ?`,
        [categoriaId, usuarioId]
    );
    return resultado.affectedRows;
}

module.exports = {
    criar,
    listarPorUsuario,
    atualizar,
    deletar
};