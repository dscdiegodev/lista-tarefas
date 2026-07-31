document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const mensagemDiv = document.getElementById('mensagem');
    const listaTarefas = document.getElementById('listaTarefas');
    const btnLogout = document.getElementById('btnLogout');

    // 1. Segurança: Se não houver token, chuta o usuário de volta para o login
    if (!token) {
        alert('Acesso negado. Faça login novamente.');
        window.location.href = '../login/login.html'; // Ajuste o caminho se necessário
        return;
    }

    // 2. Botão de Sair limpa o localStorage e redireciona
    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '../login/login.html';
    });

    // 3. Buscar tarefas protegidas na API
    try {
        mensagemDiv.innerText = 'Carregando tarefas...';

        const resposta = await fetch('http://localhost:3000/api/tarefas', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Passando o JWT que guardamos no login
                'Content-Type': 'application/json'
            }
        });

        const respostaServidor = await resposta.json();
        console.log("O que a API retornou:", respostaServidor);

        if (resposta.ok) {
            mensagemDiv.innerText = '';
            
            // Extrai o array de tarefas de dentro da propriedade "dados" do objeto
            const listaDeTarefas = respostaServidor.dados;

            if (!listaDeTarefas || listaDeTarefas.length === 0) {
                listaTarefas.innerHTML = `<tr><td colspan="3" style="text-align: center;">Nenhuma tarefa encontrada.</td></tr>`;
                return;
            }

            // Preenche a tabela dinamicamente com as tarefas vindas do banco
            listaTarefas.innerHTML = '';
            listaDeTarefas.forEach(tarefa => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tarefa.titulo || tarefa.nome || 'Sem título'}</td>
                    <td>${tarefa.descricao || 'Sem descrição'}</td>
                    <td>${tarefa.concluido ? 'Concluído' : 'Pendente'}</td>
                `;
                listaTarefas.appendChild(tr);
            });

        } else {
            mensagemDiv.style.color = '#d9534f';
            mensagemDiv.innerText = respostaServidor.mensagem || 'Erro ao carregar as tarefas.';
            
            // Se o token expirou ou é inválido, força novo login
            if (resposta.status === 401) {
                localStorage.removeItem('token');
                setTimeout(() => {
                    window.location.href = '../login/login.html';
                }, 2000);
            }
        }
    } catch (erro) {
        console.error(erro);
        mensagemDiv.style.color = '#d9534f';
        mensagemDiv.innerText = 'Não foi possível conectar ao servidor para buscar as tarefas.';
    }
});