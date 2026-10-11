
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

function pageToggleSubmenu(event, submenuId) {
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
                            class="product-action-btn product-action-view"
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
                                        class="product-action-btn product-action-disable"
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
// ============================================================

const productDetailsModal = document.getElementById('productDetailsModal');
const deactivateConfirmModal = document.getElementById('deactivateConfirmModal');
const deactivateConfirmMessage = document.getElementById('deactivateConfirmMessage');
const cancelDeactivateProduct = document.getElementById('cancelDeactivateProduct');
const confirmDeactivateProduct = document.getElementById('confirmDeactivateProduct');
const productDetailsList = document.getElementById('productDetailsList');
const closeProductDetails = document.getElementById('closeProductDetails');
const productDetailsActions = document.getElementById('productDetailsActions');
const editProductButton = document.getElementById('editProductButton');
const deactivateProductButton = document.getElementById('deactivateProductButton');
const productEditForm = document.getElementById('productEditForm');
const productEditError = document.getElementById('productEditError');
const cancelProductEdit = document.getElementById('cancelProductEdit');
const saveProductEdit = document.getElementById('saveProductEdit');
let productDetailsTrigger;
let productBeingEdited;
let resolveDeactivateConfirmation;
let deactivateConfirmationTrigger;

function fecharConfirmacaoDesativacao(confirmar = false) {
    if (!deactivateConfirmModal || deactivateConfirmModal.hidden) return;

    deactivateConfirmModal.hidden = true;
    if (!productDetailsModal || productDetailsModal.hidden) {
        document.body.classList.remove('modal-open');
    }

    const resolver = resolveDeactivateConfirmation;
    resolveDeactivateConfirmation = null;
    resolver?.(confirmar);
    deactivateConfirmationTrigger?.focus();
}

function confirmarDesativacao(produto) {
    if (!deactivateConfirmModal || !deactivateConfirmMessage) {
        return Promise.reject(
            new Error('Não foi possível abrir a confirmação de desativação.')
        );
    }

    if (resolveDeactivateConfirmation) {
        return Promise.resolve(false);
    }

    deactivateConfirmationTrigger = document.activeElement;
    deactivateConfirmMessage.textContent =
        `Tem certeza de que deseja desativar "${produto.nome}"?`;
    deactivateConfirmModal.hidden = false;
    document.body.classList.add('modal-open');
    cancelDeactivateProduct?.focus();

    return new Promise((resolve) => {
        resolveDeactivateConfirmation = resolve;
    });
}

function formatarData(valor) {
    if (!valor) return '-';

    const data = String(valor).match(/^(\d{4})-(\d{2})-(\d{2})$/);

    return data ? `${data[3]}/${data[2]}/${data[1]}` : valor;
}

function fornecedorLegivel(fornecedor) {
    const fornecedores = {
        fornecedor1: 'Distribuidora ABC',
        fornecedor2: 'Atacado XYZ',
        fornecedor3: 'Fornecedor Central'
    };

    return fornecedores[fornecedor] || fornecedor;
}

function fecharDetalhesProduto(restaurarFoco = true) {
    if (!productDetailsModal) return;

    productDetailsModal.hidden = true;
    document.body.classList.remove('modal-open');
    if (restaurarFoco) {
        productDetailsTrigger?.focus();
    }
}

function mostrarDetalhesProduto(produto) {
    if (!productDetailsModal || !productDetailsList) {
        notificar('Não foi possível abrir os detalhes do produto.');
        return;
    }

    const detalhes = [
        ['Nome do produto', produto.nome],
        ['Código/SKU', produto.codigo],
        ['Categoria', categoriaLegivel(produto.categoria)],
        ['Marca', produto.marca],
        ['Descrição', produto.descricao],
        ['Preço de custo', moeda(produto.preco_custo)],
        ['Preço de venda', moeda(produto.preco_venda)],
        ['Estoque atual', `${Number(produto.estoque_atual || 0).toLocaleString('pt-BR')} ${unidadeLegivel(produto.unidade)}`],
        ['Estoque mínimo', `${Number(produto.estoque_minimo || 0).toLocaleString('pt-BR')} ${unidadeLegivel(produto.unidade)}`],
        ['Unidade de medida', unidadeLegivel(produto.unidade)],
        ['Código de barras', produto.codigo_barras],
        ['Fornecedor', fornecedorLegivel(produto.fornecedor)],
        ['Data de validade', formatarData(produto.data_validade)],
        ['Peso', produto.peso_gramas == null ? '-' : `${Number(produto.peso_gramas).toLocaleString('pt-BR')} g`],
        ['Localização', produto.localizacao],
        ['Status', produto.ativo === false ? 'Inativo' : 'Ativo']
    ];

    productDetailsList.replaceChildren();

    detalhes.forEach(([rotulo, valor]) => {
        const item = document.createElement('div');
        item.className = 'product-detail-item';

        const titulo = document.createElement('dt');
        titulo.textContent = rotulo;

        const conteudo = document.createElement('dd');
        conteudo.textContent = valor == null || valor === '' ? '-' : String(valor);

        item.append(titulo, conteudo);
        productDetailsList.appendChild(item);
    });

    document.getElementById('productDetailsTitle').textContent =
        produto.nome || 'Detalhes do produto';
    productBeingEdited = produto;
    productEditForm.hidden = true;
    productDetailsList.hidden = false;
    productDetailsActions.hidden = false;
    deactivateProductButton.hidden = produto.ativo === false;
    productEditError.hidden = true;
    productDetailsTrigger = document.activeElement;
    productDetailsModal.hidden = false;
    document.body.classList.add('modal-open');
    closeProductDetails?.focus();
}

function abrirFormularioEdicao() {
    if (!productBeingEdited || !productEditForm) return;

    const campos = productEditForm.elements;
    const camposTexto = [
        'nome', 'codigo', 'categoria', 'marca', 'descricao',
        'unidade', 'codigo_barras', 'fornecedor', 'data_validade',
        'localizacao'
    ];

    camposTexto.forEach((nome) => {
        campos.namedItem(nome).value = productBeingEdited[nome] || '';
    });

    ['preco_custo', 'preco_venda', 'estoque_atual', 'estoque_minimo', 'peso_gramas']
        .forEach((nome) => {
            const valor = productBeingEdited[nome];
            campos.namedItem(nome).value = valor == null ? '' : valor;
        });

    const fornecedor = campos.namedItem('fornecedor');
    if (fornecedor.value && fornecedor.value !== productBeingEdited.fornecedor) {
        fornecedor.value = productBeingEdited.fornecedor;
    }
    if (productBeingEdited.fornecedor && !fornecedor.value) {
        const opcao = document.createElement('option');
        opcao.value = productBeingEdited.fornecedor;
        opcao.textContent = fornecedorLegivel(productBeingEdited.fornecedor);
        fornecedor.appendChild(opcao);
        fornecedor.value = productBeingEdited.fornecedor;
    }

    document.getElementById('productDetailsTitle').textContent =
        'Editar produto';
    productDetailsList.hidden = true;
    productDetailsActions.hidden = true;
    productEditError.hidden = true;
    productEditForm.hidden = false;
    campos.namedItem('nome').focus();
}

function voltarParaDetalhes() {
    productEditForm.hidden = true;
    productDetailsList.hidden = false;
    productDetailsActions.hidden = false;
    productEditError.hidden = true;
    document.getElementById('productDetailsTitle').textContent =
        productBeingEdited?.nome || 'Detalhes do produto';
    editProductButton?.focus();
}

async function salvarEdicaoProduto(event) {
    event.preventDefault();

    if (!productBeingEdited || !productEditForm) return;

    const submitLabel = saveProductEdit.textContent;
    saveProductEdit.disabled = true;
    saveProductEdit.textContent = 'Salvando...';
    productEditError.hidden = true;

    const form = new FormData(productEditForm);
    const produtoAtualizado = Object.fromEntries(form.entries());
    ['preco_custo', 'preco_venda', 'estoque_atual', 'estoque_minimo', 'peso_gramas']
        .forEach((campo) => {
            produtoAtualizado[campo] = form.get(campo) === ''
                ? null
                : Number(form.get(campo));
        });

    try {
        const resposta = await fetch(`/api/products/${productBeingEdited.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(produtoAtualizado)
        });
        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(resultado.error || 'Não foi possível atualizar o produto.');
        }

        const produtoSalvo = resultado.data;
        products = products.map((produto) =>
            Number(produto.id) === Number(produtoSalvo.id)
                ? produtoSalvo
                : produto
        );
        renderizarProdutos(products);
        const triggerOriginal = productDetailsTrigger;
        mostrarDetalhesProduto(produtoSalvo);
        productDetailsTrigger = triggerOriginal;
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        productEditError.textContent =
            error.message || 'Erro de comunicação ao atualizar o produto.';
        productEditError.hidden = false;
    } finally {
        saveProductEdit.disabled = false;
        saveProductEdit.textContent = submitLabel;
    }
}

function editarProduto(id) {
    const produto = products.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!produto) {
        notificar(
            'Produto não encontrado na lista atual. Atualize a página e tente novamente.'
        );

        return;
    }

    mostrarDetalhesProduto(produto);
}

editProductButton?.addEventListener('click', abrirFormularioEdicao);
deactivateProductButton?.addEventListener('click', () => {
    if (productBeingEdited) {
        desativarProduto(productBeingEdited.id, true);
    }
});
cancelProductEdit?.addEventListener('click', voltarParaDetalhes);
productEditForm?.addEventListener('submit', salvarEdicaoProduto);
closeProductDetails?.addEventListener('click', fecharDetalhesProduto);

productDetailsModal?.addEventListener('click', (event) => {
    if (event.target === productDetailsModal) {
        fecharDetalhesProduto();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;

    if (deactivateConfirmModal && !deactivateConfirmModal.hidden) {
        fecharConfirmacaoDesativacao(false);
    } else if (productDetailsModal && !productDetailsModal.hidden) {
        fecharDetalhesProduto();
    }
});

cancelDeactivateProduct?.addEventListener('click', () => {
    fecharConfirmacaoDesativacao(false);
});

confirmDeactivateProduct?.addEventListener('click', () => {
    fecharConfirmacaoDesativacao(true);
});

deactivateConfirmModal?.addEventListener('click', (event) => {
    if (event.target === deactivateConfirmModal) {
        fecharConfirmacaoDesativacao(false);
    }
});

// ============================================================
// DESATIVAR PRODUTO SEM EXCLUÍ-LO DO BANCO
// ============================================================

async function desativarProduto(id, fecharModalAposDesativar = false) {
    const produto = products.find(
        (item) => Number(item.id) === Number(id)
    );

    if (!produto) {
        notificar('Produto não encontrado.');
        return;
    }

    const confirmado = await confirmarDesativacao(produto);

    if (!confirmado) {
        return;
    }

    const botaoDesativar = fecharModalAposDesativar
        ? deactivateProductButton
        : productsTableBody?.querySelector(
            `tr[data-product-id="${Number(id)}"] .product-action-disable`
        );

    if (botaoDesativar) {
        botaoDesativar.disabled = true;
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

        if (fecharModalAposDesativar) {
            fecharDetalhesProduto(false);
        }

        notificar('Produto desativado com sucesso.');

        await carregarProdutos();

    } catch (error) {
        console.error('Erro ao desativar produto:', error);

        notificar(
            error.message || 'Erro ao desativar o produto.'
        );
    } finally {
        if (botaoDesativar) {
            botaoDesativar.disabled = false;
        }
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