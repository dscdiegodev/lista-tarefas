document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = 'login.html'; return; }

    function mostrarToast(msg, tipo = 'sucesso') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const t = document.createElement('div');
        t.innerText = msg;
        t.style.cssText = `padding: 12px 20px; border-radius: 6px; color: #fff; margin-top: 8px; background: ${tipo === 'sucesso' ? '#28a745' : '#dc3545'};`;
        container.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    async function carregarTudo() {
        // Carregar Categorias
        const resCat = await fetch('http://localhost:3000/api/categorias', { headers: { 'Authorization': `Bearer ${token}` } });
        const dataCat = await resCat.json();
        if (resCat.ok) {
            document.getElementById('listaCategorias').innerHTML = dataCat.dados.map(c => `
                <tr>
                    <td><span style="display:inline-block;width:12px;height:12px;background:${c.cor};border-radius:50%;margin-right:8px;"></span>${c.nome}</td>
                    <td><code>${c.cor}</code></td>
                    <td><button class="btn-excluir" onclick="deletarCat(${c.id})">Excluir</button></td>
                </tr>
            `).join('') || '<tr><td colspan="3">Nenhuma categoria.</td></tr>';
        }

        // Carregar Tags
        const resTag = await fetch('http://localhost:3000/api/tags', { headers: { 'Authorization': `Bearer ${token}` } });
        const dataTag = await resTag.json();
        if (resTag.ok) {
            document.getElementById('listaTags').innerHTML = dataTag.dados.map(t => `
                <tr>
                    <td><strong>#${t.nome}</strong></td>
                    <td><button class="btn-excluir" onclick="deletarTag(${t.id})">Excluir</button></td>
                </tr>
            `).join('') || '<tr><td colspan="2">Nenhuma tag cadastrada.</td></tr>';
        }
    }

    document.getElementById('formNovaCategoria').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nomeNovaCategoria').value;
        const cor = document.getElementById('corNovaCategoria').value;
        const res = await fetch('http://localhost:3000/api/categorias', {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, cor })
        });
        if (res.ok) { mostrarToast('Categoria criada!'); document.getElementById('formNovaCategoria').reset(); carregarTudo(); }
        else { mostrarToast('Erro ao criar categoria', 'erro'); }
    });

    document.getElementById('formNovaTag').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nomeNovaTag').value;
        const res = await fetch('http://localhost:3000/api/tags', {
            method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome })
        });
        if (res.ok) { mostrarToast('Tag criada!'); document.getElementById('formNovaTag').reset(); carregarTudo(); }
        else { mostrarToast('Erro ao criar tag', 'erro'); }
    });

    window.deletarCat = async (id) => {
        if (confirm('Excluir categoria?')) {
            await fetch(`http://localhost:3000/api/categorias/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            carregarTudo();
        }
    };

    window.deletarTag = async (id) => {
        if (confirm('Excluir tag?')) {
            await fetch(`http://localhost:3000/api/tags/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            carregarTudo();
        }
    };

    carregarTudo();
});