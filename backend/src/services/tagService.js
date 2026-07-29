const pool = require('../config/database');

async function criarTag(nome, usuarioId) {
    if (!nome) {
        throw new Error('O nome da tag é obrigatório.');
    }

    try {
        const [resultado] = await pool.execute(
            `INSERT INTO tags (nome, id_usuario) VALUES (?, ?)`,
            [nome, usuarioId]
        );

        return {
            id: resultado.insertId,
            nome,
            id_usuario: usuarioId
        };
    } catch (error) {
        console.error('ERRO REAL DO MYSQL:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Você já possui uma tag com este nome.');
        }
        
        throw new Error('Erro ao criar a tag no banco de dados');
    }
}

async function listarTagsPorUsuario(usuarioId) {
    const [tags] = await pool.execute(
        `SELECT id, nome FROM tags WHERE id_usuario = ? ORDER BY nome ASC`,
        [usuarioId]
    );
    return tags;
}

async function atualizarTag(tagId, dados, usuarioId) {
    const { nome } = dados;

    if(!nome) {
        throw new Error('O nome da tag é obrigatório para atualização');
    }

    const [resultado] = await pool.execute(
            `UPDATE tags SET nome = ? WHERE id = ? AND id_usuario = ?`,
            [nome, tagId, usuarioId]
        );

        if (resultado.affectedRows === 0) {
            throw new Error('Tag não encontrada ou você não permissão para atualizá-la!');
        }

        return {
            mensagem: 'Tag atualizada com sucesso.',
            dados: {
                id: Number(tagId),
                nome,
                id_usuario: usuarioId
            }
        };
}

async function deletarTag(tagId, usuarioId) {
    const [resultado] = await pool.execute(
        `DELETE FROM tags WHERE id = ? AND id_usuario = ?`,
        [tagId, usuarioId]
    );

    if (resultado.affectedRows === 0) {
        throw new Error('Tag não encontrada ou você não tem permissão para excluí-la.');
    }

    return { mensagem: 'Tag excluída com sucesso!' };
}

module.exports = {
    criarTag,
    listarTagsPorUsuario,
    atualizarTag,
    deletarTag
};