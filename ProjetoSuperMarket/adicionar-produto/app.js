
// ============================================================
// CADASTRO DE PRODUTOS - SUPERMARKET
// Integração com a API /api/products
// ============================================================

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');

    if (!sidebar || !mainContent) return;

    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('mobile-visible');
    } else {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    }
}

function pageToggleSubmenu(event, submenuId) {
    event.preventDefault();

    const submenu = document.getElementById(submenuId);
    const link = event.currentTarget;

    if (submenu) submenu.classList.toggle('open');
    if (link) link.classList.toggle('expanded');
}

// ============================================================
// ELEMENTOS DO FORMULÁRIO E IMAGENS
// ============================================================

const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const productForm = document.getElementById('productForm');

let uploadedImages = [];

if (imageUpload) {
    imageUpload.addEventListener('dragover', (event) => {
        event.preventDefault();
        imageUpload.classList.add('dragover');
    });

    imageUpload.addEventListener('dragleave', () => {
        imageUpload.classList.remove('dragover');
    });

    imageUpload.addEventListener('drop', (event) => {
        event.preventDefault();
        imageUpload.classList.remove('dragover');
        handleFiles(event.dataTransfer.files);
    });
}

function handleImageUpload(event) {
    handleFiles(event.target.files);
}

function handleFiles(files) {
    Array.from(files || []).forEach((file) => {
        if (!file.type.startsWith('image/')) {
            showNotification(
                'Selecione apenas arquivos de imagem.',
                'error'
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            showNotification(
                'Cada imagem deve ter no máximo 5 MB.',
                'error'
            );
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            uploadedImages.push(event.target.result);
            displayImages();
        };

        reader.readAsDataURL(file);
    });
}

function displayImages() {
    if (!imagePreview) return;

    imagePreview.innerHTML = '';

    imagePreview.classList.toggle(
        'active',
        uploadedImages.length > 0
    );

    uploadedImages.forEach((src, index) => {
        const item = document.createElement('div');
        item.className = 'preview-item';

        const image = document.createElement('img');
        image.src = src;
        image.alt = `Pré-visualização ${index + 1}`;

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'preview-remove';
        remove.textContent = '×';
        remove.setAttribute('aria-label', 'Remover imagem');

        remove.addEventListener('click', () => {
            removeImage(index);
        });

        item.append(image, remove);
        imagePreview.appendChild(item);
    });
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    displayImages();

    const input = document.getElementById('productImage');

    if (input && uploadedImages.length === 0) {
        input.value = '';
    }
}

// ============================================================
// NOTIFICAÇÕES
// ============================================================

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notificationText');

    if (!notification || !notificationText) {
        window.alert(message);
        return;
    }

    notificationText.textContent = message;
    notification.className = `notification ${type} show`;

    window.setTimeout(() => {
        notification.classList.remove('show');
    }, 3500);
}

// ============================================================
// LEITURA E CONVERSÃO DOS CAMPOS
// ============================================================

function valorCampo(id) {
    const campo = document.getElementById(id);
    return campo ? campo.value.trim() : '';
}

function valorNumero(id, padrao = 0) {
    const valor = valorCampo(id);

    if (!valor) return padrao;

    const convertido = Number(valor.replace(',', '.'));

    return Number.isFinite(convertido) ? convertido : NaN;
}

// ============================================================
// ENVIO DO CADASTRO PARA A API
// ============================================================

if (productForm) {
    productForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const submitButton = productForm.querySelector('[type="submit"]');

        const textoOriginal = submitButton
            ? submitButton.textContent
            : '';

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'Salvando...';
        }

        const produto = {
            nome: valorCampo('productName'),
            codigo: valorCampo('productCode'),
            categoria: valorCampo('productCategory'),
            marca: valorCampo('productBrand'),
            descricao: valorCampo('productDescription'),

            preco_custo: valorNumero('productCost'),
            preco_venda: valorNumero('productPrice'),

            estoque_atual: valorNumero('productStock'),
            estoque_minimo: valorNumero('productMinStock'),

            unidade: valorCampo('productUnit'),
            codigo_barras: valorCampo('productBarcode'),
            fornecedor: valorCampo('productSupplier'),
            data_validade: valorCampo('productValidity'),

            peso_gramas: valorNumero('productWeight', null),
            localizacao: valorCampo('productLocation'),

            // O upload definitivo será implementado no Supabase Storage.
            imagem_url: null
        };

        const camposObrigatorios = [
            ['productName', 'Nome do produto'],
            ['productCode', 'Código do produto'],
            ['productCategory', 'Categoria'],
            ['productBrand', 'Marca'],
            ['productUnit', 'Unidade']
        ];

        const campoVazio = camposObrigatorios.find(
            ([id]) => !valorCampo(id)
        );

        if (campoVazio) {
            showNotification(
                `Preencha o campo: ${campoVazio[1]}.`,
                'error'
            );

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = textoOriginal;
            }

            return;
        }

        const numerosInvalidos = [
            produto.preco_custo,
            produto.preco_venda,
            produto.estoque_atual,
            produto.estoque_minimo
        ].some(Number.isNaN) ||
            (
                produto.peso_gramas !== null &&
                Number.isNaN(produto.peso_gramas)
            );

        if (numerosInvalidos) {
            showNotification(
                'Confira os campos numéricos antes de salvar.',
                'error'
            );

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = textoOriginal;
            }

            return;
        }

        try {
            const resposta = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(produto)
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.error ||
                    'Não foi possível cadastrar o produto.'
                );
            }

            showNotification(
                'Produto cadastrado no banco de dados com sucesso!',
                'success'
            );

            productForm.reset();

            uploadedImages = [];
            displayImages();
            calculateProfit();

        } catch (error) {
            console.error('Falha ao cadastrar produto:', error);

            showNotification(
                error.message || 'Erro de comunicação com o servidor.',
                'error'
            );

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = textoOriginal;
            }
        }
    });
}

// ============================================================
// CÁLCULO DA MARGEM DE LUCRO
// ============================================================

function calculateProfit() {
    const custo = valorNumero('productCost', 0);
    const preco = valorNumero('productPrice', 0);

    const margem = document.getElementById('profitMargin');

    if (margem && custo > 0 && Number.isFinite(preco)) {
        margem.textContent =
            `${(((preco - custo) / custo) * 100).toFixed(2)}%`;
    }
}

['productCost', 'productPrice'].forEach((id) => {
    const campo = document.getElementById(id);

    if (campo) {
        campo.addEventListener('input', calculateProfit);
    }
});