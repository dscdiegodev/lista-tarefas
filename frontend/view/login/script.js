const form = document.getElementById('loginForm');
const mensagemDiv = document.getElementById('mensagem');

form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita recarregar a página

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    mensagemDiv.className = '';
    mensagemDiv.innerText = 'Autenticando...';

    try {
        const resposta = await fetch('http://localhost:3000/api/auth/entrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha }),
            credentials: 'include'
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            mensagemDiv.className = 'sucesso';
            mensagemDiv.innerHTML = `Login realizado com sucesso!<br><strong>Sessão segura iniciada.</strong>`;

            setTimeout(() => {
                window.location.href = 'dashboard/dashboard.html';
            }, 1000);
            
        } else {
            mensagemDiv.className = 'erro';
            mensagemDiv.innerText = dados.erro || dados.mensagem || 'Erro ao fazer login.';
        }
    } catch (erro) {
        console.log(erro);
        mensagemDiv.className = 'erro';
        mensagemDiv.innerText = 'Não foi possível conectar ao servidor.';
    }
});