const categoriaRepository = require('../repositories/categoriaRepository');

async function criarCategoria(dados, usuarioId) {
    const { nome, cor } = dados;
    if (!nome) {
        throw new Error('O nome da categoria é obrigatório.');
    }

    const corFinal = cor || '#3498db';

    try {
        const insertId = await categoriaRepository.criar(nome, corFinal, usuarioId);

        return {
            id: insertId,
            nome,
            cor: corFinal,
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
    return await categoriaRepository.listarPorUsuario(usuarioId);
}

async function atualizarCategoria(categoriaId, dados, usuarioId) {
    const { nome, cor } = dados;

    if (!nome) {
        throw new Error('O nome da categoria é obrigatório para atualização.');
    }

    const corFinal = cor || '#3498db';
    const affectedRows = await categoriaRepository.atualizar(categoriaId, nome, corFinal, usuarioId);

    if (affectedRows === 0) {
        throw new Error('Categoria não encontrada ou você não tem permissão para atualizá-lá!');
    }

    return {
        mensagem: 'Categoria atualizada com sucesso.',
        dados: {
            id: Number(categoriaId),
            nome,
            cor: corFinal,
            id_usuario: usuarioId
        }
    };
}

async function deletarCategoria(categoriaId, usuarioId) {
    const affectedRows = await categoriaRepository.deletar(categoriaId, usuarioId);

    if (affectedRows === 0) {
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