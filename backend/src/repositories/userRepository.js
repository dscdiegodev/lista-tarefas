const pool = require('../config/database');

async function criarUsuario(nome, email, senhaHash) {
    const [resultado] = await pool.execute(
        'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
        [nome, email, senhaHash]
    );
    return resultado.insertId;
}

async function buscarPorEmail(email) {
    const [linhas] = await pool.execute(
        'SELECT * FROM usuarios WHERE email = ?',
        [email]
    );
    return linhas[0];
}

module.exports = {
    criarUsuario,
    buscarPorEmail
};