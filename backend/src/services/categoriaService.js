const pool = require('../config/database');

async function criarCategoria(dados, usuarioId) {
    const { nome, cor } = dados;
    if (!nome) {
        throw new Error('O nome da categoria é obrigatório.');
    }

    try {
        const [resultado] = await pool.execute(
            `INSERT INTO categorias (nome, cor, id_usuario) VALUES (?, ?, ?)`,
            [nome, cor || '#3498db', usuarioId]
        );

        return {
            id: resultado.insertId,
            nome,
            cor: cor || '#3498db',
            id_usuario: usuarioId
        };
    } catch (error) {
        console.error('ERRO REAL DO MYSQL:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Você já possui uma categoria com este nome.');
        }
        throw new Error('Erro ao criar a categoria no banco de dados.');
    }
}

async function listarCategoriasPorUsuario(usuarioId) {
    const [categorias] = await pool.execute(
        `SELECT id, nome, cor FROM categorias WHERE id_usuario = ? ORDER BY nome ASC`,
        [usuarioId]
    );

    return categorias;
}

async function atualizarCategoria(categoriaId, dados, usuarioId){
    const { nome, cor } = dados;

    if(!nome) {
        throw new Error('O nome da categoria é obrigatório para atualização.');
    }

    const [resultado] = await pool.execute(
        `UPDATE categorias SET nome = ?, cor = ? WHERE id = ? AND id_usuario = ?`,
        [nome, cor || '#3498db', categoriaId, usuarioId]
    );

    if (resultado.affectedRows === 0) {
        throw new Error('Categoria não encontrada ou você não permissão para atualizá-la!');
    }

    return {
        mensagem: 'Categoria atualizada com sucesso.',
        dados: {
            id: Number(categoriaId),
            nome,
            cor: cor || '#3498db',
            id_usuario: usuarioId
        }
    };
}

async function deletarCategoria(categoriaId, usuarioId) {
    const [resultado] = await pool.execute(
        `DELETE FROM categorias WHERE id = ? AND id_usuario = ?`,
        [categoriaId, usuarioId]
    );

    if (resultado.affectedRows === 0) {
        throw new Error('Categoria não encontrada ou você não tem permissão para excluí-la.');
    }

    return { mensagem: 'Categoria excluída com sucesso!' };
}

module.exports = {
    criarCategoria,
    listarCategoriasPorUsuario,
    atualizarCategoria,
    deletarCategoria
};