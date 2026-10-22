import { useCallback, useContext, useEffect, useState } from 'react';
import { authorizedFetch } from '../auth.js';
import { AuthContext } from '../authContext.js';
import { roleLabel } from '../roles.js';
import pageCss from '../../ProjetoSuperMarket/pdv/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import pdvReactCss from './pdv-react.css?inline';
import Sidebar from "../Sidebar.jsx";
export default function pdvScreen(props) {
  const { userProfile } = useContext(AuthContext);
  const [shift, setShift] = useState(null);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('money');
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState('');
  const [saleError, setSaleError] = useState('');
  const [saleNotice, setSaleNotice] = useState('');
  const [savingSale, setSavingSale] = useState(false);
  const [registers, setRegisters] = useState([]);
  const [loadingShift, setLoadingShift] = useState(true);
  const [shiftError, setShiftError] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [savingShift, setSavingShift] = useState(false);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [now, setNow] = useState(Date.now());

  const loadShifts = useCallback(async () => {
    setLoadingShift(true);
    setShiftError('');
    try {
      const response = await authorizedFetch('/api/pdv/shifts');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível consultar os caixas.');
      setShift(result.current);
      setRegisters(result.registers || []);
    } catch (error) {
      setShiftError(error.message || 'Não foi possível consultar os caixas.');
    } finally {
      setLoadingShift(false);
    }
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setProductsError('');
    try {
      const response = await authorizedFetch('/api/products');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar os produtos.');
      setProducts(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      setProducts([]);
      setProductsError(error.message || 'Não foi possível carregar os produtos.');
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const activeShiftId = shift?.id;
  useEffect(() => {
    if (activeShiftId) void loadProducts();
    else {
      setProducts([]);
      setCart([]);
    }
  }, [activeShiftId, loadProducts]);

  useEffect(() => {
    if (!shift) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [shift]);

  async function openShift(event) {
    event.preventDefault();
    setSavingShift(true);
    setShiftError('');
    try {
      const response = await authorizedFetch('/api/pdv/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registerNumber: Number(registerNumber), openingCash: Number(openingCash) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível abrir o caixa.');
      setShift(result.data);
      setClosingCash('');
      await loadShifts();
    } catch (error) {
      await loadShifts();
      setShiftError(error.message || 'Não foi possível abrir o caixa.');
    } finally {
      setSavingShift(false);
    }
  }

  async function closeShift(event) {
    event.preventDefault();
    if (!shift || !window.confirm(`Deseja fechar o Caixa ${shift.register_number}?`)) return;
    setSavingShift(true);
    setShiftError('');
    try {
      const response = await authorizedFetch(`/api/pdv/shifts/${shift.id}/close`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closingCash: Number(closingCash) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível fechar o caixa.');
      setShift(null);
      setOpeningCash('');
      setClosingCash('');
      setShowCloseShift(false);
      await loadShifts();
    } catch (error) {
      setShiftError(error.message || 'Não foi possível fechar o caixa.');
    } finally {
      setSavingShift(false);
    }
  }

  function addProduct(product) {
    if (savingSale) return;
    setSaleError('');
    setSaleNotice('');
    const existing = cart.find((item) => item.id === product.id);
    const increment = ['kg', 'l'].includes(String(product.unidade).toLowerCase()) ? 0.1 : 1;
    if ((existing?.quantity || 0) + increment > Number(product.estoque_atual || 0)) {
      setSaleError(`Estoque insuficiente para ${product.nome}.`);
      return;
    }
    if (existing) {
      setCart(cart.map((item) => item.id === product.id
        ? { ...item, quantity: Number((item.quantity + increment).toFixed(3)) }
        : item));
      return;
    }
    setCart([...cart, { ...product, quantity: increment }]);
  }

  function changeQuantity(productId, delta) {
    if (savingSale) return;
    setSaleError('');
    const selected = cart.find((item) => item.id === productId);
    if (!selected) return;
    const quantity = Number((selected.quantity + delta).toFixed(3));
    if (quantity > Number(selected.estoque_atual || 0)) {
      setSaleError(`Estoque insuficiente para ${selected.nome}.`);
      return;
    }
    setCart(quantity <= 0
      ? cart.filter((item) => item.id !== productId)
      : cart.map((item) => item.id === productId ? { ...item, quantity } : item));
  }

  async function finalizeSale() {
    if (!shift || !cart.length || savingSale) return;
    const total = cart.reduce((sum, item) => sum + Number(item.preco_venda) * item.quantity, 0);
    const paymentNames = {
      money: 'Dinheiro',
      debit: 'Cartão de débito',
      credit: 'Cartão de crédito',
      pix: 'PIX',
      elo_meal: 'Elo Refeição',
      elo_food: 'Elo Alimentação'
    };
    if (!window.confirm(`Confirmar venda de ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em ${paymentNames[paymentMethod]}?`)) return;

    setSavingSale(true);
    setSaleError('');
    setSaleNotice('');
    try {
      const response = await authorizedFetch('/api/pdv/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shiftId: shift.id,
          paymentMethod,
          items: cart.map((item) => ({ product_id: Number(item.id), quantity: item.quantity }))
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível registrar a venda.');
      setSaleNotice(`Venda ${result.data.sale_number} registrada com sucesso.`);
      setCart([]);
      setPaymentMethod('money');
      await loadProducts();
    } catch (error) {
      setSaleError(error.message || 'Não foi possível registrar a venda.');
    } finally {
      setSavingSale(false);
    }
  }

  function formatDuration(openedAt) {
    const seconds = Math.max(0, Math.floor((now - new Date(openedAt).getTime()) / 1000));
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const remainder = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${remainder}`;
  }

  const visibleProducts = products.filter((product) => {
    const search = productSearch.trim().toLocaleLowerCase('pt-BR');
    const matchesSearch = !search || [product.nome, product.codigo, product.codigo_barras, product.categoria]
      .some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(search));
    return matchesSearch && (!activeCategory || product.categoria === activeCategory);
  });
  const categories = [...new Set(products.map((product) => product.categoria).filter(Boolean))];
  const cartTotal = cart.reduce((sum, item) => sum + Number(item.preco_venda) * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const quantityLabel = (value, unit) => `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} ${unit || 'un'}`;

  return <><style>{pageCss}</style><style>{sidebarCss}</style><style>{pdvReactCss}</style><div className={`legacy-screen${shift ? ' pdv-active-screen' : ''}`}>
    <div className="app-container">
      
      <Sidebar />

      
      <div className="sidebar-overlay" id="sidebarOverlay"></div>

      {loadingShift ? (
        <main className="pdv-shift-page main-content"><section className="pdv-shift-card"><p>Consultando os caixas...</p></section></main>
      ) : shift ? (
        false
      ) : (
        <main className="pdv-shift-page main-content">
          <section className="pdv-shift-card">
            <h1>Abertura de caixa</h1>
            <p>Olá, {userProfile?.full_name || 'operador'}. Escolha um caixa disponível e informe o valor inicial do fundo.</p>
            <div className="pdv-register-list">
              {registers.map((register) => <div className={`pdv-register ${register.occupied ? 'occupied' : ''}`} key={register.register_number}>
                <div><strong>Caixa {register.register_number}</strong><span>{register.occupied ? `Em uso por ${register.operator_name}` : 'Disponível'}</span></div>
                {register.occupied && <small>Aberto às {new Date(register.opened_at).toLocaleTimeString('pt-BR')}</small>}
              </div>)}
            </div>
            <form onSubmit={openShift} className="pdv-open-shift">
              <label htmlFor="registerNumber">Número do caixa</label>
              <select id="registerNumber" required value={registerNumber} onChange={(event) => setRegisterNumber(event.target.value)}>
                <option value="">Selecione um caixa disponível</option>
                {registers.filter((register) => !register.occupied).map((register) => <option value={register.register_number} key={register.register_number}>Caixa {register.register_number}</option>)}
              </select>
              <label htmlFor="openingCash">Fundo inicial (R$)</label>
              <input id="openingCash" type="number" min="0" step="0.01" required value={openingCash} onChange={(event) => setOpeningCash(event.target.value)} />
              {shiftError && <p className="pdv-shift-error" role="alert">{shiftError}</p>}
              <button type="submit" disabled={savingShift || !registerNumber}>{savingShift ? 'Abrindo caixa...' : 'Abrir caixa e iniciar PDV'}</button>
            </form>
            <button type="button" className="pdv-refresh-button" onClick={loadShifts} disabled={loadingShift}>Atualizar disponibilidade</button>
          </section>
        </main>
      )}

      {shift && (
        <div className="pdv-container has-active-shift main-content" id="mainContent">
          <div className="products-area">
          <div className="pdv-header">
            <div className="header-top">
              <div className="header-left-pdv">
                <button className="menu-toggle-pdv" data-legacy-action="toggleSidebar()">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path></svg>
                </button>
                <div>
                  <h1>PDV - Caixa {shift.register_number}</h1>
                  <div className="header-actions">
                    <button className="header-btn" data-legacy-action="window.location.href = '../dashboard/index.html'">Dashboard</button>
                    <button className="header-btn" type="button" onClick={() => window.location.assign('/vendas')}>Histórico</button>
                    <button className="header-btn" type="button" onClick={() => { setClosingCash(''); setShowCloseShift(true); }} disabled={savingSale}>Fechar caixa</button>
                  </div>
                </div>
              </div>
              <div className="header-info">
                <div className="operator-name">Operador: {userProfile?.full_name || shift.operator_name}</div>
                <div className="operator-role">Cargo: {roleLabel(userProfile?.role || shift.operator_role)}</div>
                <div className="session-time"><span>Turno:</span><span id="sessionTime">{formatDuration(shift.opened_at)}</span></div>
              </div>
            </div>
            {shiftError && <p className="pdv-header-error" role="alert">{shiftError}</p>}
            <div className="search-bar">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
                <input type="search" className="search-input" id="searchInput" value={productSearch} onChange={(event) => setProductSearch(event.target.value)} onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    const exactBarcode = products.find((product) => product.codigo_barras === productSearch.trim() || product.codigo === productSearch.trim());
                    if (exactBarcode) {
                      event.preventDefault();
                      addProduct(exactBarcode);
                      setProductSearch('');
                    }
                  }
                }} placeholder="Digite o nome do produto ou código de barras..." autoFocus />
              </div>
              <button className="barcode-btn" type="button" onClick={() => document.getElementById('searchInput')?.focus()}>Buscar produto</button>
            </div>
          </div>
          <div className="categories-bar"><div className="categories-scroll">
            <button className={`category-chip${activeCategory ? '' : ' active'}`} type="button" onClick={() => setActiveCategory('')}>Todos</button>
            {categories.map((category) => <button className={`category-chip${activeCategory === category ? ' active' : ''}`} type="button" key={category} onClick={() => setActiveCategory(category)}>{category}</button>)}
          </div></div>
          {productsError && <div className="pdv-sale-feedback error" role="alert">{productsError} <button type="button" onClick={() => void loadProducts()}>Tentar novamente</button></div>}
          <div className="products-grid" id="productsGrid">
            {loadingProducts ? <p className="pdv-products-message" role="status">Carregando produtos...</p> :
              visibleProducts.length ? visibleProducts.map((product) => {
                const stock = Number(product.estoque_atual || 0);
                const outOfStock = stock <= 0;
                return <button className={`product-card${stock <= Number(product.estoque_minimo || 0) ? ' low-stock' : ''}`} type="button" key={product.id} disabled={outOfStock || savingSale} onClick={() => addProduct(product)}>
                  {stock <= Number(product.estoque_minimo || 0) && !outOfStock && <span className="low-stock-badge">Estoque baixo</span>}
                  {product.imagem_url ? <img className="product-image" src={product.imagem_url} alt="" /> : <span className="product-image" aria-hidden="true">📦</span>}
                  <span className="product-name">{product.nome}</span>
                  <span className="product-price">{currency(product.preco_venda)}</span>
                  <span className={`product-stock${outOfStock ? ' low' : ''}`}>{outOfStock ? 'Sem estoque' : `Disponível: ${quantityLabel(stock, product.unidade)}`}</span>
                </button>;
              }) : <p className="pdv-products-message">{products.length ? 'Nenhum produto corresponde à busca.' : 'Nenhum produto ativo cadastrado.'}</p>}
          </div>
        </div>
        <div className="cart-area" id="cartArea">
          <div className="cart-header"><h2>Carrinho</h2><span className="cart-items-count" id="itemsCount">{quantityLabel(cartCount, 'itens')}</span></div>
          <div className="cart-items" id="cartItems">{cart.length ? cart.map((item) => {
            const increment = ['kg', 'l'].includes(String(item.unidade).toLowerCase()) ? 0.1 : 1;
            return <div className="cart-item" key={item.id}>
              <div className="item-image" aria-hidden="true">📦</div>
              <div className="item-details">
                <div className="item-name">{item.nome}</div>
                <div className="item-price">{currency(item.preco_venda)} / {item.unidade || 'un'}</div>
                <div className="quantity-control">
                  <button className="qty-btn" type="button" onClick={() => changeQuantity(item.id, -increment)} aria-label={`Diminuir quantidade de ${item.nome}`}>−</button>
                  <span className="qty-value">{Number(item.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 })}</span>
                  <button className="qty-btn" type="button" onClick={() => changeQuantity(item.id, increment)} aria-label={`Aumentar quantidade de ${item.nome}`}>+</button>
                </div>
              </div>
              <div className="item-controls"><span className="item-total">{currency(Number(item.preco_venda) * item.quantity)}</span></div>
            </div>;
          }) : <div className="empty-cart"><p>Carrinho vazio</p><small>Selecione produtos cadastrados para iniciar a venda</small></div>}</div>
          <div className="cart-summary">
            <div className="summary-row"><span className="summary-label">Subtotal:</span><span className="summary-value" id="subtotal">{currency(cartTotal)}</span></div>
            <div className="summary-row"><span className="summary-label">Desconto:</span><span className="summary-value" id="discount">{currency(0)}</span></div>
            <div className="summary-row total"><span className="summary-label">TOTAL:</span><span className="summary-value" id="total">{currency(cartTotal)}</span></div>
            <div className="payment-methods"><div className="payment-title">💳 Forma de Pagamento</div><div className="payment-grid">
              {[
                ['money', '💵 Dinheiro'], ['debit', '💳 Débito'], ['credit', '💳 Crédito'],
                ['pix', '📱 PIX'], ['elo_meal', '🍽️ Elo Refeição'], ['elo_food', '🛒 Elo Alimentação']
              ].map(([method, label]) => <button className={`payment-btn${paymentMethod === method ? ' selected' : ''}`} type="button" key={method} disabled={savingSale} onClick={() => setPaymentMethod(method)}>{label}</button>)}
            </div></div>
            <p className="pdv-payment-note">A forma é registrada na venda. A cobrança no cartão é feita na maquininha.</p>
            {saleError && <p className="pdv-sale-feedback error" role="alert">{saleError}</p>}
            {saleNotice && <p className="pdv-sale-feedback success" role="status">{saleNotice}</p>}
            <button className="finalize-btn" id="finalizeBtn" type="button" disabled={!cart.length || savingSale} onClick={finalizeSale}>{savingSale ? 'Registrando venda...' : 'Finalizar Venda'}</button>
            <div className="action-buttons"><button className="action-btn cancel" type="button" disabled={savingSale} onClick={() => { setCart([]); setSaleError(''); setSaleNotice(''); }}>🗑️ Limpar</button><button className="action-btn" type="button" onClick={() => window.location.assign('/dashboard')}>◀ Voltar</button></div>
          </div>
        </div>
        </div>
      )}

      {shift && showCloseShift && (
        <div className="pdv-close-modal-overlay" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !savingShift) setShowCloseShift(false);
        }}>
          <form className="pdv-close-modal" onSubmit={closeShift} aria-labelledby="closeShiftTitle">
            <button className="pdv-close-modal-dismiss" type="button" aria-label="Cancelar fechamento" onClick={() => setShowCloseShift(false)} disabled={savingShift}>×</button>
            <h2 id="closeShiftTitle">Fechar Caixa {shift.register_number}</h2>
            <p>Informe o valor contado no caixa para encerrar o turno.</p>
            <label htmlFor="closingCash">Valor contado (R$)</label>
            <input id="closingCash" type="number" min="0" step="0.01" required value={closingCash} onChange={(event) => setClosingCash(event.target.value)} />
            {shiftError && <p className="pdv-shift-error" role="alert">{shiftError}</p>}
            <div className="pdv-close-modal-actions">
              <button type="button" onClick={() => setShowCloseShift(false)} disabled={savingShift}>Cancelar</button>
              <button type="submit" disabled={savingShift || savingSale}>{savingShift ? 'Fechando...' : 'Confirmar fechamento'}</button>
            </div>
          </form>
        </div>
      )}

      {false && (
      <div className="pdv-container main-content" id="mainContent">
        
        <div className="products-area">
          <div className="pdv-header">
            <div className="header-top">
              <div className="header-left-pdv">
                <button className="menu-toggle-pdv" data-legacy-action="toggleSidebar()">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
                  </svg>
                </button>
                <div>
                  <h1>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"></path>
                    </svg>
                    PDV - Caixa
                  </h1>
                  <div className="header-actions">
                    <button className="header-btn" data-legacy-action="window.location.href = '../dashboard/index.html'">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"></path>
                      </svg>
                      Dashboard
                    </button>
                    <button className="header-btn" data-legacy-action="alert('Histórico de vendas')">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"></path>
                      </svg>
                      Histórico
                    </button>
                  </div>
                </div>
              </div>
              <div className="header-info">
                <div className="operator-name">Operador: Administrador</div>
                <div className="operator-role">Cargo: Gerente</div>
                <div className="session-time">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path>
                  </svg>
                  <span id="sessionTime">00:00:00</span>
                </div>
              </div>
            </div>
            <div className="search-bar">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                </svg>
                <input type="text" className="search-input" id="searchInput" placeholder="Digite o nome do produto ou código de barras..." autoFocus />
              </div>
              <button className="barcode-btn" data-legacy-action="alert(
                    '🔍 Leitor de código de barras\n\nFuncionalidade em desenvolvimento.\nEm breve você poderá usar um leitor físico!',
                  )">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 6h2v12H4zm3 0h1v12H7zm2 0h3v12H9zm4 0h1v12h-1zm3 0h1v12h-1zm2 0h3v12h-3z"></path>
                </svg>
                <span>Código de Barras</span>
              </button>
            </div>
          </div>

          
          <div className="categories-bar">
            <div className="categories-scroll">
              <button className="category-chip active" data-category="all">
                📦 Todos
              </button>
              <button className="category-chip" data-category="alimentos">
                🌾 Alimentos Básicos
              </button>
              <button className="category-chip" data-category="bebidas">
                🥤 Bebidas
              </button>
              <button className="category-chip" data-category="limpeza">
                🧼 Limpeza
              </button>
              <button className="category-chip" data-category="higiene">
                🧴 Higiene
              </button>
              <button className="category-chip" data-category="massas">
                🍝 Massas
              </button>
              <button className="category-chip" data-category="oleos">
                🫒 Óleos e Temperos
              </button>
            </div>
          </div>

          <div className="products-grid" id="productsGrid">
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>😕 Nenhum produto encontrado</p>
              <small>Tente buscar por outro termo</small>
            </div>
          </div>
        </div>

        
        <div className="cart-area" id="cartArea">
          <div className="cart-header">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"></path>
              </svg>
              Carrinho
            </h2>
            <span className="cart-items-count" id="itemsCount">0 itens</span>
          </div>

          <div className="cart-items" id="cartItems">
            <div className="empty-cart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"></path>
              </svg>
              <p>Carrinho vazio</p>
              <small>Clique nos produtos para adicionar ao carrinho</small>
            </div>
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span className="summary-label">Subtotal:</span>
              <span className="summary-value" id="subtotal">R$ 0,00</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Desconto:</span>
              <span className="summary-value" id="discount">R$ 0,00</span>
            </div>
            <div className="summary-row total">
              <span className="summary-label">TOTAL:</span>
              <span className="summary-value" id="total">R$ 0,00</span>
            </div>

            <div className="payment-methods">
              <div className="payment-title">💳 Forma de Pagamento</div>
              <div className="payment-grid">
                <button className="payment-btn selected" data-method="money">
                  💵 Dinheiro
                </button>
                <button className="payment-btn" data-method="debit">
                  💳 Débito
                </button>
                <button className="payment-btn" data-method="credit">
                  💳 Crédito
                </button>
                <button className="payment-btn" data-method="pix">📱 PIX</button>
                <button className="payment-btn" data-method="elo_meal">🍽️ Elo Refeição</button>
                <button className="payment-btn" data-method="elo_food">🛒 Elo Alimentação</button>
              </div>
            </div>

            <button className="finalize-btn" id="finalizeBtn" disabled>
              Finalizar Venda
            </button>

            <div className="action-buttons">
              <button className="action-btn cancel" data-legacy-action="clearCart()">
                🗑️ Limpar
              </button>
              <button className="action-btn" data-legacy-action="window.location.href = '../dashboard/index.html'">
                ◀ Voltar
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      
      <div className="toast" id="toast">
        <svg className="toast-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
        </svg>
        <span className="toast-message" id="toastMessage"></span>
      </div>

      
    </div>

    
      
      


</div></>;
}
