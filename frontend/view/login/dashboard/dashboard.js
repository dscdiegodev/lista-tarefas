document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const mensagemDiv = document.getElementById('mensagem');
    const listaTarefas = document.getElementById('listaTarefas');
    const btnLogout = document.getElementById('btnLogout');
    const formNovaTarefa = document.getElementById('formNovaTarefa');
    const selectCategoria = document.getElementById('categoriaTarefa');

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

    // Função para carregar categorias
    async function carregarCategorias() {
        try {
            const resposta = await fetch('http://localhost:3000/api/categorias', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resultado = await resposta.json();

            if (resposta.ok && resultado.dados) {
                selectCategoria.innerHTML = '<option value="">Selecione uma categoria (Opcional)</option>';
                resultado.dados.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.nome;
                    selectCategoria.appendChild(option);
                });
            }
        } catch (erro) {
            console.error('Erro ao carregar categorias:', erro);
        }
    }

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
                    listaTarefas.innerHTML = `<tr><td colspan="5" style="text-align: center;">Nenhuma tarefa encontrada.</td></tr>`;
                    return;
                }

                listaTarefas.innerHTML = '';
                listaDeTarefas.forEach(tarefa => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${tarefa.titulo || tarefa.nome || 'Sem título'}</td>
                        <td>${tarefa.descricao || 'Sem descrição'}</td>
                        <td>${tarefa.categoria_nome || 'Geral'}</td>
                        <td>
                            <input type="checkbox" class="check-concluido" data-id="${tarefa.id}" ${tarefa.status === 'Concluída' ? 'checked' : ''}>
                            <span style="${tarefa.status === 'Concluída' ? 'text-decoration: line-through; color: gray;' : ''}">
                                ${tarefa.status || 'Pendente'}
                            </span>
                        </td>
                        <td>
                            <button class="btn-editar"
                                data-id="${tarefa.id}"
                                data-titulo="${tarefa.titulo || ''}"
                                data-descricao="${tarefa.descricao || ''}"
                                data-prazo="${tarefa.prazo ? tarefa.prazo.split('T')[0] : ''}"
                                data-categoria="${tarefa.id_categoria || ''}">Editar</button>
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

    // Evento de envio do formulário (Criar / Atualizar)
    formNovaTarefa.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = document.getElementById('tituloTarefa').value;
        const descricao = document.getElementById('descricaoTarefa').value;
        const prazo = document.getElementById('prazoTarefa').value;
        const id_categoria = selectCategoria.value || null;

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
                body: JSON.stringify({ titulo, descricao, prazo, id_categoria })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                document.getElementById('tituloTarefa').value = '';
                document.getElementById('descricaoTarefa').value = '';
                document.getElementById('prazoTarefa').value = '';
                selectCategoria.value = '';
                idTarefaEditando = null;

                const btnSubmit = formNovaTarefa.querySelector('button[type="submit"]');
                if (btnSubmit) btnSubmit.innerText = 'Adicionar Tarefa';

                carregarTarefas();
            } else {
                alert(resultado.mensagem || 'Erro ao salvar tarefa.');
            }
        } catch (erro) {
            console.error('Erro detalhado na requisição:', erro);
            alert('Não foi possível conectar ao servidor.');
        }
    });

    // Eventos de clique na tabela (Editar e Excluir)
    listaTarefas.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-excluir')) {
            const idTarefa = e.target.getAttribute('data-id');

            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                try {
                    const resposta = await fetch(`http://localhost:3000/api/tarefas/${idTarefa}`, {
                        method: 'DELETE',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const resultado = await resposta.json();

                    if (resposta.ok) {
                        carregarTarefas();
                    } else {
                        alert(resultado.mensagem || 'Erro ao excluir tarefa.');
                    }
                } catch (erro) {
                    console.error('Erro na requisição de exclusão:', erro);
                    alert('Não foi possível conectar ao servidor.');
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

            const idCat = e.target.getAttribute('data-categoria');
            selectCategoria.value = (idCat && idCat !== 'null') ? idCat : '';

            const btnSubmit = formNovaTarefa.querySelector('button[type="submit"]');
            if (btnSubmit) btnSubmit.innerText = 'Atualizar Tarefa';
        }
    });

    // Evento de alteração do status via checkbox na tabela
    listaTarefas.addEventListener('change', async (e) => {
        if (e.target.classList.contains('check-concluido')) {
            const idTarefa = e.target.getAttribute('data-id');
            const novoStatus = e.target.checked ? 'Concluída' : 'Pendente';

            const tr = e.target.closest('tr');
            const btnEditar = tr.querySelector('.btn-editar');

            const titulo = btnEditar.getAttribute('data-titulo');
            const descricao = btnEditar.getAttribute('data-descricao');
            const prazo = btnEditar.getAttribute('data-prazo');
            const id_categoria = btnEditar.getAttribute('data-categoria') || null;

            try {
                const resposta = await fetch(`http://localhost:3000/api/tarefas/${idTarefa}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        titulo,
                        descricao,
                        prazo,
                        status: novoStatus,
                        id_categoria: id_categoria !== '' ? id_categoria : null
                    })
                });

                const resultado = await resposta.json();

                if (resposta.ok) {
                    carregarTarefas();
                } else {
                    alert(resultado.mensagem || 'Erro ao alterar o status.');
                    e.target.checked = !e.target.checked;
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                alert('Não foi possível conectar ao servidor.');
                e.target.checked = !e.target.checked;
            }
        }
    });

    carregarCategorias();
    carregarTarefas();
});