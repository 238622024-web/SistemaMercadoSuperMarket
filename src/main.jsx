import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import { authClient, authorizedFetch } from './auth.js';
import { AuthContext } from './authContext.js';
import { ROLE_ROUTES, roleLabel } from './roles.js';

const screens = {
  login: lazy(() => import('./screens/index.jsx')),
  dashboard: lazy(() => import('./screens/dashboard.jsx')),
  analise: lazy(() => import('./screens/AnalysisPage.jsx')),
  produtos: lazy(() => import('./screens/ProductsPage.jsx')),
  'adicionar-produto': lazy(() => import('./screens/adicionar-produto.jsx')),
  'adicionar-cliente': lazy(() => import('./screens/adicionar-cliente.jsx')),
  caixa: lazy(() => import('./screens/caixa.jsx')),
  categorias: lazy(() => import('./screens/CategoriasPage.jsx')),
  clientes: lazy(() => import('./screens/clientes.jsx')),
  configuracoes: lazy(() => import('./screens/configuracoes.jsx')),
  contas: lazy(() => import('./screens/contas.jsx')),
  estoque: lazy(() => import('./screens/estoque.jsx')),
  'etiqueta-gondola': lazy(() => import('./screens/etiqueta-gondola.jsx')),
  'fluxo-caixa': lazy(() => import('./screens/fluxo-caixa.jsx')),
  fornecedores: lazy(() => import('./screens/fornecedores.jsx')),
  pdv: lazy(() => import('./screens/pdv.jsx')),
  'pedidos-compra': lazy(() => import('./screens/pedidos-compra.jsx')),
  relatorios: lazy(() => import('./screens/relatorios.jsx')),
  vendas: lazy(() => import('./screens/vendas.jsx')),
  ajuda: lazy(() => import('./screens/ajuda.jsx')),
  perfil: lazy(() => import('./screens/perfil.jsx')),
  colaboradores: lazy(() => import('./screens/colaboradores.jsx'))
};

const pageTitles = {
  login: 'Login - Sistema SuperMarket',
  dashboard: 'Dashboard - Sistema',
  analise: 'Análise - Mercado Super Market',
  produtos: 'Lista de Produtos - Mercado Super Market',
  'adicionar-produto': 'Adicionar Produto - Sistema',
  'adicionar-cliente': 'Cadastrar Cliente - Mercado Super Market',
  caixa: 'Controle de Caixa - Mercado Super Market',
  categorias: 'Categorias - Mercado Super Market',
  clientes: 'Lista de Clientes - Mercado Super Market',
  configuracoes: 'Configurações - Mercado Super Market',
  contas: 'Contas a Pagar e Receber - Mercado Super Market',
  estoque: 'Controle de Estoque - Mercado Super Market',
  'etiqueta-gondola': 'Etiqueta de Gôndola - Mercado Super Market',
  'fluxo-caixa': 'Fluxo de Caixa - Mercado Super Market',
  fornecedores: 'Fornecedores - Mercado Super Market',
  pdv: 'PDV - Ponto de Venda | Mercado Super Market',
  'pedidos-compra': 'Pedidos de Compra - Mercado Super Market',
  relatorios: 'Relatórios de Vendas - Mercado Super Market',
  vendas: 'Histórico de Vendas - Mercado Super Market',
  ajuda: 'Ajuda - Mercado Super Market',
  perfil: 'Meu Perfil - Mercado Super Market',
  colaboradores: 'Colaboradores - Mercado Super Market'
};

function routeName(pathname) {
  const parts = pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  let segment = parts.at(-1) || 'login';
  if (segment === 'index.html') segment = parts.at(-2) || 'login';
  segment = segment.replace(/\.html$/, '');
  if (!parts.length) return 'dashboard';
  if (segment === 'index') return 'login';
  return screens[segment] ? segment : 'dashboard';
}

function readFormNumber(form, name) {
  const value = String(form.get(name) ?? '').trim().replace(',', '.');
  if (!value) return name === 'peso_gramas' ? null : 0;
  return Number(value);
}

function Application() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const name = routeName(pathname);
  const Screen = screens[name];
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState({ email: '', senha: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [margin, setMargin] = useState('0.00%');
  const [registering, setRegistering] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const loadUserProfile = useCallback(async (activeSession) => {
    setSession(activeSession);
    setAuthError('');
    if (!activeSession) {
      setUserProfile(null);
      setAuthLoading(false);
      return null;
    }

    try {
      const response = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${activeSession.access_token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar o perfil.');
      setUserProfile(result.user);
      return result.user;
    } catch (error) {
      setUserProfile(null);
      setAuthError(error.message || 'Não foi possível validar sua conta.');
      return null;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authClient) {
      setAuthLoading(false);
      return undefined;
    }

    let mounted = true;
    const { data: { subscription } } = authClient.auth.onAuthStateChange((_event, activeSession) => {
      window.setTimeout(() => {
        if (mounted) void loadUserProfile(activeSession);
      }, 0);
    });
    authClient.auth.getSession().then(({ data: { session: activeSession }, error }) => {
      if (!mounted) return;
      if (error) {
        setAuthError('Não foi possível recuperar a sessão. Entre novamente.');
        setAuthLoading(false);
        return;
      }
      void loadUserProfile(activeSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  useEffect(() => {
    setMessage(null);
    setNotification(null);
    document.title = pageTitles[name];
  }, [name]);

  useEffect(() => {
    if (name !== 'pdv') return undefined;
    const keyboard = (event) => {
      if (event.key === 'Escape') document.getElementById('searchInput')?.focus();
      if (event.key === 'F4') {
        event.preventDefault();
        document.querySelector('[data-legacy-action*="clearCart"]')?.click();
      }
      if (event.key === 'F2') {
        const finish = document.getElementById('finalizeBtn');
        if (finish && !finish.disabled) finish.click();
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => document.removeEventListener('keydown', keyboard);
  }, [name]);

  const login = useCallback(async (event) => {
    event.preventDefault();
    if (loginLoading) return;
    const email = String(event.currentTarget.elements.email?.value || '');
    const password = String(event.currentTarget.elements.senha?.value || '');
    const errors = {
      email: !email ? 'Por favor, insira um e-mail.' :
        (!email.includes('@') || !email.includes('.')) ? 'Por favor, insira um e-mail válido.' : '',
      senha: !password ? 'Por favor, insira sua senha.' :
        password.length < 8 ? 'A senha deve ter no mínimo 8 caracteres.' : ''
    };
    setLoginErrors(errors);
    setMessage(null);
    if (errors.email || errors.senha) return;
    setLoginLoading(true);
    try {
      const { data, error } = await authClient.auth.signInWithPassword({ email, password });
      if (error || !data.session) throw new Error(error?.message || 'Não foi possível iniciar a sessão.');
      const profile = await loadUserProfile(data.session);
      if (!profile) {
        await authClient.auth.signOut();
        throw new Error('Esta conta não está cadastrada ou está desativada. Procure o administrador.');
      }
      setMessage(null);
      navigate(profile.role === 'product_clerk' ? '/adicionar-produto' :
        ROLE_ROUTES[profile.role]?.includes('pdv') ? '/pdv' : '/dashboard');
    } catch (error) {
      setMessage({ text: error.message || 'Não foi possível entrar. Confira seu e-mail e senha.', type: 'error' });
    } finally {
      setLoginLoading(false);
    }
  }, [loginLoading, loadUserProfile, navigate]);

  const changeInitialPassword = useCallback(async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const password = String(form.elements.password.value || '');
    const confirmation = String(form.elements.confirmPassword.value || '');
    if (password.length < 8) {
      setPasswordMessage('A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmation) {
      setPasswordMessage('A confirmação não corresponde à senha.');
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage('');
    try {
      const response = await authorizedFetch('/api/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível alterar a senha.');
      setUserProfile((profile) => ({ ...profile, must_change_password: false }));
      form.reset();
      setPasswordMessage('Senha atualizada. Agora você já pode acessar o sistema.');
    } catch (error) {
      setPasswordMessage(error.message || 'Não foi possível alterar a senha.');
    } finally {
      setPasswordSaving(false);
    }
  }, []);

  const registerProduct = useCallback(async (event) => {
    event.preventDefault();
    if (registering || imageLoading) return;
    const formElement = event.currentTarget;
    const value = (id) => String(formElement.elements.namedItem(id)?.value || '').trim();
    const required = [
      ['productName', 'Nome do produto'],
      ['productCode', 'Código do produto'],
      ['productCategory', 'Categoria'],
      ['productBrand', 'Marca'],
      ['productUnit', 'Unidade']
    ];
    const missing = required.find(([id]) => !value(id));
    if (missing) {
      setNotification({ text: `Preencha o campo: ${missing[1]}.`, type: 'error' });
      return;
    }
    const values = ['productCost', 'productPrice', 'productStock', 'productMinStock'];
    const numeric = values.map((id) => {
      const raw = value(id).replace(',', '.');
      return raw ? Number(raw) : 0;
    });
    const weightRaw = value('productWeight').replace(',', '.');
    const weight = weightRaw ? Number(weightRaw) : null;
    if (numeric.some((value) => !Number.isFinite(value)) ||
        (weight !== null && !Number.isFinite(weight))) {
      setNotification({ text: 'Confira os campos numéricos antes de salvar.', type: 'error' });
      return;
    }

    const product = {
      nome: value('productName'),
      codigo: value('productCode'),
      categoria: value('productCategory'),
      marca: value('productBrand'),
      descricao: value('productDescription'),
      preco_custo: numeric[0],
      preco_venda: numeric[1],
      estoque_atual: numeric[2],
      estoque_minimo: numeric[3],
      unidade: value('productUnit'),
      codigo_barras: value('productBarcode'),
      fornecedor: value('productSupplier'),
      data_validade: value('productValidity'),
      peso_gramas: weight,
      localizacao: value('productLocation'),
      imagem_data_url: uploadedImages[0] || null
    };

    setRegistering(true);
    setNotification(null);
    try {
      const response = await authorizedFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Não foi possível cadastrar o produto.');
      formElement.reset();
      setMargin('0.00%');
      setUploadedImages([]);
      setNotification({ text: 'Produto cadastrado no banco de dados com sucesso!', type: 'success' });
    } catch (error) {
      setNotification({ text: error.message || 'Erro de comunicação com o servidor.', type: 'error' });
    } finally {
      setRegistering(false);
    }
  }, [imageLoading, registering]);

  const updateMargin = (event) => {
    const cost = Number(String(event.target.form?.elements.productCost?.value || '0').replace(',', '.'));
    const price = Number(String(event.target.form?.elements.productPrice?.value || '0').replace(',', '.'));
    if (cost > 0 && Number.isFinite(price)) setMargin(`${(((price - cost) / cost) * 100).toFixed(2)}%`);
  };

  useEffect(() => {
    const syncSidebarForViewport = () => {
      if (window.innerWidth <= 850) {
        document.getElementById('sidebar')?.classList.remove('collapsed');
        document.getElementById('sidebar')?.classList.remove('fully-hidden');
        document.getElementById('sidebar')?.classList.remove('hover-open');
        document.getElementById('mainContent')?.classList.remove('expanded');
        document.getElementById('mainContent')?.classList.remove('fully-hidden');
      } else {
        document.getElementById('sidebar')?.classList.remove('mobile-visible');
        document.getElementById('sidebarOverlay')?.classList.remove('active');
        document.body.classList.remove('sidebar-open');
      }
    };

    window.addEventListener('resize', syncSidebarForViewport);
    return () => window.removeEventListener('resize', syncSidebarForViewport);
  }, []);

  useEffect(() => {
    const hideHoverSidebar = () => {
      const sidebar = document.getElementById('sidebar');
      if (!sidebar?.classList.contains('hover-open')) return;
      sidebar.classList.remove('hover-open');
      sidebar.classList.add('fully-hidden');
    };

    const revealFromEdge = (event) => {
      if (event.pointerType !== 'mouse' || window.innerWidth <= 850 || event.clientX > 16) return;
      const sidebar = document.getElementById('sidebar');
      if (!sidebar?.classList.contains('fully-hidden')) return;
      sidebar.classList.remove('fully-hidden');
      sidebar.classList.add('hover-open');
    };

    const hideAfterPointerLeaves = (event) => {
      const sidebar = document.getElementById('sidebar');
      if (event.pointerType !== 'mouse' || !sidebar?.classList.contains('hover-open')) return;
      const nextTarget = event.relatedTarget;
      if (sidebar.contains(event.target) && (!nextTarget || !sidebar.contains(nextTarget))) {
        hideHoverSidebar();
      }
    };

    window.addEventListener('pointermove', revealFromEdge);
    document.addEventListener('pointerout', hideAfterPointerLeaves);
    return () => {
      window.removeEventListener('pointermove', revealFromEdge);
      document.removeEventListener('pointerout', hideAfterPointerLeaves);
    };
  }, []);

  const handleLegacyClick = (event) => {
    const control = event.target.closest('[data-legacy-action]');
    const action = control?.getAttribute('data-legacy-action') || '';
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('#sidebarOverlay, #overlay, .sidebar-overlay, .mobile-overlay');
    const main = document.querySelector('#mainContent, #main, .main-content, .main');
    const toggleSidebar = () => {
      if (window.innerWidth <= 850) {
        sidebar?.classList.remove('collapsed');
        main?.classList.remove('expanded');
        const isOpen = sidebar?.classList.toggle('mobile-visible') || false;
        overlay?.classList.toggle('active', isOpen);
        document.body.classList.toggle('sidebar-open', isOpen);
      } else if (sidebar?.classList.contains('fully-hidden')) {
        sidebar.classList.remove('fully-hidden');
        sidebar.classList.remove('hover-open');
        main?.classList.remove('fully-hidden');
      } else if (sidebar?.classList.contains('collapsed')) {
        sidebar.classList.remove('hover-open');
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('fully-hidden');
        main?.classList.remove('expanded');
        main?.classList.add('fully-hidden');
      } else {
        sidebar?.classList.remove('hover-open');
        sidebar?.classList.add('collapsed');
        main?.classList.remove('fully-hidden');
        main?.classList.add('expanded');
      }
    };

    if (event.target.closest('.menu-toggle, .menu-toggle-pdv, .menu, #menu, #menuToggle')) {
      toggleSidebar();
      return;
    }

    if (overlay && event.target === overlay) {
      document.getElementById('sidebar')?.classList.remove('mobile-visible');
      overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      return;
    }

    const tab = action.match(/setTab\(this,\s*'([^']+)'/);
    if (tab) {
      document.querySelectorAll('.tab').forEach((item) => item.classList.remove('active'));
      control.classList.add('active');
      document.querySelectorAll('#accountTable tr').forEach((row) => {
        row.style.display = tab[1] === 'all' || row.dataset.type === tab[1] ? '' : 'none';
      });
      return;
    }
    const historyId = action.match(/viewHistory\((\d+)\)/);
    if (historyId) {
      window.alert(`Histórico de movimentações do produto ID ${historyId[1]}\n\nEsta funcionalidade será implementada em breve!`);
      return;
    }
    const payment = event.target.closest('.payment-btn');
    if (payment) {
      document.querySelectorAll('.payment-btn').forEach((button) => button.classList.remove('selected'));
      payment.classList.add('selected');
    }
    const categoryChip = event.target.closest('.category-chip');
    if (categoryChip) {
      document.querySelectorAll('.category-chip').forEach((chip) => chip.classList.remove('active'));
      categoryChip.classList.add('active');
    }
    if (!control) return;
    const submenu = action.match(/pageToggleSubmenu\(event,\s*'([^']+)'/);
    if (submenu) {
      event.preventDefault();
      document.getElementById(submenu[1])?.classList.toggle('open');
      control.classList.toggle('expanded');
      return;
    }
    if (action.includes('toggleSidebar') || action.includes('toggleMobileSidebar')) {
      toggleSidebar();
      return;
    }
    if (action.includes('openModal(')) {
      const id = action.match(/openModal\('([^']+)'/);
      if (id) document.getElementById(id[1])?.classList.add('active');
      return;
    }
    if (action.includes('closeModal(')) {
      const id = action.match(/closeModal\('([^']+)'/);
      if (id) document.getElementById(id[1])?.classList.remove('active');
      return;
    }
    const clickedInput = action.match(/getElementById\('([^']+)'\)\.click\(\)/);
    if (clickedInput) {
      event.preventDefault();
      document.getElementById(clickedInput[1])?.click();
      return;
    }
    if (action.includes('window.print()')) window.print();
    if (action.includes('location.reload()')) window.location.reload();
    if (action.includes('clearCart()')) {
      if (document.querySelector('#cartItems .cart-item')) {
        if (!window.confirm('🗑️ Deseja realmente limpar todo o carrinho?')) return;
        const cart = document.getElementById('cartItems');
        cart?.replaceChildren();
      } else {
        return;
      }
      const count = document.getElementById('itemsCount');
      if (count) count.textContent = '0';
      const total = document.getElementById('cartTotal');
      if (total) total.textContent = 'R$ 0,00';
      ['subtotal', 'discount', 'total'].forEach((id) => {
        const amount = document.getElementById(id);
        if (amount) amount.textContent = 'R$ 0,00';
      });
      const finalize = document.getElementById('finalizeBtn');
      if (finalize) finalize.disabled = true;
    }
    const details = action.match(/show(Supplier|Order|Sale|Account)\(['"]([^'"]+)['"]\)/);
    if (details) {
      const messages = {
        Supplier: `Detalhes do fornecedor: ${details[2]}`,
        Order: `Detalhes do pedido ${details[2]}`,
        Sale: `Detalhes da venda ${details[2]} serão exibidos aqui.`,
        Account: details[2]
      };
      window.alert(messages[details[1]]);
    }
    if (action.includes('updateReport()')) {
      const button = document.querySelector('.toolbar .button');
      if (button) {
        const original = button.textContent;
        button.textContent = 'Relatório atualizado';
        window.setTimeout(() => { button.textContent = original; }, 1400);
      }
    }
    const destination = action.match(/(?:window\.)?location\.href\s*=\s*'([^']+)'/);
    if (destination) {
      const route = destination[1].match(/(?:\.\.\/)?([^/]+)\/index\.html/);
      if (route) navigate(`/${route[1]}`);
    }
    const alertText = action.match(/alert\(['"]([\s\S]*?)['"]\)/);
    if (alertText && !action.includes('window.print')) window.alert(alertText[1]);
  };

  const handleLegacySubmit = (event) => {
    const action = event.target.getAttribute('data-legacy-action') || '';
    if (event.target.id === 'clientForm') {
      event.preventDefault();
      window.alert('Cliente pronto para ser salvo quando o banco de dados estiver conectado.');
    } else if (action.includes('submitAdjustment')) {
      event.preventDefault();
      const value = (id) => document.getElementById(id)?.value || '';
      window.alert(`✅ Ajuste realizado com sucesso!\n\nProduto: ${value('adjustProduct')}\nTipo: ${value('adjustType')}\nQuantidade: ${value('adjustQuantity')}\nMotivo: ${value('adjustReason')}`);
      document.getElementById('adjustModal')?.setAttribute('hidden', '');
      event.target.reset();
    }
  };

  const acceptImageFiles = (files) => {
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;
    if (uploadedImages.length) {
      setNotification({ text: 'Remova a imagem atual antes de selecionar outra.', type: 'error' });
      return;
    }
    if (selectedFiles.length > 1) {
      setNotification({ text: 'Selecione apenas uma imagem para o produto.', type: 'error' });
      return;
    }

    const [file] = selectedFiles;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setNotification({ text: 'Selecione uma imagem PNG, JPEG ou WEBP.', type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setNotification({ text: 'A imagem deve ter no máximo 5 MB.', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageLoading(false);
      if (typeof reader.result !== 'string') {
        setNotification({ text: 'Não foi possível ler a imagem selecionada.', type: 'error' });
        return;
      }
      setUploadedImages([reader.result]);
      setNotification(null);
    };
    reader.onerror = () => {
      setImageLoading(false);
      setNotification({ text: 'Não foi possível ler a imagem selecionada.', type: 'error' });
    };
    setImageLoading(true);
    reader.readAsDataURL(file);
  };

  const applyListFilter = (event) => {
    const input = event.target;
    const id = input.id;
    const tableConfig = {
      fornecedores: { table: 'supplierTable', term: 'search', filter: 'status', count: 'supplierCount', empty: 'empty', badge: 'status' },
      'pedidos-compra': { table: 'orderTable', term: 'search', filter: 'status', count: 'orderCount', empty: 'empty', badge: 'status' }
    }[name];
    if (name === 'contas' && id === 'search') {
      const term = input.value.toLowerCase();
      document.querySelectorAll('#accountTable tr').forEach((row) => {
        row.style.display = !term || row.innerText.toLowerCase().includes(term) ? '' : 'none';
      });
      return;
    }
    if (!tableConfig || ![tableConfig.term, tableConfig.filter].includes(id)) return;
    const term = document.getElementById(tableConfig.term)?.value.toLowerCase() || '';
    const filter = document.getElementById(tableConfig.filter)?.value.toLowerCase() || '';
    let visible = 0;
    document.querySelectorAll(`#${tableConfig.table} tr`).forEach((row) => {
      const badge = row.querySelector(`.${tableConfig.badge}`);
      const matches = (!term || row.innerText.toLowerCase().includes(term)) &&
        (!filter || badge?.innerText.toLowerCase() === filter);
      row.style.display = matches ? '' : 'none';
      if (matches) visible += 1;
    });
    const empty = document.getElementById(tableConfig.empty);
    if (empty) empty.style.display = visible ? 'none' : 'block';
    const count = document.getElementById(tableConfig.count);
    if (count) count.innerText = String(visible);
  };

  const handleLegacyChange = (event) => {
    applyListFilter(event);
    if (event.target.id === 'productImage' && event.target.files?.length) {
      acceptImageFiles(event.target.files);
    }
  };

  const allowedRoleRoutes = ROLE_ROUTES[userProfile?.role];
  const isLoggedIn = Boolean(userProfile && session);
  const isLoginScreen = name === 'login';
  const allowedForRole = userProfile?.role === 'admin' || Boolean(allowedRoleRoutes?.includes(name));
  const defaultRoute = userProfile?.role === 'product_clerk' ? '/adicionar-produto' :
    allowedRoleRoutes?.includes('pdv') ? '/pdv' : '/dashboard';

  return (
    <div
      className="app-shell"
      onClickCapture={handleLegacyClick}
      onSubmitCapture={handleLegacySubmit}
      onChangeCapture={handleLegacyChange}
      onDragOverCapture={(event) => {
        if (event.target.closest('#imageUpload')) {
          event.preventDefault();
          event.target.closest('#imageUpload').classList.add('dragover');
        }
      }}
      onDragLeaveCapture={(event) => {
        if (event.target.closest('#imageUpload')) event.target.closest('#imageUpload').classList.remove('dragover');
      }}
      onDropCapture={(event) => {
        if (event.target.closest('#imageUpload')) {
          event.preventDefault();
          event.target.closest('#imageUpload').classList.remove('dragover');
          acceptImageFiles(event.dataTransfer.files);
        }
      }}
      onInputCapture={(event) => {
        applyListFilter(event);
        if (event.target.id === 'productCost' || event.target.id === 'productPrice') updateMargin(event);
        if (event.target.id === 'email' || event.target.id === 'senha') {
          setMessage(null);
          setLoginErrors((current) => ({ ...current, [event.target.id]: '' }));
        }
      }}
    >
      <AuthContext.Provider value={{
        userProfile,
        updateUserProfile: (profile) => setUserProfile(profile),
        signOut: () => authClient?.auth.signOut()
      }}>
      {authLoading ? (
        <div className="screen-loading" role="status">Verificando acesso...</div>
      ) : authError && session ? (
        <div className="screen-loading" role="alert">
          <p>{authError}</p>
          <button type="button" onClick={() => authClient?.auth.signOut()}>Sair</button>
        </div>
      ) : !isLoggedIn && !isLoginScreen ? (
        <Navigate to="/index" replace />
      ) : isLoggedIn && isLoginScreen ? (
        <Navigate to={defaultRoute} replace />
      ) : isLoggedIn && userProfile.must_change_password ? (
        <section className="initial-password" aria-labelledby="initialPasswordTitle">
          <form onSubmit={changeInitialPassword}>
            <h1 id="initialPasswordTitle">Crie sua senha pessoal</h1>
            <p>Por segurança, altere a senha inicial antes de usar o sistema.</p>
            <label htmlFor="initialPassword">Nova senha</label>
            <input id="initialPassword" name="password" type="password" minLength="8" autoComplete="new-password" required />
            <label htmlFor="confirmInitialPassword">Confirme a nova senha</label>
            <input id="confirmInitialPassword" name="confirmPassword" type="password" minLength="8" autoComplete="new-password" required />
            {passwordMessage && <p role="status">{passwordMessage}</p>}
            <button type="submit" disabled={passwordSaving}>{passwordSaving ? 'Salvando...' : 'Salvar nova senha'}</button>
            <button type="button" onClick={() => authClient?.auth.signOut()}>Sair</button>
          </form>
        </section>
      ) : isLoggedIn && !allowedForRole ? (
        <Navigate to="/pdv" replace />
      ) : (
        <Suspense fallback={<div className="screen-loading" role="status">Carregando...</div>}>
          {isLoginScreen ? (
            <Screen
              message={message}
              errors={loginErrors}
              showPassword={showPassword}
              isLoading={loginLoading}
              onLogin={login}
              onTogglePassword={() => setShowPassword((current) => !current)}
            />
          ) : name === 'adicionar-produto' ? (
            <Screen
              onSubmit={registerProduct}
              notification={notification}
              registering={registering || imageLoading}
              margin={margin}
              images={uploadedImages}
              onRemoveImage={(index) => {
                setUploadedImages((images) => images.filter((_, imageIndex) => imageIndex !== index));
                const imageInput = document.getElementById('productImage');
                if (imageInput) imageInput.value = '';
              }}
            />
          ) : (
            <Screen />
          )}
        </Suspense>
      )}
      </AuthContext.Provider>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Application />
  </BrowserRouter>
);
