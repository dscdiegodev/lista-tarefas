const tagRepository = require('../repositories/tagRepository');

async function criarTag(nome, usuarioId) {
    if (!nome) {
        throw new Error('O nome da tag é obrigatório.');
    }

    try {
        const insertId = await tagRepository.criar(nome, usuarioId);

        return {
            id: insertId,
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
    return await tagRepository.listarPorUsuario(usuarioId);
}

async function atualizarTag(tagId, dados, usuarioId) {
    const { nome } = dados;

    if (!nome) {
        throw new Error('O nome da tag é obrigatório para atualização');
    }

    try {
        const affectedRows = await tagRepository.atualizar(tagId, nome, usuarioId);

        if (affectedRows === 0) {
            throw new Error('Tag não encontrada ou você não tem permissão para atualizá-la!');
        }

        return {
            mensagem: 'Tag atualizada com sucesso.',
            dados: {
                id: Number(tagId),
                nome,
                id_usuario: usuarioId
            }
        };

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Você já possui outra tag com este nome.');
        }
        throw error;
    }
}

async function deletarTag(tagId, usuarioId) {
    const affectedRows = await tagRepository.deletar(tagId, usuarioId);

    if (affectedRows === 0) {
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