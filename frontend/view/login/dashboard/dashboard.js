document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const mensagemDiv = document.getElementById('mensagem');
    const listaTarefas = document.getElementById('listaTarefas');
    const btnLogout = document.getElementById('btnLogout');
    const formNovaTarefa = document.getElementById('formNovaTarefa');

    let idTarefaEditando = null;

    if (!token) {
        alert('Acesso negado. Faça login novamente.');
        window.location.href = '../login/login.html';
        return;
    }

    btnLogout.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '../login/login.html';
    });

    // Função para buscar e renderizar as tarefas
    async function carregarTarefas() {
        try {
            mensagemDiv.innerText = 'Carregando tarefas...';

            const resposta = await fetch('http://localhost:3000/api/tarefas', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const respostaServidor = await resposta.json();

            if (resposta.ok) {
                mensagemDiv.innerText = '';

                const listaDeTarefas = respostaServidor.dados;

                if (!listaDeTarefas || listaDeTarefas.length === 0) {
                    listaTarefas.innerHTML = `<tr><td colspan="3" style="text-align: center;">Nenhuma tarefa encontrada.</td></tr>`;
                    return;
                }

                // Preenche a tabela dinamicamente
                listaTarefas.innerHTML = '';
                listaDeTarefas.forEach(tarefa => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${tarefa.titulo || tarefa.nome || 'Sem título'}</td>
                        <td>${tarefa.descricao || 'Sem descrição'}</td>
                        <td>${tarefa.concluido ? 'Concluído' : 'Pendente'}</td>
                        <td>
                            <button class="btn-editar" data-id="${tarefa.id}">Editar</button>
                            <button class="btn-excluir" data-id="${tarefa.id}">Excluir</button>
                        </td>
                    `;
                    listaTarefas.appendChild(tr);
                });

            } else {
                mensagemDiv.style.color = '#d9534f';
                mensagemDiv.innerText = respostaServidor.mensagem || 'Erro ao carregar as tarefas.';

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
    }

    formNovaTarefa.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = document.getElementById('tituloTarefa').value;
        const descricao = document.getElementById('descricaoTarefa').value;
        const prazo = document.getElementById('prazoTarefa').value;

        const isEditando = idTarefaEditando !== null;
        const url = isEditando
            ? `http://localhost:3000/api/tarefas/${idTarefaEditando}`
            : 'http://localhost:3000/api/tarefas';
        const metodo = isEditando ? 'PUT' : 'POST';

        try {
            const resposta = await fetch(url, {
                method: metodo,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ titulo, descricao, prazo })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                document.getElementById('tituloTarefa').value = '';
                document.getElementById('descricaoTarefa').value = '';
                document.getElementById('prazoTarefa').value = '';
                idTarefaEditando = null;

                const btnSubmit = document.querySelector('#formNovaTarefa button[type="submit"]');
                if (btnSubmit) btnSubmit.innerText = 'Adicionar Tarefa';

                carregarTarefas(); // Atualiza a tabela
            } else {
                alert(resultado.mensagem || 'Erro ao salvar tarefa.');
            }
        } catch (erro) {
            console.error('Erro na requisição:', erro);
            alert('Não foi possível conectar ao servidor.');
        }
    });

    listaTarefas.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-excluir')) {
            const idTarefa = e.target.getAttribute('data-id');

            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                try {
                    const resposta = await fetch(`http://localhost:3000/api/tarefas/${idTarefa}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    const resultado = await resposta.json();

                    if (resposta.ok) {
                        carregarTarefas(); // Atualiza a tabela na mesma hora!
                    } else {
                        alert(resultado.mensagem || 'Erro ao excluir tarefa.');
                    }
                } catch (erro) {
                    console.error('Erro na requisição de exclusão:', erro);
                    alert('Não foi possível conectar ao servidor para excluir a tarefa.');
                }
            }
        }

        if (e.target.classList.contains('btn-editar')) {
            idTarefaEditando = e.target.getAttribute('data-id');

            document.getElementById('tituloTarefa').value = e.target.getAttribute('data-titulo');
            document.getElementById('descricaoTarefa').value = e.target.getAttribute('data-descricao');

            const prazoStr = e.target.getAttribute('data-prazo');
            if (prazoStr) {
                document.getElementById('prazoTarefa').value = prazoStr;
            }

            const btnSubmit = formNovaTarefa.querySelector('#formNovaTarefa button[type="submit"]');
            if (btnSubmit) btnSubmit.innerText = 'Atualizar Tarefa';
        }
    });

    carregarTarefas();
});