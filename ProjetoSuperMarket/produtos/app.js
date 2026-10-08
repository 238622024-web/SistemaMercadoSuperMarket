
// ============================================================
// LISTAGEM DE PRODUTOS - SUPERMARKET
// Integração com a API /api/products
// ============================================================

const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const sidebarOverlay = document.getElementById('sidebarOverlay');

const searchInput = document.getElementById('searchInput');
const productsTableBody = document.getElementById('productsTableBody');
const selectAll = document.getElementById('selectAll');

let products = [];
let searchTimer;

// ============================================================
// MENU LATERAL
// ============================================================

if (menuToggle && sidebar && mainContent) {
    menuToggle.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('mobile-visible');

            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        } else {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('expanded');
        }
    });
}

if (sidebarOverlay && sidebar) {
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.remove('mobile-visible');
        sidebarOverlay.classList.remove('active');
    });
}

function toggleSubmenu(event, submenuId) {
    event.preventDefault();

    const submenu = document.getElementById(submenuId);

    if (submenu) {
        submenu.classList.toggle('open');
    }

    event.currentTarget.classList.toggle('expanded');
}

// ============================================================
// FUNÇÕES DE FORMATAÇÃO E SEGURANÇA
// ============================================================

// Evita que textos cadastrados sejam interpretados como HTML.
function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (caractere) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}

function moeda(valor) {
    return Number(valor || 0).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

function unidadeLegivel(unidade) {
    const unidades = {
        un: 'UN',
        kg: 'KG',
        g: 'G',
        l: 'L',
        ml: 'ML',
        cx: 'CX',
        pc: 'PC'
    };

    return unidades[unidade] || unidade || 'UN';
}

function categoriaLegivel(categoria) {
    const categorias = {
        alimentos: 'Alimentos',
        bebidas: 'Bebidas',
        higiene: 'Higiene e Limpeza',
        frios: 'Frios e Laticínios',
        hortifruti: 'Hortifrúti',
        padaria: 'Padaria',
        acougue: 'Açougue',
        outros: 'Outros'
    };

    return categorias[categoria] || categoria || 'Sem categoria';
}

function notificar(mensagem) {
    window.alert(mensagem);
}

// ============================================================
// BUSCAR PRODUTOS NO BACKEND
// ============================================================

async function carregarProdutos() {
    if (!productsTableBody) return;

    productsTableBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align:center;padding:40px">
                Carregando produtos...
            </td>
        </tr>
    `;

    try {
        const termo = searchInput
            ? searchInput.value.trim()
            : '';

        const url = new URL(
            '/api/products',
            window.location.origin
        );

        // Exibe também os produtos desativados.
        url.searchParams.set('active', 'all');

        if (termo) {
            url.searchParams.set('search', termo);
        }

        const resposta = await fetch(url);

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.error ||
                'Não foi possível carregar os produtos.'
            );
        }

        products = Array.isArray(resultado)
            ? resultado
            : (resultado.data || []);

        renderizarProdutos(products);

    } catch (error) {
        console.error('Erro ao carregar produtos:', error);

        productsTableBody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;padding:40px;color:#b91c1c">
                    ${escaparHTML(error.message)}
                    <br>
                    <button type="button"
                        onclick="carregarProdutos()"
                        style="margin-top:12px">
                        Tentar novamente
                    </button>
                </td>
            </tr>
        `;
    }
}

// ============================================================
// EXIBIR OS PRODUTOS NA TABELA EXISTENTE
// ============================================================

function renderizarProdutos(lista) {
    if (!productsTableBody) return;

    if (!lista.length) {
        productsTableBody.innerHTML = `
            <tr>
                <td colspan="8"
                    style="text-align:center;padding:48px 20px">
                    Nenhum produto encontrado.
                    Cadastre um produto para começar.
                </td>
            </tr>
        `;

        if (selectAll) {
            selectAll.checked = false;
        }

        return;
    }

    productsTableBody.innerHTML = lista.map((produto) => {
        const nome = escaparHTML(produto.nome);
        const codigo = escaparHTML(produto.codigo);

        const categoria = escaparHTML(
            categoriaLegivel(produto.categoria)
        );

        const unidade = escaparHTML(
            unidadeLegivel(produto.unidade)
        );

        const ativo = produto.ativo !== false;
        const estoque = Number(produto.estoque_atual || 0);
        const minimo = Number(produto.estoque_minimo || 0);

        const status = !ativo
            ? 'Inativo'
            : (estoque <= minimo ? 'Estoque baixo' : 'Ativo');

        const statusClass = !ativo
            ? 'inactive'
            : (estoque <= minimo ? 'low-stock' : 'active');

        const id = Number(produto.id);

        return `
            <tr data-product-id="${id}">
                <td>
                    <input
                        type="checkbox"
                        class="row-checkbox"
                        aria-label="Selecionar ${nome}"
                        value="${id}"
                    >
                </td>

                <td>
                    <div class="product-details">
                        <h4>${nome}</h4>
                        <small>${escaparHTML(produto.marca || '')}</small>
                    </div>
                </td>

                <td>${codigo}</td>
                <td>${categoria}</td>
                <td>${moeda(produto.preco_venda)}</td>

                <td>
                    ${estoque.toLocaleString('pt-BR')} ${unidade}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${status}
                    </span>
                </td>

                <td>
                    <div class="product-actions">
                        <button
                            type="button"
                            title="Consultar produto"
                            aria-label="Consultar ${nome}"
                            onclick="editarProduto(${id})">
                            Consultar
                        </button>

                        ${
                            ativo
                                ? `
                                    <button
                                        type="button"
                                        title="Desativar produto"
                                        aria-label="Desativar ${nome}"
                                        onclick="desativarProduto(${id})">
                                        Desativar
                                    </button>
                                `
                                : ''
                        }
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    document.querySelectorAll('.row-checkbox').forEach((checkbox) => {
        checkbox.addEventListener('change', atualizarSelecao);
    });

    if (selectAll) {
        selectAll.checked = false;
    }
}

// ============================================================
// SELEÇÃO DE PRODUTOS
// ============================================================

function atualizarSelecao() {
    if (!selectAll) return;

    const caixas = Array.from(
        document.querySelectorAll('.row-checkbox')
    );

    selectAll.checked =
        caixas.length > 0 &&
        caixas.every((caixa) => caixa.checked);
}

if (selectAll) {
    selectAll.addEventListener('change', () => {
        document.querySelectorAll('.row-checkbox').forEach((caixa) => {
            caixa.checked = selectAll.checked;
        });
    });
}

// ============================================================
// PESQUISA COM PEQUENO INTERVALO ENTRE AS CONSULTAS
// ============================================================

if (searchInput) {
    searchInput.addEventListener('input', () => {
        window.clearTimeout(searchTimer);

        searchTimer = window.setTimeout(() => {
            carregarProdutos();
        }, 250);
    });
}

// ============================================================
// CONSULTAR OS DETALHES DO PRODUTO
// A edição completa será implementada na próxima etapa.
// ============================================================

async function editarProduto(id) {
    const produto = products.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!produto) {
        notificar(
            'Produto não encontrado na lista atual. Atualize a página e tente novamente.'
        );

        return;
    }

    const detalhes = [
        `Nome: ${produto.nome}`,
        `Código: ${produto.codigo}`,
        `Categoria: ${categoriaLegivel(produto.categoria)}`,
        `Marca: ${produto.marca || '-'}`,
        `Preço de custo: ${moeda(produto.preco_custo)}`,
        `Preço de venda: ${moeda(produto.preco_venda)}`,
        `Estoque atual: ${produto.estoque_atual} ${unidadeLegivel(produto.unidade)}`,
        `Estoque mínimo: ${produto.estoque_minimo}`,
        `Status: ${produto.ativo ? 'Ativo' : 'Inativo'}`
    ];

    notificar(detalhes.join('\n'));
}

// ============================================================
// DESATIVAR PRODUTO SEM EXCLUÍ-LO DO BANCO
// ============================================================

async function desativarProduto(id) {
    const produto = products.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!produto) {
        notificar('Produto não encontrado.');
        return;
    }

    if (!window.confirm(
        `Deseja desativar o produto "${produto.nome}"? ` +
        'O registro será preservado no banco de dados.'
    )) {
        return;
    }

    try {
        const resposta = await fetch(
            `/api/products/${id}/deactivate`,
            { method: 'PATCH' }
        );

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.error ||
                'Não foi possível desativar o produto.'
            );
        }

        notificar('Produto desativado com sucesso.');

        await carregarProdutos();

    } catch (error) {
        console.error('Erro ao desativar produto:', error);

        notificar(
            error.message || 'Erro ao desativar o produto.'
        );
    }
}

// ============================================================
// DISPONIBILIZAR FUNÇÕES PARA OS BOTÕES HTML
// ============================================================

window.carregarProdutos = carregarProdutos;
window.editarProduto = editarProduto;
window.desativarProduto = desativarProduto;

window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        if (sidebar) {
            sidebar.classList.remove('mobile-visible');
        }

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
        }
    }
});

// ============================================================
// CARREGAMENTO INICIAL
// ============================================================

carregarProdutos();