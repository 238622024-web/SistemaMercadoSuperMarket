
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