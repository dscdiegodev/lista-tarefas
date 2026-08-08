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

    // Função genérica de Toast (movida para o topo para ser acessível em todo o escopo)
    function mostrarToast(mensagem, tipo = 'sucesso') {
        if (!mensagem) return;

        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.innerText = mensagem;

        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '6px';
        toast.style.color = '#fff';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '500';
        toast.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        toast.style.transition = 'opacity 0.3s ease';
        toast.style.opacity = '0';
        toast.style.marginTop = '8px';

        if (tipo === 'sucesso') {
            toast.style.backgroundColor = '#28a745';
        } else if (tipo === 'erro') {
            toast.style.backgroundColor = '#dc3545';
        } else {
            toast.style.backgroundColor = '#ffc107';
            toast.style.color = '#333';
        }

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    }

    // Função para carregar categorias
    async function carregarCategorias() {
        try {
            const resposta = await fetch('http://localhost:3000/api/categorias', {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resultado = await resposta.json();

            if (resposta.ok && resultado.dados) {
                // 1. Preenche o select do formulário de tarefas
                const optionsHtml = '<option value="">Selecione uma categoria (Opcional)</option>' +
                    resultado.dados.map(cat => `<option value="${cat.id}">${cat.nome}</option>`).join('');
                selectCategoria.innerHTML = optionsHtml;

                // 2. Preenche o select do filtro por categoria
                const filtroCategoria = document.getElementById('filtroCategoria');
                if (filtroCategoria) {
                    filtroCategoria.innerHTML = '<option value="">Todas as Categorias</option>' +
                        resultado.dados.map(cat => `<option value="${cat.id}">${cat.nome}</option>`).join('');
                }

                // 3. Renderiza a lista visual na seção "Gerenciar Categorias"
                const listaCategoriasEl = document.getElementById('listaCategorias');
                if (listaCategoriasEl) {
                    if (resultado.dados.length === 0) {
                        listaCategoriasEl.innerHTML = '<tr><td colspan="3" style="text-align: center; color: gray;">Nenhuma categoria cadastrada.</td></tr>';
                    } else {
                        listaTarefas.innerHTML = resultado.dados.map(tarefa => `
                            <tr>
                                <td>${tarefa.titulo || 'Sem título'}</td>
                                <td>${tarefa.descricao || 'Sem descrição'}</td>
                                <td>
                                    <span style="background-color: ${tarefa.categoria_cor || '#3498db'}; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 12px;">
                                        ${tarefa.categoria_nome || 'Geral'}
                                    </span>
                                </td>
                                <td>
                                    <strong>${tarefa.prioridade || 'Média'}</strong><br>
                                    <input type="checkbox" class="check-concluido" data-id="${tarefa.id}" ${tarefa.status === 'Concluída' ? 'checked' : ''}>
                                    <span style="${tarefa.status === 'Concluída' ? 'text-decoration: line-through; color: gray;' : ''}">
                                        ${tarefa.status || 'Pendente'}
                                    </span>
                                </td>
                                <td>
                                    ${tarefa.tags && tarefa.tags.length > 0 ? tarefa.tags.map(tag => `<span style="background:#e2e8f0; color:#475569; padding:2px 6px; border-radius:4px; font-size:11px; margin-right:4px;">#${tag.nome}</span>`).join('') : '-'}
                                </td>
                                <td>
                                    <div style="display: flex; gap: 5px; align-items: center; justify-content: center;">
                                        <button class="btn-editar" data-id="${tarefa.id}" data-titulo="${tarefa.titulo || ''}" data-descricao="${tarefa.descricao || ''}" data-prazo="${tarefa.prazo ? tarefa.prazo.split('T')[0] : ''}" data-categoria="${tarefa.id_categoria || ''}">Editar</button>
                                        <button class="btn-excluir" data-id="${tarefa.id}">Excluir</button>
                                    </div>
                                </td>
                            </tr>
                        `).join('');
                    }
                }
            }
        } catch (erro) {
            console.error('Erro ao carregar categorias:', erro);
        }
    }

    // Ouvinte de cliques para Editar e Excluir Categorias na lista visual
    const listaCategoriasContainer = document.getElementById('listaCategorias');
    if (listaCategoriasContainer) {
        listaCategoriasContainer.addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');

            // EXCLUIR CATEGORIA
            if (e.target.classList.contains('btn-excluir-categoria')) {
                if (confirm('Tem certeza que deseja excluir esta categoria? As tarefas vinculadas a ela ficarão sem categoria.')) {
                    try {
                        const resposta = await fetch(`http://localhost:3000/api/categorias/${id}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const resultado = await resposta.json();

                        if (resposta.ok) {
                            mostrarToast('Categoria excluída com sucesso!', 'sucesso');
                            carregarCategorias();
                            carregarTarefas(); // Atualiza a tabela para refletir mudanças nas tarefas
                        } else {
                            mostrarToast(resultado.erro || resultado.mensagem || 'Erro ao excluir categoria.', 'erro');
                        }
                    } catch (erro) {
                        console.error('Erro ao excluir categoria:', erro);
                        mostrarToast('Não foi possível conectar ao servidor.', 'erro');
                    }
                }
            }

            // EDITAR CATEGORIA
            if (e.target.classList.contains('btn-editar-categoria')) {
                const nomeAtual = e.target.getAttribute('data-nome');
                const corAtual = e.target.getAttribute('data-cor');

                const novoNome = prompt('Digite o novo nome da categoria:', nomeAtual);
                if (novoNome === null) return; // Se clicou em cancelar

                const novaCor = prompt('Digite a nova cor (ex: #3498db):', corAtual);
                if (novaCor === null) return;

                if (!novoNome.trim()) {
                    alert('O nome da categoria não pode ficar vazio.');
                    return;
                }

                try {
                    const resposta = await fetch(`http://localhost:3000/api/categorias/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ nome: novoNome.trim(), cor: novaCor.trim() })
                    });
                    const resultado = await resposta.json();

                    if (resposta.ok) {
                        mostrarToast('Categoria atualizada com sucesso!', 'sucesso');
                        carregarCategorias();
                        carregarTarefas();
                    } else {
                        mostrarToast(resultado.erro || resultado.mensagem || 'Erro ao atualizar categoria.', 'erro');
                    }
                } catch (erro) {
                    console.error('Erro ao atualizar categoria:', erro);
                    mostrarToast('Não foi possível conectar ao servidor.', 'erro');
                }
            }
        });
    }

    // Função para buscar e renderizar as tarefas
    async function carregarTarefas() {
        try {
            mensagemDiv.innerText = 'Carregando tarefas...';

            const statusFiltro = document.getElementById('filtroStatus')?.value || '';
            const categoriaFiltro = document.getElementById('filtroCategoria')?.value || '';
            const ordenacao = document.getElementById('ordenarPor')?.value || '';

            let url = 'http://localhost:3000/api/tarefas?';
            const params = new URLSearchParams();
            if (statusFiltro) params.append('status', statusFiltro);
            if (categoriaFiltro) params.append('id_categoria', categoriaFiltro);

            const resposta = await fetch(url + params.toString(), {
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

                    document.getElementById('totalTarefas').innerText = 0;
                    document.getElementById('totalConcluidas').innerText = 0;
                    document.getElementById('totalPendentes').innerText = 0;
                    return;
                }

                const total = listaDeTarefas.length;
                const concluidas = listaDeTarefas.filter(t => t.status === 'Concluída').length;
                const pendentes = total - concluidas;

                document.getElementById('totalTarefas').innerText = total;
                document.getElementById('totalConcluidas').innerText = concluidas;
                document.getElementById('totalPendentes').innerText = pendentes;

                if (listaDeTarefas && ordenacao) {
                    listaDeTarefas.sort((a, b) => {
                        const dataA = new Date(a.prazo);
                        const dataB = new Date(b.prazo);
                        return ordenacao === 'asc' ? dataA - dataB : dataB - dataA;
                    });
                }

                listaTarefas.innerHTML = '';
                listaDeTarefas.forEach(tarefa => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                            <td>${tarefa.titulo || tarefa.nome || 'Sem título'}</td>
                            <td>${tarefa.descricao || 'Sem descrição'}</td>
                            <td>
                                <span style="background-color: ${tarefa.categoria_cor || '#3498db'}; color: #fff; padding: 3px 8px; border-radius: 4px; font-size: 12px;">
                                    ${tarefa.categoria_nome || 'Geral'}
                                </span>
                            </td>
                            <td>
                                <strong>${tarefa.prioridade || 'Média'}</strong><br>
                                <input type="checkbox" class="check-concluido" data-id="${tarefa.id}" ${tarefa.status === 'Concluída' ? 'checked' : ''}>
                                <span style="${tarefa.status === 'Concluída' ? 'text-decoration: line-through; color: gray;' : ''}">
                                    ${tarefa.status || 'Pendente'}
                                </span>
                            </td>
                            <td>
                                ${tarefa.tags && tarefa.tags.length > 0 ? tarefa.tags.map(tag => `<span style="background:#e2e8f0; color:#475569; padding:2px 6px; border-radius:4px; font-size:11px; margin-right:4px;">#${tag.nome}</span>`).join('') : '-'}
                            </td>
                            <td>
                                <div style="display: flex; gap: 5px; align-items: center;">
                                    <button class="btn-editar"
                                        data-id="${tarefa.id}"
                                        data-titulo="${tarefa.titulo || ''}"
                                        data-descricao="${tarefa.descricao || ''}"
                                        data-prazo="${tarefa.prazo ? tarefa.prazo.split('T')[0] : ''}"
                                        data-categoria="${tarefa.id_categoria || ''}"
                                        style="padding: 5px 10px; background: #f0ad4e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">Editar</button>
                                    <button class="btn-excluir"
                                        data-id="${tarefa.id}"
                                        style="padding: 5px 10px; background: #d9534f; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">Excluir</button>
                                </div>
                            </td>
                        `;
                    listaTarefas.appendChild(tr);
                });

            } else {
                mensagemDiv.style.color = '#d9534f';
                mensagemDiv.innerText = respostaServidor.mensagem || 'Erro ao carregar as tarefas.';
            }
        } catch (erro) {
            console.error(erro);
            mensagemDiv.style.color = '#d9534f';
            mensagemDiv.innerText = 'Não foi possível conectar ao servidor para buscar as tarefas.';
        }
    }

    // Evento de envio do formulário (Criar / Atualizar Tarefa) - USANDO TOAST
    formNovaTarefa.addEventListener('submit', async (e) => {
        e.preventDefault();

        const titulo = document.getElementById('tituloTarefa').value;
        const descricao = document.getElementById('descricaoTarefa').value;
        const prazo = document.getElementById('prazoTarefa').value;
        const id_categoria = selectCategoria.value || null;
        const prioridade = document.getElementById('prioridadeTarefa').value || 'Média';
        

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
                body: JSON.stringify({ titulo, descricao, prazo, id_categoria, prioridade })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                // Toast condicional para Criação ou Atualização de Tarefa
                if (isEditando) {
                    mostrarToast('Tarefa atualizada com sucesso!', 'sucesso');
                } else {
                    mostrarToast('Tarefa criada com sucesso!', 'sucesso');
                }

                document.getElementById('tituloTarefa').value = '';
                document.getElementById('descricaoTarefa').value = '';
                document.getElementById('prazoTarefa').value = '';
                selectCategoria.value = '';
                idTarefaEditando = null;

                const btnSubmit = formNovaTarefa.querySelector('button[type="submit"]');
                if (btnSubmit) btnSubmit.innerText = 'Adicionar Tarefa';

                carregarTarefas();
            } else {
                mostrarToast(resultado.mensagem || resultado.erro || 'Erro ao salvar tarefa.', 'erro');
            }
        } catch (erro) {
            console.error('Erro detalhado na requisição:', erro);
            mostrarToast('Não foi possível conectar ao servidor.', 'erro');
        }
    });

    async function carregarTags() {
        try {
            const resposta = await fetch('http://localhost:3000/api/tags', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const resultado = await resposta.json();
            const container = document.getElementById('containerTags');

            if (resposta.ok && container) {
                container.innerHTML = resultado.dados.map(tag => `
                <label style="margin-right: 10px;">
                    <input type="checkbox" name="tags" value="${tag.id}"> ${tag.nome}
                </label>
            `).join('');
            }
        } catch (erro) {
            console.error('Erro ao carregar tags:', erro);
        }
    }

    // Eventos de clique na tabela (Editar e Excluir Tarefa)
    listaTarefas.addEventListener('click', async (e) => {
        // EXCLUIR TAREFA - USANDO TOAST
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
                        mostrarToast('Tarefa excluída com sucesso!', 'sucesso');
                        carregarTarefas();
                    } else {
                        mostrarToast(resultado.mensagem || resultado.erro || 'Erro ao excluir tarefa.', 'erro');
                    }
                } catch (erro) {
                    console.error('Erro na requisição de exclusão:', erro);
                    mostrarToast('Não foi possível conectar ao servidor.', 'erro');
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    document.getElementById('filtroStatus')?.addEventListener('change', carregarTarefas);
    document.getElementById('filtroCategoria')?.addEventListener('change', carregarTarefas);
    document.getElementById('ordenarPor')?.addEventListener('change', carregarTarefas);

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
                    mostrarToast(`Status alterado para ${novoStatus}!`, 'sucesso');
                    carregarTarefas();
                } else {
                    mostrarToast(resultado.mensagem || 'Erro ao alterar o status.', 'erro');
                    e.target.checked = !e.target.checked;
                }
            } catch (erro) {
                console.error('Erro na requisição:', erro);
                mostrarToast('Não foi possível conectar ao servidor.', 'erro');
                e.target.checked = !e.target.checked;
            }
        }
    });

    carregarCategorias();
    carregarTarefas();
    carregarTags();
    mostrarToast('Bem-vindo ao painel!', 'sucesso');

    // Cadastro de Categoria com Toast
    async function adicionarCategoria(evento) {
        evento.preventDefault();

        const nomeInput = document.getElementById('nomeNovaCategoria');
        const nomeCategoria = nomeInput.value.trim();

        const corInput = document.getElementById('corNovaCategoria');
        const corCategoria = corInput ? corInput.value : '#3498db';

        if (!nomeCategoria) return;

        try {
            const resposta = await fetch('http://localhost:3000/api/categorias', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nome: nomeCategoria,
                    cor: corCategoria
                })
            });

            const resultado = await resposta.json();

            if (resposta.ok) {
                mostrarToast('Categoria adicionada com sucesso!', 'sucesso');
                nomeInput.value = '';
                if (corInput) corInput.value = '';
                carregarCategorias();
            } else {
                mostrarToast(resultado.erro || resultado.mensagem || 'Erro ao adicionar a categoria.', 'erro');
            }
        } catch (erro) {
            console.error(erro);
            mostrarToast('Não foi possível salvar a categoria.', 'erro');
        }
    }

    const formNovaCategoria = document.getElementById('formNovaCategoria');
    if (formNovaCategoria) {
        formNovaCategoria.addEventListener('submit', adicionarCategoria);
    }
});