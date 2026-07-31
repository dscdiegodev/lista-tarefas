
const form = document.getElementById('loginForm');
const mensagemDiv = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita recarregar a página

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    mensagemDiv.className = '';
    mensagemDiv.innerText = 'Autenticando...';

    try {
        // Requisição POST para a sua rota de login que testamos no Swagger
        const resposta = await fetch('http://localhost:3000/api/auth/entrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            mensagemDiv.className = 'sucesso';
            mensagemDiv.innerHTML = `Login realizado com sucesso!<br><strong>Token salvo no localStorage.</strong>`;

            // Salva o token JWT no navegador para usar nas próximas requisições
            localStorage.setItem('token', dados.token);
        } else {
            mensagemDiv.className = 'erro';
            mensagemDiv.innerText = dados.mensagem || 'Erro ao fazer login.';
        }
    } catch (erro) {
        console.log(erro);
        mensagemDiv.className = 'erro';
        mensagemDiv.innerText = 'Não foi possível conectar ao servidor.';
    }
});