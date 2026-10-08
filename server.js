
 // ============================================================
 // API DO SISTEMA SUPERMARKET
 // Node.js + Express + Supabase (PostgreSQL)
 // ============================================================

require('dotenv').config();

const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const FRONTEND_PATH = path.join(__dirname, 'ProjetoSuperMarket');

// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================

const supabaseUrl = process.env.SUPABASE_URL;

// A chave secreta deve ficar exclusivamente no backend.
// Não coloque essa chave em arquivos JavaScript do navegador.
const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

const supabase =
    supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey, {
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

app.use(express.json({ limit: '1mb' }));
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

function exigirSupabase(req, res, next) {
    if (!supabase) {
        return res.status(503).json({
            error: 'Supabase não configurado. Configure SUPABASE_URL e uma chave válida no arquivo .env.'
        });
    }

    next();
}

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

// ============================================================
// LISTAR E PESQUISAR PRODUTOS
// GET /api/products
// Exemplos:
// /api/products?search=arroz
// /api/products?category=alimentos
// /api/products?active=all
// ============================================================

app.get('/api/products', exigirSupabase, async (req, res) => {
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

app.get('/api/products/:id', exigirSupabase, async (req, res) => {
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

app.post('/api/products', exigirSupabase, async (req, res) => {
    let produto;

    try {
        produto = normalizarProduto(req.body);
    } catch (error) {
        return res.status(400).json({
            error: error.message
        });
    }

    const { data, error } = await supabase
        .from('produtos')
        .insert(produto)
        .select('*')
        .single();

    if (error) {
        return responderErroSupabase(res, error);
    }

    return res.status(201).json({
        message: 'Produto cadastrado com sucesso.',
        data
    });
});

// ============================================================
// ATUALIZAR PRODUTO
// PUT /api/products/:id
// ============================================================

app.put('/api/products/:id', exigirSupabase, async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: 'Identificador de produto inválido.'
        });
    }

    let produto;

    try {
        produto = normalizarProduto(req.body, true);
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

    const { data, error } = await supabase
        .from('produtos')
        .update(produto)
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
        message: 'Produto atualizado com sucesso.',
        data
    });
});

// ============================================================
// DESATIVAR PRODUTO
// PATCH /api/products/:id/deactivate
// Preserva o registro no banco de dados.
// ============================================================

app.patch(
    '/api/products/:id/deactivate',
    exigirSupabase,
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

// ============================================================
// ARQUIVOS DO FRONTEND
// ============================================================

app.use(express.static(FRONTEND_PATH));

app.use('/api', (req, res) => {
    res.status(404).json({
        error: 'Rota da API não encontrada.'
    });
});

app.get('*', (req, res) => {
    res.redirect('/dashboard/');
});

// ============================================================
// INICIALIZAÇÃO
// ============================================================

app.listen(PORT, () => {
    console.log(`SuperMarket rodando em http://localhost:${PORT}`);

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