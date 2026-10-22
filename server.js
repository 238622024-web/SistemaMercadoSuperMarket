
 // ============================================================
 // API DO SISTEMA SUPERMARKET
 // Node.js + Express + Supabase (PostgreSQL)
 // ============================================================

require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { randomUUID } = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_PATH = path.join(__dirname, 'dist');
const FRONTEND_INDEX = path.join(FRONTEND_PATH, 'index.html');
const EMAIL_FIELDS = ['SMTP_HOST', 'SMTP_USER', 'SMTP_PASSWORD', 'SMTP_FROM'];

// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function isServiceRoleKey(key) {
    if (key.startsWith('sb_secret_')) {
        return true;
    }
    if (!key.startsWith('eyJ')) {
        return false;
    }

    try {
        const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString('utf8'));
        return claims.role === 'service_role';
    } catch {
        return false;
    }
}

const hasServiceRoleKey = isServiceRoleKey(serviceRoleKey);

// A chave secreta deve ficar exclusivamente no backend.
// Não coloque essa chave em arquivos JavaScript do navegador.
const supabaseKey =
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
    supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey, {
              auth: {
                  autoRefreshToken: false,
                  persistSession: false
              }
          })
        : null;

const supabaseAdmin =
    supabaseUrl && hasServiceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey, {
              auth: {
                  autoRefreshToken: false,
                  persistSession: false
              }
          })
        : null;

// ============================================================
// CONFIGURAÇÕES DO EXPRESS
// ============================================================

app.disable('x-powered-by');

app.use(express.json({ limit: '8mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const UNIDADES_PERMITIDAS = new Set([
    'un', 'kg', 'g', 'l', 'ml', 'cx', 'pc'
]);

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function textoOpcional(valor) {
    if (
        valor === undefined ||
        valor === null ||
        String(valor).trim() === ''
    ) {
        return null;
    }

    return String(valor).trim();
}

function decodificarImagemProduto(dataUrl) {
    const correspondencia = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/]+={0,2})$/.exec(String(dataUrl || ''));
    if (!correspondencia) {
        throw new Error('A imagem deve ser PNG, JPEG ou WEBP válida.');
    }

    const [, contentType, base64] = correspondencia;
    const buffer = Buffer.from(base64, 'base64');
    if (!buffer.length || buffer.length > 5 * 1024 * 1024 || buffer.toString('base64') !== base64) {
        throw new Error('A imagem deve ter no máximo 5 MB e estar em um formato válido.');
    }

    const signatures = {
        'image/png': buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
        'image/jpeg': buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
        'image/webp': buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'
    };
    if (!signatures[contentType]) {
        throw new Error('O conteúdo do arquivo não corresponde ao formato da imagem.');
    }

    const extension = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' }[contentType];
    return { buffer, contentType, extension };
}

function normalizarCategoria(body) {
    const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';
    const descricao = typeof body?.descricao === 'string' ? body.descricao.trim() : '';
    if (nome.length < 2 || nome.length > 80) {
        throw new Error('O nome da categoria deve ter entre 2 e 80 caracteres.');
    }
    if (descricao.length > 240) {
        throw new Error('A descrição deve ter no máximo 240 caracteres.');
    }
    return { nome, descricao: descricao || null };
}

function slugCategoria(nome) {
    return nome.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 80);
}

function responderErroCategorias(res, error) {
    console.error('Erro no gerenciamento de categorias.', error);
    if (error.code === '42P01' || error.code === 'PGRST205') {
        return res.status(503).json({
            error: 'A tabela public.categorias não foi encontrada. Execute supabase/categories.sql no Supabase.'
        });
    }
    if (error.code === '23505') {
        return res.status(409).json({ error: 'Já existe uma categoria com esse nome.' });
    }
    if (error.code === '23503') {
        return res.status(409).json({
            error: 'Esta categoria possui produtos vinculados. Reclassifique-os antes de excluí-la.'
        });
    }
    if (error.code === '42501') {
        return res.status(403).json({ error: 'O Supabase bloqueou o acesso às categorias. Confira as políticas RLS.' });
    }
    return res.status(500).json({ error: 'Não foi possível concluir a operação de categorias.' });
}

async function removerImagemProduto(objectPath) {
    try {
        const { error } = await supabaseAdmin.storage
            .from('product-images')
            .remove([objectPath]);
        if (error) console.error('Não foi possível remover imagem sem produto associado.', error);
    } catch (error) {
        console.error('Não foi possível remover imagem sem produto associado.', error);
    }
}

function caminhoImagemProduto(url) {
    if (!url || !supabaseUrl) return null;
    try {
        const imageUrl = new URL(url);
        const storageUrl = new URL(supabaseUrl);
        const prefix = '/storage/v1/object/public/product-images/';
        if (imageUrl.origin !== storageUrl.origin || !imageUrl.pathname.startsWith(prefix)) return null;
        return decodeURIComponent(imageUrl.pathname.slice(prefix.length));
    } catch {
        return null;
    }
}

function numero(
    valor,
    nome,
    { obrigatorio = false, minimo = 0, padrao = null } = {}
) {
    if (valor === undefined || valor === null || valor === '') {
        if (obrigatorio) {
            throw new Error(`O campo ${nome} é obrigatório.`);
        }

        return padrao;
    }

    const convertido = Number(valor);

    if (!Number.isFinite(convertido) || convertido < minimo) {
        throw new Error(
            `O campo ${nome} deve ser um número válido maior ou igual a ${minimo}.`
        );
    }

    return convertido;
}

// Normaliza os campos recebidos do formulário.
function normalizarProduto(body, parcial = false) {
    const entrada = body || {};
    const obter = (snake, camel) =>
        entrada[snake] !== undefined
            ? entrada[snake]
            : entrada[camel];

    const produto = {};

    const camposTexto = [
        ['nome', 'name'],
        ['codigo', 'code'],
        ['categoria', 'category'],
        ['marca', 'brand'],
        ['descricao', 'description'],
        ['unidade', 'unit'],
        ['codigo_barras', 'barcode'],
        ['fornecedor', 'supplier'],
        ['data_validade', 'validity'],
        ['localizacao', 'location'],
        ['imagem_url', 'imageUrl']
    ];

    for (const [snake, camel] of camposTexto) {
        const valor = obter(snake, camel);

        if (parcial && valor === undefined) {
            continue;
        }

        produto[snake] = textoOpcional(valor);
    }

    const camposNumericos = [
        ['preco_custo', 'cost', 'Preço de custo', true, null],
        ['preco_venda', 'price', 'Preço de venda', true, null],
        ['estoque_atual', 'stock', 'Estoque atual', false, 0],
        ['estoque_minimo', 'minStock', 'Estoque mínimo', false, 0],
        ['peso_gramas', 'weight', 'Peso em gramas', false, null]
    ];

    for (const [
        snake,
        camel,
        rotulo,
        obrigatorio,
        padrao
    ] of camposNumericos) {
        const valor = obter(snake, camel);

        if (parcial && valor === undefined) {
            continue;
        }

        produto[snake] = numero(valor, rotulo, {
            obrigatorio: obrigatorio && !parcial,
            padrao
        });
    }

    if (!parcial) {
        for (const campo of [
            'nome',
            'codigo',
            'categoria',
            'marca',
            'unidade'
        ]) {
            if (!produto[campo]) {
                throw new Error(
                    `Preencha o campo obrigatório: ${campo}.`
                );
            }
        }

        if (!UNIDADES_PERMITIDAS.has(produto.unidade)) {
            throw new Error(
                'Unidade inválida. Use un, kg, g, l, ml, cx ou pc.'
            );
        }
    } else if (
        produto.unidade !== undefined &&
        produto.unidade !== null &&
        !UNIDADES_PERMITIDAS.has(produto.unidade)
    ) {
        throw new Error(
            'Unidade inválida. Use un, kg, g, l, ml, cx ou pc.'
        );
    }

    if (entrada.ativo !== undefined) {
        if (typeof entrada.ativo !== 'boolean') {
            throw new Error('O campo ativo deve ser verdadeiro ou falso.');
        }

        produto.ativo = entrada.ativo;
    } else if (entrada.active !== undefined) {
        if (typeof entrada.active !== 'boolean') {
            throw new Error('O campo active deve ser verdadeiro ou falso.');
        }

        produto.ativo = entrada.active;
    } else if (!parcial) {
        produto.ativo = true;
    }

    return produto;
}

function normalizarFornecedor(body, parcial = false) {
    const entrada = body || {};
    const fornecedor = {};
    const camposTexto = [
        ['nome', 'Nome', 2, 160],
        ['razao_social', 'Razão social', 0, 180],
        ['cnpj', 'CNPJ', 0, 18],
        ['categoria', 'Categoria', 0, 80],
        ['contato', 'Pessoa de contato', 0, 120],
        ['telefone', 'Telefone', 0, 30],
        ['email', 'E-mail', 0, 254],
        ['endereco', 'Endereço', 0, 220],
        ['cidade', 'Cidade', 0, 100],
        ['estado', 'Estado', 0, 2],
        ['cep', 'CEP', 0, 12],
        ['observacoes', 'Observações', 0, 2000]
    ];

    for (const [campo, rotulo, minimo, maximo] of camposTexto) {
        const valor = entrada[campo];
        if (parcial && valor === undefined) continue;

        const texto = valor === undefined || valor === null ? '' : String(valor).trim();
        if (texto.length < minimo || texto.length > maximo) {
            throw new Error(
                `${rotulo}: informe ${minimo ? `de ${minimo} a ` : 'no máximo '}${maximo} caracteres.`
            );
        }
        fornecedor[campo] = texto || null;
    }

    const email = fornecedor.email;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Informe um endereço de e-mail válido.');
    }

    if (fornecedor.cnpj) {
        const digitos = fornecedor.cnpj.replace(/\D/g, '');
        if (digitos.length !== 14) {
            throw new Error('O CNPJ deve conter 14 dígitos.');
        }
        fornecedor.cnpj = digitos;
    }

    if (fornecedor.estado && !/^[a-z]{2}$/i.test(fornecedor.estado)) {
        throw new Error('Informe a sigla de estado com duas letras.');
    }
    if (fornecedor.estado) fornecedor.estado = fornecedor.estado.toUpperCase();

    if (entrada.prazo_pagamento !== undefined || !parcial) {
        const prazo = entrada.prazo_pagamento === '' || entrada.prazo_pagamento == null
            ? 0
            : Number(entrada.prazo_pagamento);
        if (!Number.isInteger(prazo) || prazo < 0 || prazo > 365) {
            throw new Error('O prazo de pagamento deve ser um número inteiro entre 0 e 365 dias.');
        }
        fornecedor.prazo_pagamento = prazo;
    }

    if (entrada.ativo !== undefined) {
        if (typeof entrada.ativo !== 'boolean') {
            throw new Error('O campo ativo deve ser verdadeiro ou falso.');
        }
        fornecedor.ativo = entrada.ativo;
    } else if (!parcial) {
        fornecedor.ativo = true;
    }

    return fornecedor;
}

function normalizarItensPedido(itens) {
    if (!Array.isArray(itens) || itens.length < 1 || itens.length > 100) {
        throw new Error('Adicione entre 1 e 100 itens ao pedido.');
    }

    let total = 0;
    const normalizados = itens.map((item, index) => {
        const nome = typeof item?.nome === 'string' ? item.nome.trim() : '';
        const codigo = typeof item?.codigo === 'string' ? item.codigo.trim() : '';
        const unidade = typeof item?.unidade === 'string' ? item.unidade.trim() : '';
        const produtoId = item?.produto_id == null || item.produto_id === ''
            ? null
            : Number(item.produto_id);
        const quantidade = Number(item?.quantidade);
        const preco = Number(item?.preco_unitario);
        if (!nome || nome.length > 160) {
            throw new Error(`Informe o nome do item ${index + 1} (até 160 caracteres).`);
        }
        if (!Number.isFinite(quantidade) || quantidade <= 0 || quantidade > 1000000) {
            throw new Error(`A quantidade do item ${index + 1} deve ser maior que zero.`);
        }
        if (!Number.isFinite(preco) || preco < 0 || preco > 999999999) {
            throw new Error(`O preço do item ${index + 1} deve ser um valor válido.`);
        }
        if (produtoId !== null && (!Number.isSafeInteger(produtoId) || produtoId <= 0)) {
            throw new Error(`Selecione um produto válido para o item ${index + 1}.`);
        }
        const subtotal = Math.round(quantidade * preco * 100) / 100;
        total += subtotal;
        return {
            nome,
            produto_id: produtoId,
            codigo: codigo || null,
            unidade: unidade || null,
            quantidade,
            preco_unitario: Math.round(preco * 100) / 100,
            subtotal
        };
    });

    if (!Number.isFinite(total) || total > 9999999999.99) {
        throw new Error('O valor total do pedido excede o limite permitido.');
    }
    return { itens: normalizados, total: Math.round(total * 100) / 100 };
}

function escaparHtml(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, (caractere) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}

function dataIsoValida(valor) {
    if (valor == null || valor === '') return null;
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return undefined;
    const data = new Date(`${valor}T00:00:00.000Z`);
    return Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== valor
        ? undefined
        : valor;
}

// ============================================================
// TRATAMENTO DE ERROS DO SUPABASE
// ============================================================

function responderErroSupabase(res, error) {
    console.error('Erro Supabase:', error);

    if (error.code === '23505') {
        return res.status(409).json({
            error: 'Já existe um produto com esse código ou código de barras.'
        });
    }

    if (
        error.code === '23514' ||
        error.code === '22P02' ||
        error.code === '22007'
    ) {
        return res.status(400).json({
            error: 'Os dados enviados são inválidos. Confira os campos e tente novamente.'
        });
    }

    if (
        error.code === '42P01' ||
        error.code === 'PGRST205'
    ) {
        return res.status(500).json({
            error: 'A tabela public.produtos não foi encontrada. Execute o SQL de criação no Supabase.'
        });
    }

    if (error.code === '42501') {
        return res.status(403).json({
            error: 'O Supabase bloqueou o acesso. Confira a chave do backend e as políticas RLS.'
        });
    }

    return res.status(500).json({
        error: 'Não foi possível concluir a operação no banco de dados.'
    });
}

function responderErroFornecedores(res, error) {
    console.error('Erro ao acessar dados de fornecedores/pedidos:', error);

    if (error.code === '23505') {
        if (!String(error.constraint || '').includes('suppliers_cnpj_unique')) {
            return res.status(409).json({
                error: 'Já existe um registro com estes dados. Atualize a lista e tente novamente.'
            });
        }
        return res.status(409).json({
            error: 'Já existe um fornecedor cadastrado com este CNPJ.'
        });
    }
    if (error.code === '23503' || error.code === '23514' || error.code === '22P02' || error.code === '22007') {
        return res.status(400).json({
            error: 'Os dados enviados são inválidos ou fazem referência a um fornecedor inexistente.'
        });
    }
    if (error.code === '42P01' || error.code === 'PGRST205') {
        return res.status(503).json({
            error: 'As tabelas de fornecedores ainda não foram criadas. Execute supabase/suppliers-purchase-orders.sql no SQL Editor do Supabase.'
        });
    }
    if (error.code === '42501') {
        return res.status(403).json({
            error: 'O Supabase bloqueou o acesso. Verifique a SUPABASE_SERVICE_ROLE_KEY no servidor.'
        });
    }
    return res.status(500).json({
        error: 'Não foi possível concluir a operação de fornecedores/pedidos.'
    });
}

function transporterEmail() {
    const faltando = EMAIL_FIELDS.filter((campo) => !process.env[campo]);
    if (faltando.length) {
        throw new Error(`Configure no servidor: ${faltando.join(', ')}.`);
    }

    const port = Number(process.env.SMTP_PORT || 587);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
        throw new Error('SMTP_PORT deve ser uma porta válida.');
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
}

async function enviarEmailPedido(pedido, fornecedor) {
    if (!fornecedor.email) {
        throw new Error('O fornecedor não possui e-mail cadastrado.');
    }

    const transporter = transporterEmail();
    const itensHtml = pedido.itens.map((item) => `
        <tr>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0">${escaparHtml(item.nome)}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0">${escaparHtml(item.codigo || '-')}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">${item.quantidade} ${escaparHtml(item.unidade || '')}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">R$ ${Number(item.preco_unitario).toFixed(2).replace('.', ',')}</td>
            <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">R$ ${Number(item.subtotal).toFixed(2).replace('.', ',')}</td>
        </tr>
    `).join('');
    const entrega = pedido.data_entrega
        ? `<p><strong>Previsão de entrega:</strong> ${escaparHtml(pedido.data_entrega)}</p>`
        : '';
    const observacoes = pedido.observacoes
        ? `<p><strong>Observações:</strong><br>${escaparHtml(pedido.observacoes).replace(/\n/g, '<br>')}</p>`
        : '';
    const total = Number(pedido.total).toFixed(2).replace('.', ',');

    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: fornecedor.email,
        subject: `Pedido de compra ${pedido.numero} - SuperMarket`,
        text: [
            `Olá${fornecedor.contato ? `, ${fornecedor.contato}` : ''}!`,
            `Segue o pedido de compra ${pedido.numero}.`,
            `Total: R$ ${total}`,
            pedido.data_entrega ? `Previsão de entrega: ${pedido.data_entrega}` : '',
            pedido.observacoes ? `Observações: ${pedido.observacoes}` : ''
        ].filter(Boolean).join('\n'),
        html: `
            <div style="font-family:Arial,sans-serif;color:#1e293b;max-width:720px;margin:0 auto">
                <div style="padding:24px;background:#172554;color:white;border-radius:12px 12px 0 0">
                    <div style="font-size:12px;opacity:.8;letter-spacing:1px">SUPERMARKET</div>
                    <h1 style="font-size:22px;margin:8px 0 0">Pedido de compra ${escaparHtml(pedido.numero)}</h1>
                </div>
                <div style="padding:24px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
                    <p>Olá${fornecedor.contato ? `, ${escaparHtml(fornecedor.contato)}` : ''}!</p>
                    <p>Encaminhamos nossa solicitação de compra para ${escaparHtml(fornecedor.nome)}.</p>
                    ${entrega}
                    <div style="overflow-x:auto">
                        <table style="width:100%;border-collapse:collapse;font-size:13px">
                            <thead><tr style="background:#f8fafc;text-align:left">
                                <th style="padding:10px">Produto</th><th style="padding:10px">Código</th>
                                <th style="padding:10px;text-align:right">Quantidade</th>
                                <th style="padding:10px;text-align:right">Unitário</th>
                                <th style="padding:10px;text-align:right">Subtotal</th>
                            </tr></thead>
                            <tbody>${itensHtml}</tbody>
                        </table>
                    </div>
                    <p style="text-align:right;font-size:18px;font-weight:bold;margin:20px 0">Total: R$ ${total}</p>
                    ${observacoes}
                    <p style="color:#64748b;font-size:12px;margin-top:24px">Mensagem enviada automaticamente pelo sistema SuperMarket.</p>
                </div>
            </div>
        `
    });
}

async function registrarResultadoEmail(pedido, fornecedor) {
    try {
        await enviarEmailPedido(pedido, fornecedor);
    } catch (error) {
        console.error(`Falha ao enviar o pedido ${pedido.numero} para o fornecedor ${fornecedor.id}.`, error);
        const { error: updateError } = await supabaseAdmin
            .from('purchase_orders')
            .update({ email_status: 'failed', email_error: 'Falha no envio SMTP.' })
            .eq('id', pedido.id);
        if (updateError) {
            console.error('Não foi possível registrar a falha de envio do pedido.', updateError);
        }
        return { sent: false };
    }

    const { error } = await supabaseAdmin
        .from('purchase_orders')
        .update({
            email_status: 'sent',
            email_sent_at: new Date().toISOString(),
            email_error: null
        })
        .eq('id', pedido.id);
    if (error) {
        console.error('O e-mail foi enviado, mas não foi possível atualizar o registro do pedido.', error);
        return { sent: true, trackingError: true };
    }
    return { sent: true, trackingError: false };
}

function exigirSupabase(req, res, next) {
    if (!supabase) {
        return res.status(503).json({
            error: 'Supabase não configurado. Configure SUPABASE_URL e uma chave válida no arquivo .env.'
        });
    }

    next();
}

function exigirSupabaseAdmin(req, res, next) {
    if (!supabaseUrl) {
        return res.status(503).json({
            error: 'SUPABASE_URL não está configurada no servidor.'
        });
    }
    if (!hasServiceRoleKey) {
        return res.status(503).json({
            error: 'O cadastro de contas requer uma chave secreta Supabase (sb_secret_...) ou legacy service_role em SUPABASE_SERVICE_ROLE_KEY. A chave publishable/anon não tem permissão administrativa.'
        });
    }

    next();
}

function exigirBancoAdministrativo(req, res, next) {
    if (!supabaseAdmin) {
        return res.status(503).json({
            error: 'Esta função requer SUPABASE_SERVICE_ROLE_KEY configurada no servidor.'
        });
    }
    next();
}

async function exigirUsuario(req, res, next) {
    const token = String(req.get('authorization') || '').match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) {
        return res.status(401).json({ error: 'Entre no sistema para continuar.' });
    }
    if (!supabase) {
        return res.status(503).json({
            error: 'A autenticação do Supabase não está configurada no backend.'
        });
    }

    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return res.status(401).json({ error: 'Sua sessão é inválida ou expirou. Entre novamente.' });
        }

        const appMetadata = user.app_metadata || {};
        if (!['admin', 'cashier', 'product_clerk', 'cashier_product'].includes(appMetadata.role) || appMetadata.is_active === false) {
            return res.status(403).json({ error: 'Esta conta não possui acesso ativo ao sistema.' });
        }

        req.authToken = token;
        req.authUser = user;
        req.userProfile = {
            id: user.id,
            full_name: user.user_metadata?.full_name || user.email,
            email: user.email,
            role: appMetadata.role,
            is_active: appMetadata.is_active !== false,
            must_change_password: appMetadata.must_change_password === true
        };
        return next();
    } catch (error) {
        console.error('Falha ao validar a sessão do usuário.', error);
        return res.status(500).json({ error: 'Não foi possível validar sua sessão.' });
    }
}

function exigirPapel(...roles) {
    return (req, res, next) => {
        if (req.userProfile.must_change_password) {
            return res.status(403).json({ error: 'Altere sua senha inicial antes de usar o sistema.' });
        }
        if (!roles.includes(req.userProfile.role)) {
            return res.status(403).json({ error: 'Seu perfil não tem permissão para esta operação.' });
        }
        return next();
    };
}

function exigirAcessoPdv(req, res, next) {
    return exigirPapel('admin', 'cashier', 'cashier_product')(req, res, next);
}

function exigirTurnosConfigurados(req, res, next) {
    if (!hasServiceRoleKey || !supabaseAdmin) {
        return res.status(503).json({
            error: 'A abertura de caixas requer SUPABASE_SERVICE_ROLE_KEY configurada no servidor.'
        });
    }
    return next();
}

function responderErroTurnos(res, error) {
    console.error('Erro no controle de turnos do PDV.', error);
    if (error.code === '42P01' || error.code === 'PGRST205') {
        return res.status(503).json({
            error: 'A tabela public.pdv_shifts não existe. Execute supabase/pdv-shifts.sql no SQL Editor do Supabase.'
        });
    }
    if (error.code === '23505') {
        return res.status(409).json({
            error: 'Este caixa ou operador já possui um turno aberto. Atualize os turnos e tente novamente.'
        });
    }
    return res.status(500).json({ error: 'Não foi possível concluir a operação do caixa.' });
}

function valorDeCaixaValido(valor) {
    return typeof valor === 'number' &&
        Number.isFinite(valor) &&
        valor >= 0 &&
        valor <= 9999999999.99 &&
        Math.abs(valor * 100 - Math.round(valor * 100)) < 1e-7;
}

app.get(
    '/api/pdv/shifts',
    exigirSupabase,
    exigirUsuario,
    exigirAcessoPdv,
    exigirTurnosConfigurados,
    async (req, res) => {
        const { data: shifts, error } = await supabaseAdmin
            .from('pdv_shifts')
            .select('id, register_number, operator_id, operator_name, operator_role, opened_at, opening_cash')
            .is('closed_at', null)
            .order('opened_at', { ascending: true });

        if (error) {
            return responderErroTurnos(res, error);
        }

        const openShifts = shifts || [];
        return res.json({
            current: openShifts.find((shift) => shift.operator_id === req.authUser.id) || null,
            registers: [1, 2].map((registerNumber) => {
                const shift = openShifts.find((item) => item.register_number === registerNumber);
                return {
                    register_number: registerNumber,
                    occupied: Boolean(shift),
                    operator_name: shift?.operator_name || null,
                    opened_at: shift?.opened_at || null
                };
            })
        });
    }
);

app.post(
    '/api/pdv/shifts',
    exigirSupabase,
    exigirUsuario,
    exigirAcessoPdv,
    exigirTurnosConfigurados,
    async (req, res) => {
        const registerNumber = req.body?.registerNumber;
        const openingCash = req.body?.openingCash;
        if (![1, 2].includes(registerNumber)) {
            return res.status(400).json({ error: 'Selecione o Caixa 1 ou o Caixa 2.' });
        }
        if (!valorDeCaixaValido(openingCash)) {
            return res.status(400).json({ error: 'Informe um valor inicial válido, igual ou maior que zero.' });
        }

        const { data: existing, error: lookupError } = await supabaseAdmin
            .from('pdv_shifts')
            .select('id')
            .is('closed_at', null)
            .or(`register_number.eq.${registerNumber},operator_id.eq.${req.authUser.id}`)
            .limit(1);
        if (lookupError) {
            return responderErroTurnos(res, lookupError);
        }
        if (existing?.length) {
            return res.status(409).json({ error: 'Esse caixa ou operador já tem um turno aberto. Atualize a lista antes de continuar.' });
        }

        const { data, error } = await supabaseAdmin
            .from('pdv_shifts')
            .insert({
                register_number: registerNumber,
                operator_id: req.authUser.id,
                operator_name: req.userProfile.full_name,
                operator_role: req.userProfile.role,
                opening_cash: openingCash
            })
            .select('id, register_number, operator_id, operator_name, operator_role, opened_at, opening_cash')
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({ error: 'Outro operador acabou de abrir esse caixa. Atualize a lista e escolha o outro.' });
            }
            return responderErroTurnos(res, error);
        }

        return res.status(201).json({ data });
    }
);

app.patch(
    '/api/pdv/shifts/:id/close',
    exigirSupabase,
    exigirUsuario,
    exigirAcessoPdv,
    exigirTurnosConfigurados,
    async (req, res) => {
        const closingCash = req.body?.closingCash;
        if (!valorDeCaixaValido(closingCash)) {
            return res.status(400).json({ error: 'Informe o valor contado no fechamento, igual ou maior que zero.' });
        }
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) {
            return res.status(400).json({ error: 'Identificador de turno inválido.' });
        }

        const { data, error } = await supabaseAdmin
            .from('pdv_shifts')
            .update({ closing_cash: closingCash, closed_at: new Date().toISOString() })
            .eq('id', req.params.id)
            .eq('operator_id', req.authUser.id)
            .is('closed_at', null)
            .select('id, register_number, operator_id, operator_name, operator_role, opened_at, opening_cash, closed_at, closing_cash')
            .maybeSingle();

        if (error) {
            return responderErroTurnos(res, error);
        }
        if (!data) {
            return res.status(404).json({ error: 'O turno não está mais aberto ou pertence a outro operador.' });
        }

        return res.json({ data });
    }
);

app.post('/api/auth/login', exigirSupabase, async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!email || !password) {
        return res.status(400).json({ error: 'Informe o e-mail e a senha.' });
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error || !data.session) {
            return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
        }
        return res.json({ session: data.session });
    } catch (error) {
        console.error('Não foi possível autenticar o usuário.', error);
        return res.status(500).json({ error: 'Não foi possível entrar no sistema.' });
    }
});

app.post('/api/auth/refresh', exigirSupabase, async (req, res) => {
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';
    if (!refreshToken) {
        return res.status(400).json({ error: 'Token de sessão ausente. Entre novamente.' });
    }

    try {
        const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
        if (error || !data.session) {
            return res.status(401).json({ error: 'Sua sessão expirou. Entre novamente.' });
        }
        return res.json({ session: data.session });
    } catch (error) {
        console.error('Não foi possível renovar a sessão.', error);
        return res.status(500).json({ error: 'Não foi possível renovar a sessão.' });
    }
});

// ============================================================
// ROTA DE VERIFICAÇÃO DO SERVIDOR
// ============================================================

app.get('/api/health', (req, res) => {
    res.json({
        ok: true,
        service: 'SuperMarket API',
        supabaseConfigured: Boolean(supabase)
    });
});

app.get('/api/me', exigirSupabase, exigirUsuario, (req, res) => {
    res.json({ user: req.userProfile });
});

app.patch('/api/me/profile', exigirSupabase, exigirUsuario, async (req, res) => {
    const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (fullName.length < 2 || fullName.length > 120) {
        return res.status(400).json({ error: 'Informe um nome de 2 a 120 caracteres.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Informe um e-mail válido.' });
    }

    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            method: 'PUT',
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${req.authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email === req.authUser.email?.toLowerCase() ? undefined : email,
                data: { ...req.authUser.user_metadata, full_name: fullName }
            })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            if (response.status === 422 || response.status === 409) {
                return res.status(400).json({ error: 'Não foi possível atualizar o perfil. Verifique o e-mail e tente novamente.' });
            }
            console.error('Supabase não aceitou a atualização do perfil.', { status: response.status, code: result.code });
            return res.status(502).json({ error: 'Não foi possível atualizar o perfil no Supabase.' });
        }

        const emailChangePending = Boolean(result.new_email);
        return res.json({
            user: {
                ...req.userProfile,
                full_name: fullName,
                email: result.new_email ? req.userProfile.email : result.email || req.userProfile.email
            },
            emailChangePending,
            requestedEmail: emailChangePending ? email : null
        });
    } catch (error) {
        console.error('Falha ao atualizar o perfil do usuário.', error);
        return res.status(502).json({ error: 'Não foi possível comunicar com o Supabase para atualizar o perfil.' });
    }
});

app.patch('/api/me/password', exigirSupabase, exigirUsuario, async (req, res) => {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8) {
        return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' });
    }
    if (req.userProfile.must_change_password && !hasServiceRoleKey) {
        return res.status(503).json({
            error: 'A troca obrigatória da senha inicial requer SUPABASE_SERVICE_ROLE_KEY configurada no backend.'
        });
    }

    const currentPassword = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    if (!req.userProfile.must_change_password) {
        if (!currentPassword) {
            return res.status(400).json({ error: 'Informe sua senha atual para confirmar a alteração.' });
        }

        try {
            const verification = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: { apikey: supabaseKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: req.authUser.email, password: currentPassword })
            });
            if (verification.status === 400 || verification.status === 401) {
                return res.status(401).json({ error: 'A senha atual está incorreta.' });
            }
            if (!verification.ok) {
                console.error('Falha ao confirmar a senha atual.', { status: verification.status });
                return res.status(502).json({ error: 'Não foi possível confirmar sua senha atual no Supabase.' });
            }
        } catch (error) {
            console.error('Falha ao confirmar a senha atual.', error);
            return res.status(502).json({ error: 'Não foi possível comunicar com o Supabase para confirmar sua senha.' });
        }
    }

    try {
        const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
            method: 'PUT',
            headers: {
                apikey: supabaseKey,
                Authorization: `Bearer ${req.authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ password })
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) {
            console.error('Supabase não aceitou a atualização da senha.', { status: response.status, code: result.code });
            return res.status(400).json({ error: 'Não foi possível atualizar a senha. Verifique os requisitos e tente novamente.' });
        }

        if (req.userProfile.must_change_password && hasServiceRoleKey && supabaseAdmin) {
            const { error } = await supabaseAdmin.auth.admin.updateUserById(req.authUser.id, {
                app_metadata: {
                    ...req.authUser.app_metadata,
                    must_change_password: false
                }
            });
            if (error) {
                console.error('Senha atualizada, mas não foi possível remover a exigência de troca inicial.', error);
                return res.status(500).json({ error: 'A senha foi atualizada, mas a configuração inicial da conta não foi concluída. Procure o administrador.' });
            }
        }

        return res.json({ message: 'Senha atualizada.' });
    } catch (error) {
        console.error('Falha ao atualizar a senha do usuário.', error);
        return res.status(502).json({ error: 'Não foi possível comunicar com o Supabase para atualizar a senha.' });
    }
});

app.get(
    '/api/collaborators',
    exigirSupabaseAdmin,
    exigirUsuario,
    exigirPapel('admin'),
    async (req, res) => {
        const collaborators = [];
        for (let page = 1; page <= 20; page += 1) {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
            if (error) {
                console.error('Não foi possível listar os colaboradores.', error);
                return res.status(500).json({ error: 'Não foi possível carregar os colaboradores.' });
            }
            collaborators.push(...data.users
                .filter((user) => ['admin', 'cashier', 'product_clerk', 'cashier_product'].includes(user.app_metadata?.role))
                .map((user) => ({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || user.email,
                    email: user.email,
                    role: user.app_metadata.role,
                    is_active: user.app_metadata?.is_active !== false,
                    created_at: user.created_at
                })));
            if (data.users.length < 1000) break;
        }
        if (collaborators.length === 0) {
            return res.json({ data: [] });
        }
        if (collaborators.length > 20000) {
            return res.status(500).json({ error: 'Não foi possível carregar os colaboradores.' });
        }
        collaborators.sort((left, right) => right.created_at.localeCompare(left.created_at));
        return res.json({ data: collaborators });
    }
);

app.post(
    '/api/collaborators',
    exigirSupabaseAdmin,
    exigirUsuario,
    exigirPapel('admin'),
    async (req, res) => {
        const fullName = typeof req.body?.fullName === 'string' ? req.body.fullName.trim() : '';
        const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
        const password = typeof req.body?.password === 'string' ? req.body.password : '';
        const role = req.body?.role;

        if (fullName.length < 2 || fullName.length > 120) {
            return res.status(400).json({ error: 'Informe um nome de 2 a 120 caracteres.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Informe um e-mail válido.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'A senha inicial deve ter pelo menos 8 caracteres.' });
        }
        if (!['admin', 'cashier', 'product_clerk', 'cashier_product'].includes(role)) {
            return res.status(400).json({ error: 'Selecione um cargo válido para esta conta.' });
        }

        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
            app_metadata: {
                role,
                is_active: true,
                must_change_password: true
            }
        });
        if (createError || !created.user) {
            if (['email_exists', 'user_already_exists'].includes(createError?.code)) {
                return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
            }
            if (createError?.code === 'weak_password') {
                return res.status(400).json({ error: 'A senha não atende aos requisitos de segurança configurados no Supabase. Escolha uma senha mais forte.' });
            }
            if (createError?.code === 'email_address_invalid') {
                return res.status(400).json({ error: 'O Supabase rejeitou o formato do e-mail informado.' });
            }
            console.error('Não foi possível criar a conta do colaborador.', createError);
            return res.status(502).json({ error: 'O Supabase não conseguiu criar a conta. Confira se a chave secreta do servidor e as configurações de Authentication pertencem ao projeto correto.' });
        }

        return res.status(201).json({
            data: {
                id: created.user.id,
                full_name: fullName,
                email,
                role,
                is_active: true,
                created_at: created.user.created_at
            }
        });
    }
);

app.patch(
    '/api/collaborators/:id/status',
    exigirSupabaseAdmin,
    exigirUsuario,
    exigirPapel('admin'),
    async (req, res) => {
        const isActive = req.body?.isActive;
        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: 'Informe se o colaborador deve ficar ativo ou inativo.' });
        }
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(req.params.id)) {
            return res.status(400).json({ error: 'Identificador de colaborador inválido.' });
        }
        if (req.params.id === req.authUser.id) {
            return res.status(400).json({ error: 'Não é possível alterar o status da própria conta por esta tela.' });
        }

        const { data: current, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(req.params.id);
        if (lookupError) {
            console.error('Não foi possível consultar o colaborador.', lookupError);
            return res.status(500).json({ error: 'Não foi possível atualizar o acesso deste usuário.' });
        }
        const currentRole = current.user?.app_metadata?.role;
        if (!current.user || !['admin', 'cashier', 'product_clerk', 'cashier_product'].includes(currentRole)) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        if (currentRole === 'admin' && !isActive) {
            let activeAdmins = 0;
            for (let page = 1; page <= 20; page += 1) {
                const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
                if (error) {
                    console.error('Não foi possível verificar administradores ativos.', error);
                    return res.status(500).json({ error: 'Não foi possível verificar se há outro administrador ativo.' });
                }
                activeAdmins += data.users.filter((user) =>
                    user.app_metadata?.role === 'admin' && user.app_metadata?.is_active !== false
                ).length;
                if (data.users.length < 1000) break;
            }
            if (activeAdmins <= 1) {
                return res.status(409).json({ error: 'Não é possível desativar o último administrador ativo.' });
            }
        }

        const { data: updated, error } = await supabaseAdmin.auth.admin.updateUserById(req.params.id, {
            app_metadata: { ...current.user.app_metadata, is_active: isActive }
        });
        if (error) {
            console.error('Não foi possível atualizar o acesso do usuário.', error);
            return res.status(500).json({ error: 'Não foi possível atualizar o acesso deste usuário.' });
        }
        return res.json({
            data: {
                id: updated.user.id,
                full_name: updated.user.user_metadata?.full_name || updated.user.email,
                email: updated.user.email,
                role: currentRole,
                is_active: isActive,
                created_at: updated.user.created_at
            }
        });
    }
);

// ============================================================
// CATEGORIAS DE PRODUTOS
// ============================================================

app.get(
    '/api/categories',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin', 'cashier', 'product_clerk', 'cashier_product'),
    async (req, res) => {
        try {
            const [{ data: categorias, error: categoriasError }, { data: produtos, error: produtosError }] = await Promise.all([
                supabase.from('categorias').select('slug,nome,descricao,ativo').order('nome', { ascending: true }),
                supabase.from('produtos').select('categoria,estoque_atual')
            ]);
            if (categoriasError) return responderErroCategorias(res, categoriasError);
            if (produtosError) return responderErroSupabase(res, produtosError);

            const totais = new Map();
            for (const produto of produtos || []) {
                if (!produto.categoria) continue;
                const total = totais.get(produto.categoria) || { produtos: 0, estoque: 0 };
                total.produtos += 1;
                total.estoque += Number(produto.estoque_atual || 0);
                totais.set(produto.categoria, total);
            }
            return res.json({
                data: (categorias || []).map((categoria) => ({
                    ...categoria,
                    produtos: totais.get(categoria.slug)?.produtos || 0,
                    estoque: totais.get(categoria.slug)?.estoque || 0
                }))
            });
        } catch (error) {
            return responderErroCategorias(res, error);
        }
    }
);

app.post(
    '/api/categories',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        let categoria;
        try {
            categoria = normalizarCategoria(req.body);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
        const slug = slugCategoria(categoria.nome);
        if (!slug) return res.status(400).json({ error: 'Informe um nome que permita criar a identificação da categoria.' });

        try {
            const { data, error } = await supabaseAdmin.from('categorias')
                .insert({ ...categoria, slug, ativo: true })
                .select('slug,nome,descricao,ativo')
                .single();
            if (error) return responderErroCategorias(res, error);
            return res.status(201).json({ data: { ...data, produtos: 0, estoque: 0 } });
        } catch (error) {
            return responderErroCategorias(res, error);
        }
    }
);

app.put(
    '/api/categories/:slug',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        let categoria;
        try {
            categoria = normalizarCategoria(req.body);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
        try {
            const { data, error } = await supabaseAdmin.from('categorias')
                .update(categoria)
                .eq('slug', req.params.slug)
                .select('slug,nome,descricao,ativo')
                .maybeSingle();
            if (error) return responderErroCategorias(res, error);
            if (!data) return res.status(404).json({ error: 'Categoria não encontrada.' });
            return res.json({ data });
        } catch (error) {
            return responderErroCategorias(res, error);
        }
    }
);

app.patch(
    '/api/categories/:slug',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        if (typeof req.body?.ativo !== 'boolean') {
            return res.status(400).json({ error: 'Informe um status válido para a categoria.' });
        }
        try {
            const { data, error } = await supabaseAdmin.from('categorias')
                .update({ ativo: req.body.ativo })
                .eq('slug', req.params.slug)
                .select('slug,nome,descricao,ativo')
                .maybeSingle();
            if (error) return responderErroCategorias(res, error);
            if (!data) return res.status(404).json({ error: 'Categoria não encontrada.' });
            return res.json({ data });
        } catch (error) {
            return responderErroCategorias(res, error);
        }
    }
);

app.delete(
    '/api/categories/:slug',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        try {
            const { count, error: productsError } = await supabaseAdmin.from('produtos')
                .select('id', { count: 'exact', head: true })
                .eq('categoria', req.params.slug);
            if (productsError) return responderErroSupabase(res, productsError);
            if (count > 0) {
                return res.status(409).json({
                    error: 'Esta categoria possui produtos. Reclassifique-os antes de excluí-la.'
                });
            }

            const { data, error } = await supabaseAdmin.from('categorias')
                .delete()
                .eq('slug', req.params.slug)
                .select('slug')
                .maybeSingle();
            if (error) return responderErroCategorias(res, error);
            if (!data) return res.status(404).json({ error: 'Categoria não encontrada.' });
            return res.json({ message: 'Categoria excluída com sucesso.' });
        } catch (error) {
            return responderErroCategorias(res, error);
        }
    }
);

// ============================================================
// LISTAR E PESQUISAR PRODUTOS
// GET /api/products
// Exemplos:
// /api/products?search=arroz
// /api/products?category=alimentos
// /api/products?active=all
// ============================================================

app.get('/api/products', exigirSupabase, exigirUsuario, exigirPapel('admin', 'cashier', 'product_clerk', 'cashier_product'), async (req, res) => {
    try {
        let consulta = supabase
            .from('produtos')
            .select('*')
            .order('nome', { ascending: true });

        const busca = String(req.query.search || '').trim();
        const categoria = String(req.query.category || '').trim();

        if (busca) {
            const termo = busca.replace(/[,%()]/g, ' ');

            consulta = consulta.or(
                `nome.ilike.%${termo}%,codigo.ilike.%${termo}%,categoria.ilike.%${termo}%,codigo_barras.ilike.%${termo}%`
            );
        }

        if (categoria) {
            consulta = consulta.eq('categoria', categoria);
        }

        if (req.query.active !== 'all') {
            consulta = consulta.eq(
                'ativo',
                req.query.active === 'false' ? false : true
            );
        }

        const { data, error } = await consulta.limit(500);

        if (error) {
            return responderErroSupabase(res, error);
        }

        return res.json({
            data: data || [],
            count: (data || []).length
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Erro inesperado ao consultar produtos.'
        });
    }
});

// ============================================================
// CONSULTAR UM PRODUTO PELO ID
// GET /api/products/:id
// ============================================================

app.get('/api/products/:id', exigirSupabase, exigirUsuario, exigirPapel('admin', 'cashier', 'product_clerk', 'cashier_product'), async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Identificador de produto inválido.'
        });
    }

    const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        return responderErroSupabase(res, error);
    }

    if (!data) {
        return res.status(404).json({
            error: 'Produto não encontrado.'
        });
    }

    return res.json(data);
});

// ============================================================
// CADASTRAR PRODUTO
// POST /api/products
// ============================================================

app.post('/api/products', exigirSupabase, exigirUsuario, exigirPapel('admin', 'product_clerk', 'cashier_product'), async (req, res) => {
    let produto;
    let uploadedObjectPath = null;

    try {
        produto = normalizarProduto({
            ...req.body,
            imagem_url: req.body?.imagem_data_url ? null : req.body?.imagem_url
        });
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }

    const { data: categoriaExistente, error: categoriaError } = await supabase
        .from('categorias')
        .select('slug,ativo')
        .eq('slug', produto.categoria)
        .maybeSingle();
    if (categoriaError) return responderErroCategorias(res, categoriaError);
    if (!categoriaExistente || !categoriaExistente.ativo) {
        return res.status(400).json({ error: 'Selecione uma categoria ativa para o produto.' });
    }

    if (req.body?.imagem_data_url) {
        if (!supabaseAdmin) {
            return res.status(503).json({
                error: 'O envio de imagens requer SUPABASE_SERVICE_ROLE_KEY configurada no servidor.'
            });
        }

        let imagem;
        try {
            imagem = decodificarImagemProduto(req.body.imagem_data_url);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        uploadedObjectPath = `${randomUUID()}.${imagem.extension}`;
        let uploadError;
        try {
            ({ error: uploadError } = await supabaseAdmin.storage
                .from('product-images')
                .upload(uploadedObjectPath, imagem.buffer, {
                    contentType: imagem.contentType,
                    cacheControl: '3600',
                    upsert: false
                }));
        } catch (error) {
            console.error('Falha ao enviar imagem para o Supabase Storage.', error);
            await removerImagemProduto(uploadedObjectPath);
            return res.status(502).json({ error: 'Não foi possível enviar a imagem do produto.' });
        }

        if (uploadError) {
            return responderErroSupabase(res, uploadError);
        }
        produto.imagem_url = supabaseAdmin.storage
            .from('product-images')
            .getPublicUrl(uploadedObjectPath).data.publicUrl;
    }

    try {
        const { data, error } = await supabase
            .from('produtos')
            .insert(produto)
            .select('*')
            .single();

        if (error) {
            if (uploadedObjectPath) await removerImagemProduto(uploadedObjectPath);
            return responderErroSupabase(res, error);
        }

        return res.status(201).json({
            message: 'Produto cadastrado com sucesso.',
            data
        });
    } catch (error) {
        if (uploadedObjectPath) await removerImagemProduto(uploadedObjectPath);
        console.error('Falha ao cadastrar produto.', error);
        return res.status(500).json({ error: 'Não foi possível cadastrar o produto.' });
    }
});

// ============================================================
// ATUALIZAR PRODUTO
// PUT /api/products/:id
// ============================================================

app.put('/api/products/:id', exigirSupabase, exigirUsuario, exigirPapel('admin'), async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Identificador de produto inválido.'
        });
    }

    if (Object.hasOwn(req.body || {}, 'estoque_atual')) {
        return res.status(400).json({
            error: 'Altere o saldo pelo Controle de Estoque para registrar a movimentação no histórico.'
        });
    }

    let produto;
    let imagemNovaPath = null;

    try {
        const imagemDataUrl = req.body?.imagem_data_url;
        const removerImagem = req.body?.remover_imagem === true;
        produto = normalizarProduto({
            ...req.body,
            ...(imagemDataUrl || removerImagem ? { imagem_url: null } : {})
        }, true);

        if (imagemDataUrl && removerImagem) {
            return res.status(400).json({ error: 'Escolha uma nova imagem ou remova a imagem atual, não os dois.' });
        }
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }

    if (!Object.keys(produto).length) {
        return res.status(400).json({
            error: 'Nenhum campo válido foi enviado para atualização.'
        });
    }

    try {
        const { data: existente, error: lookupError } = await supabase
            .from('produtos')
            .select('id,imagem_url')
            .eq('id', id)
            .maybeSingle();
        if (lookupError) return responderErroSupabase(res, lookupError);
        if (!existente) return res.status(404).json({ error: 'Produto não encontrado.' });

        if (req.body?.remover_imagem === true && caminhoImagemProduto(existente.imagem_url) && !supabaseAdmin) {
            return res.status(503).json({
                error: 'A remoção da imagem requer SUPABASE_SERVICE_ROLE_KEY configurada no servidor.'
            });
        }

        if (Object.hasOwn(produto, 'categoria') && produto.categoria) {
            const { data: categoriaExistente, error: categoriaError } = await supabase
                .from('categorias')
                .select('slug')
                .eq('slug', produto.categoria)
                .maybeSingle();
            if (categoriaError) return responderErroCategorias(res, categoriaError);
            if (!categoriaExistente) return res.status(400).json({ error: 'Selecione uma categoria válida para o produto.' });
        }

        if (req.body?.imagem_data_url) {
            if (!supabaseAdmin) {
                return res.status(503).json({
                    error: 'A alteração de imagens requer SUPABASE_SERVICE_ROLE_KEY configurada no servidor.'
                });
            }

            let imagem;
            try {
                imagem = decodificarImagemProduto(req.body.imagem_data_url);
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }

            imagemNovaPath = `${randomUUID()}.${imagem.extension}`;
            const { error: uploadError } = await supabaseAdmin.storage
                .from('product-images')
                .upload(imagemNovaPath, imagem.buffer, {
                    contentType: imagem.contentType,
                    cacheControl: '3600',
                    upsert: false
                });
            if (uploadError) {
                console.error('Falha ao enviar nova imagem do produto.', uploadError);
                await removerImagemProduto(imagemNovaPath);
                return res.status(502).json({ error: 'Não foi possível enviar a imagem do produto.' });
            }
            produto.imagem_url = supabaseAdmin.storage
                .from('product-images')
                .getPublicUrl(imagemNovaPath).data.publicUrl;
        }

        const { data, error } = await supabase
            .from('produtos')
            .update(produto)
            .eq('id', id)
            .select('*')
            .maybeSingle();

        if (error) {
            if (imagemNovaPath) await removerImagemProduto(imagemNovaPath);
            return responderErroSupabase(res, error);
        }

        if (!data) {
            if (imagemNovaPath) await removerImagemProduto(imagemNovaPath);
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        if (req.body?.imagem_data_url || req.body?.remover_imagem === true) {
            const imagemAnteriorPath = caminhoImagemProduto(existente.imagem_url);
            if (imagemAnteriorPath && imagemAnteriorPath !== imagemNovaPath) {
                await removerImagemProduto(imagemAnteriorPath);
            }
        }

        return res.json({
            message: 'Produto atualizado com sucesso.',
            data
        });
    } catch (error) {
        if (imagemNovaPath) await removerImagemProduto(imagemNovaPath);
        console.error('Falha ao atualizar produto.', error);
        return res.status(500).json({ error: 'Não foi possível atualizar o produto.' });
    }
});

// ============================================================
// DESATIVAR PRODUTO
// PATCH /api/products/:id/deactivate
// Preserva o registro no banco de dados.
// ============================================================

app.patch(
    '/api/products/:id/deactivate',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    async (req, res) => {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({
                error: 'Identificador de produto inválido.'
            });
        }

        const { data, error } = await supabase
            .from('produtos')
            .update({ ativo: false })
            .eq('id', id)
            .select('*')
            .maybeSingle();

        if (error) {
            return responderErroSupabase(res, error);
        }

        if (!data) {
            return res.status(404).json({
                error: 'Produto não encontrado.'
            });
        }

        return res.json({
            message: 'Produto desativado com sucesso.',
            data
        });
    }
);

app.get(
    '/api/stock/movements',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin', 'product_clerk', 'cashier_product'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const productId = Number(req.query.product_id);
        if (!Number.isSafeInteger(productId) || productId <= 0) {
            return res.status(400).json({ error: 'Selecione um produto válido.' });
        }
        try {
            const { data, error } = await supabaseAdmin.from('stock_movements')
                .select('id,product_id,tipo,quantidade,estoque_anterior,estoque_posterior,motivo,observacoes,referencia,created_at')
                .eq('product_id', productId)
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) return responderErroEstoque(res, error);
            return res.json({ data: data || [] });
        } catch (error) {
            return responderErroEstoque(res, error);
        }
    }
);

app.post(
    '/api/stock/movements',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin', 'product_clerk', 'cashier_product'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const productId = Number(req.body?.product_id);
        const type = req.body?.type;
        const amount = Number(req.body?.quantity);
        const reason = req.body?.reason;
        const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '';
        const allowedTypes = new Set(['in', 'out', 'set']);
        const allowedReasons = new Set(['compra', 'devolucao', 'perda', 'vencimento', 'inventario', 'outro']);

        if (!Number.isSafeInteger(productId) || productId <= 0
            || !allowedTypes.has(type)
            || !Number.isFinite(amount) || amount < 0 || amount > 1000000
            || (type !== 'set' && amount <= 0)
            || !allowedReasons.has(reason)
            || notes.length > 500) {
            return res.status(400).json({ error: 'Informe produto, tipo, quantidade e motivo válidos.' });
        }

        try {
            const { data, error } = await supabaseAdmin.rpc('adjust_product_stock', {
                p_product_id: productId,
                p_type: type,
                p_quantity: amount,
                p_reason: reason,
                p_notes: notes || null,
                p_performed_by: req.userProfile.id
            });
            if (error) return responderErroEstoque(res, error);
            return res.status(201).json({ data });
        } catch (error) {
            return responderErroEstoque(res, error);
        }
    }
);

function responderErroEstoque(res, error) {
    console.error('Erro ao acessar o controle de estoque:', error);
    if (error.code === 'P0001') {
        return res.status(409).json({ error: error.message || 'A movimentação não pode ser realizada.' });
    }
    if (error.code === '23503' || error.code === '23514' || error.code === '22P02') {
        return res.status(400).json({ error: 'Os dados da movimentação são inválidos.' });
    }
    if (error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST202') {
        return res.status(503).json({
            error: 'O controle de estoque ainda não foi configurado no banco. Execute supabase/stock-management.sql no SQL Editor do Supabase.'
        });
    }
    if (error.code === '42501') {
        return res.status(403).json({ error: 'O Supabase bloqueou a operação. Verifique a chave administrativa do servidor.' });
    }
    return res.status(500).json({ error: 'Não foi possível concluir a operação de estoque.' });
}

// ============================================================
// FORNECEDORES E PEDIDOS DE COMPRA
// ============================================================

app.get(
    '/api/suppliers/options',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin', 'product_clerk', 'cashier_product'),
    exigirBancoAdministrativo,
    async (req, res) => {
        try {
            const { data, error } = await supabaseAdmin.from('suppliers')
                .select('id,nome').eq('ativo', true).order('nome', { ascending: true }).limit(1000);
            if (error) return responderErroFornecedores(res, error);
            return res.json({ data: data || [] });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.get(
    '/api/suppliers',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        try {
            const { data, error } = await supabaseAdmin
                .from('suppliers')
                .select('*')
                .order('nome', { ascending: true })
                .limit(1000);
            if (error) return responderErroFornecedores(res, error);
            return res.json({ data: data || [] });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.get(
    '/api/suppliers/:id',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Identificador de fornecedor inválido.' });
        }
        try {
            const [{ data: fornecedor, error: fornecedorError }, { data: pedidos, error: pedidosError }] =
                await Promise.all([
                    supabaseAdmin.from('suppliers').select('*').eq('id', id).maybeSingle(),
                    supabaseAdmin.from('purchase_orders').select('*').eq('supplier_id', id)
                        .order('created_at', { ascending: false }).limit(50)
                ]);
            if (fornecedorError) return responderErroFornecedores(res, fornecedorError);
            if (!fornecedor) return res.status(404).json({ error: 'Fornecedor não encontrado.' });
            if (pedidosError) return responderErroFornecedores(res, pedidosError);
            return res.json({ data: { ...fornecedor, pedidos: pedidos || [] } });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.post(
    '/api/suppliers',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        let fornecedor;
        try {
            fornecedor = normalizarFornecedor(req.body);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
        try {
            const { data, error } = await supabaseAdmin
                .from('suppliers').insert(fornecedor).select('*').single();
            if (error) return responderErroFornecedores(res, error);
            return res.status(201).json({ data });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.put(
    '/api/suppliers/:id',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Identificador de fornecedor inválido.' });
        }
        let fornecedor;
        try {
            fornecedor = normalizarFornecedor(req.body, true);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
        if (!Object.keys(fornecedor).length) {
            return res.status(400).json({ error: 'Nenhum campo válido foi enviado para atualização.' });
        }
        fornecedor.updated_at = new Date().toISOString();
        try {
            const { data, error } = await supabaseAdmin
                .from('suppliers').update(fornecedor).eq('id', id).select('*').maybeSingle();
            if (error) return responderErroFornecedores(res, error);
            if (!data) return res.status(404).json({ error: 'Fornecedor não encontrado.' });
            return res.json({ data });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.patch(
    '/api/suppliers/:id/active',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0 || typeof req.body?.ativo !== 'boolean') {
            return res.status(400).json({ error: 'Informe um fornecedor válido e o estado ativo/inativo.' });
        }
        try {
            const { data, error } = await supabaseAdmin.from('suppliers')
                .update({ ativo: req.body.ativo, updated_at: new Date().toISOString() })
                .eq('id', id).select('*').maybeSingle();
            if (error) return responderErroFornecedores(res, error);
            if (!data) return res.status(404).json({ error: 'Fornecedor não encontrado.' });
            return res.json({ data });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.get(
    '/api/purchase-orders',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        try {
            const { data: pedidos, error } = await supabaseAdmin.from('purchase_orders')
                .select('*').order('created_at', { ascending: false }).limit(500);
            if (error) return responderErroFornecedores(res, error);
            const ids = [...new Set((pedidos || []).map((pedido) => pedido.supplier_id))];
            let fornecedores = [];
            if (ids.length) {
                const result = await supabaseAdmin.from('suppliers').select('id,nome,email').in('id', ids);
                if (result.error) return responderErroFornecedores(res, result.error);
                fornecedores = result.data || [];
            }
            const porId = new Map(fornecedores.map((fornecedor) => [fornecedor.id, fornecedor]));
            return res.json({
                data: (pedidos || []).map((pedido) => ({
                    ...pedido,
                    fornecedor: porId.get(pedido.supplier_id) || null
                }))
            });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.get(
    '/api/purchase-orders/:id',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Identificador de pedido inválido.' });
        }
        try {
            const { data: pedido, error } = await supabaseAdmin.from('purchase_orders')
                .select('*').eq('id', id).maybeSingle();
            if (error) return responderErroFornecedores(res, error);
            if (!pedido) return res.status(404).json({ error: 'Pedido de compra não encontrado.' });
            const { data: fornecedor, error: fornecedorError } = await supabaseAdmin
                .from('suppliers').select('*').eq('id', pedido.supplier_id).maybeSingle();
            if (fornecedorError) return responderErroFornecedores(res, fornecedorError);
            return res.json({ data: { ...pedido, fornecedor } });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.post(
    '/api/purchase-orders',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const supplierId = Number(req.body?.supplier_id);
        if (!Number.isSafeInteger(supplierId) || supplierId <= 0) {
            return res.status(400).json({ error: 'Selecione um fornecedor válido.' });
        }
        const entrega = dataIsoValida(req.body?.data_entrega);
        if (entrega === undefined) {
            return res.status(400).json({ error: 'Informe uma data de entrega válida.' });
        }
        const observacoes = textoOpcional(req.body?.observacoes);
        if (observacoes && observacoes.length > 2000) {
            return res.status(400).json({ error: 'As observações podem ter no máximo 2.000 caracteres.' });
        }
        let valores;
        try {
            valores = normalizarItensPedido(req.body?.itens);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        try {
            const { data: fornecedor, error: fornecedorError } = await supabaseAdmin
                .from('suppliers').select('*').eq('id', supplierId).maybeSingle();
            if (fornecedorError) return responderErroFornecedores(res, fornecedorError);
            if (!fornecedor || !fornecedor.ativo) {
                return res.status(400).json({ error: 'O fornecedor selecionado não existe ou está inativo.' });
            }
            if (!fornecedor.email) {
                return res.status(400).json({ error: 'Cadastre um e-mail para o fornecedor antes de enviar pedidos.' });
            }

            const numeroPedido = `PC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomUUID().slice(0, 6).toUpperCase()}`;
            const { data: pedido, error } = await supabaseAdmin.from('purchase_orders').insert({
                numero: numeroPedido,
                supplier_id: supplierId,
                created_by: req.userProfile.id,
                data_entrega: entrega,
                observacoes,
                itens: valores.itens,
                total: valores.total,
                status: 'ordered',
                email_status: 'pending'
            }).select('*').single();
            if (error) return responderErroFornecedores(res, error);

            const envio = await registrarResultadoEmail(pedido, fornecedor);
            if (!envio.sent) {
                return res.status(502).json({
                    error: `O pedido ${pedido.numero} foi salvo, mas o e-mail não foi enviado. Confira o SMTP e tente reenviar pela tela de Pedidos de Compra.`,
                    data: { ...pedido, fornecedor, email_status: 'failed' }
                });
            }
            return res.status(201).json({
                data: {
                    ...pedido,
                    fornecedor,
                    email_status: envio.trackingError ? 'pending' : 'sent'
                },
                warning: envio.trackingError
                    ? 'O e-mail foi enviado, mas o registro do envio não pôde ser atualizado. Verifique o pedido no banco.'
                    : null
            });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.post(
    '/api/purchase-orders/:id/send',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const id = Number(req.params.id);
        if (!Number.isSafeInteger(id) || id <= 0) {
            return res.status(400).json({ error: 'Identificador de pedido inválido.' });
        }
        try {
            const { data: pedido, error } = await supabaseAdmin.from('purchase_orders')
                .select('*').eq('id', id).maybeSingle();
            if (error) return responderErroFornecedores(res, error);
            if (!pedido) return res.status(404).json({ error: 'Pedido de compra não encontrado.' });
            if (pedido.email_status === 'sent') {
                return res.status(409).json({ error: 'Este pedido já foi enviado ao fornecedor.' });
            }
            if (pedido.status === 'cancelled') {
                return res.status(409).json({ error: 'Não é possível enviar um pedido cancelado.' });
            }
            const { data: fornecedor, error: fornecedorError } = await supabaseAdmin
                .from('suppliers').select('*').eq('id', pedido.supplier_id).maybeSingle();
            if (fornecedorError) return responderErroFornecedores(res, fornecedorError);
            if (!fornecedor) return res.status(404).json({ error: 'Fornecedor do pedido não encontrado.' });

            const envio = await registrarResultadoEmail(pedido, fornecedor);
            if (!envio.sent) {
                return res.status(502).json({
                    error: 'O pedido permanece salvo, mas não foi possível enviar o e-mail. Confira a configuração SMTP e tente novamente.'
                });
            }
            return res.json({
                data: { ...pedido, fornecedor, email_status: envio.trackingError ? 'pending' : 'sent' },
                warning: envio.trackingError
                    ? 'O e-mail foi enviado, mas o registro do envio não pôde ser atualizado.'
                    : null
            });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

app.patch(
    '/api/purchase-orders/:id/status',
    exigirSupabase,
    exigirUsuario,
    exigirPapel('admin'),
    exigirBancoAdministrativo,
    async (req, res) => {
        const id = Number(req.params.id);
        const status = req.body?.status;
        if (!Number.isSafeInteger(id) || id <= 0 || !['received', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Informe um pedido válido e um status permitido.' });
        }
        try {
            if (status === 'received') {
                const { data, error } = await supabaseAdmin.rpc('receive_purchase_order', {
                    p_order_id: id,
                    p_performed_by: req.userProfile.id
                });
                if (error) return responderErroEstoque(res, error);
                return res.json({ data });
            }
            const { data, error } = await supabaseAdmin.from('purchase_orders')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', id).eq('status', 'ordered').select('*').maybeSingle();
            if (error) return responderErroFornecedores(res, error);
            if (!data) {
                const { data: existing, error: lookupError } = await supabaseAdmin
                    .from('purchase_orders').select('id').eq('id', id).maybeSingle();
                if (lookupError) return responderErroFornecedores(res, lookupError);
                return res.status(existing ? 409 : 404).json({
                    error: existing
                        ? 'Somente pedidos em aberto podem ter o status alterado.'
                        : 'Pedido de compra não encontrado.'
                });
            }
            return res.json({ data });
        } catch (error) {
            return responderErroFornecedores(res, error);
        }
    }
);

// ============================================================
// ARQUIVOS DO FRONTEND
// ============================================================

app.get('/', (req, res) => {
    res.redirect('/dashboard/');
});

app.use(express.static(FRONTEND_PATH));

app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'Rota da API não encontrada.'
    });
});

app.get('*', (req, res) => {
    if (!fs.existsSync(FRONTEND_INDEX)) {
        return res.status(503).send(
            'Frontend ainda nao compilado. Execute "npm run build" ou inicie com "npm start".'
        );
    }

    res.sendFile(FRONTEND_INDEX);
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================

app.listen(PORT, () => {
    console.log(`SuperMarket rodando em http://localhost:${PORT}`);

    if (!fs.existsSync(FRONTEND_INDEX)) {
        console.warn(
            'Build do frontend nao encontrado. Execute "npm run build" ou inicie com "npm start".'
        );
    }

    console.log(
        `Supabase: ${
            supabase
                ? 'configuração encontrada'
                : 'NÃO configurado — confira o arquivo .env'
        }`
    );

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.warn(
            'ATENÇÃO: chave service role ativa. Não publique esta API sem autenticação e autorização.'
        );
    }
});