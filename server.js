
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
const FRONTEND_PATH = path.join(__dirname, 'dist');

// ============================================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================================

const supabaseUrl = process.env.SUPABASE_URL;

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
    supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
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

function exigirSupabaseAdmin(req, res, next) {
    if (!supabaseAdmin) {
        return res.status(503).json({
            error: 'O cadastro de colaboradores requer SUPABASE_SERVICE_ROLE_KEY configurada somente no backend.'
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
        if (!['admin', 'cashier'].includes(appMetadata.role) || appMetadata.is_active === false) {
            return res.status(403).json({ error: 'Esta conta não possui acesso ativo ao sistema.' });
        }

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

app.patch('/api/me/password', exigirSupabaseAdmin, exigirUsuario, async (req, res) => {
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8) {
        return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(req.authUser.id, {
        password,
        app_metadata: {
            ...req.authUser.app_metadata,
            must_change_password: false
        }
    });
    if (error) {
        console.error('Não foi possível concluir a atualização da conta.', error);
        return res.status(400).json({ error: 'Não foi possível atualizar a senha. Verifique os requisitos e tente novamente.' });
    }

    return res.json({ message: 'Senha atualizada.' });
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
                .filter((user) => user.app_metadata?.role === 'cashier')
                .map((user) => ({
                    id: user.id,
                    full_name: user.user_metadata?.full_name || user.email,
                    email: user.email,
                    role: 'cashier',
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

        if (fullName.length < 2 || fullName.length > 120) {
            return res.status(400).json({ error: 'Informe um nome de 2 a 120 caracteres.' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'Informe um e-mail válido.' });
        }
        if (password.length < 8) {
            return res.status(400).json({ error: 'A senha inicial deve ter pelo menos 8 caracteres.' });
        }

        const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
            app_metadata: {
                role: 'cashier',
                is_active: true,
                must_change_password: true
            }
        });
        if (createError || !created.user) {
            if (createError?.code === 'email_exists') {
                return res.status(409).json({ error: 'Já existe uma conta com este e-mail.' });
            }
            console.error('Não foi possível criar a conta do colaborador.', createError);
            return res.status(400).json({ error: 'Não foi possível criar a conta. Confira o e-mail e a senha inicial.' });
        }

        return res.status(201).json({
            data: {
                id: created.user.id,
                full_name: fullName,
                email,
                role: 'cashier',
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
            return res.status(500).json({ error: 'Não foi possível atualizar o acesso do colaborador.' });
        }
        if (!current.user || current.user.app_metadata?.role !== 'cashier') {
            return res.status(404).json({ error: 'Colaborador não encontrado.' });
        }

        const { data: updated, error } = await supabaseAdmin.auth.admin.updateUserById(req.params.id, {
            app_metadata: { ...current.user.app_metadata, is_active: isActive }
        });
        if (error) {
            console.error('Não foi possível atualizar o acesso do colaborador.', error);
            return res.status(500).json({ error: 'Não foi possível atualizar o acesso do colaborador.' });
        }
        return res.json({
            data: {
                id: updated.user.id,
                full_name: updated.user.user_metadata?.full_name || updated.user.email,
                email: updated.user.email,
                role: 'cashier',
                is_active: isActive,
                created_at: updated.user.created_at
            }
        });
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

app.get('/api/products', exigirSupabase, exigirUsuario, exigirPapel('admin', 'cashier'), async (req, res) => {
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

app.get('/api/products/:id', exigirSupabase, exigirUsuario, exigirPapel('admin', 'cashier'), async (req, res) => {
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

app.post('/api/products', exigirSupabase, exigirUsuario, exigirPapel('admin'), async (req, res) => {
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

app.put('/api/products/:id', exigirSupabase, exigirUsuario, exigirPapel('admin'), async (req, res) => {
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
    res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
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