const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

async function registrarUsuario(nome, email, senha) {
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    try {
        const novoUsuarioId = await userRepository.criarUsuario(nome, email, senhaHash);
        return {
            id: novoUsuarioId,
            nome,
            email
        };
    } catch (error) {
        console.error("ERRO REAL DO MYSQL:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error('Este e-mail já está cadastrado no sistema.');
        }
        throw new Error('Erro ao registrar usuário no banco de dados.');
    }
}

async function autenticarUsuario(email, senha) {
    const usuario = await userRepository.buscarPorEmail(email);

    if (!usuario) {
        throw new Error('E-mail ou senha inválidos.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
        throw new Error('E-mail ou senha inválidos.');
    }

    const tokenPayload = {
        id: usuario.id,
        email: usuario.email
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

    return {
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        },
        token
    };
}

module.exports = {
    registrarUsuario,
    autenticarUsuario
};