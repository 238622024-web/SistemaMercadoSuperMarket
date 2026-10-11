import { useCallback, useContext, useEffect, useState } from 'react';
import { authorizedFetch } from '../auth.js';
import { AuthContext } from '../authContext.js';
import { roleLabel } from '../roles.js';
import pageCss from '../../ProjetoSuperMarket/pdv/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function pdvScreen(props) {
  const { userProfile } = useContext(AuthContext);
  const [shift, setShift] = useState(null);
  const [registers, setRegisters] = useState([]);
  const [loadingShift, setLoadingShift] = useState(true);
  const [shiftError, setShiftError] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [savingShift, setSavingShift] = useState(false);
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
      await loadShifts();
    } catch (error) {
      setShiftError(error.message || 'Não foi possível fechar o caixa.');
    } finally {
      setSavingShift(false);
    }
  }

  function formatDuration(openedAt) {
    const seconds = Math.max(0, Math.floor((now - new Date(openedAt).getTime()) / 1000));
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const remainder = String(seconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${remainder}`;
  }

  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
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
        <div className="pdv-shift-banner">
          <div>
            <strong>Caixa {shift.register_number} aberto</strong>
            <span>Operador: {shift.operator_name} · Cargo: {roleLabel(shift.operator_role)}</span>
            <span>Início: {new Date(shift.opened_at).toLocaleString('pt-BR')} · Turno: {formatDuration(shift.opened_at)}</span>
          </div>
          <form className="pdv-close-shift" onSubmit={closeShift}>
            <label htmlFor="closingCash">Valor contado no fechamento (R$)</label>
            <input id="closingCash" type="number" min="0" step="0.01" required value={closingCash} onChange={(event) => setClosingCash(event.target.value)} />
            <button type="submit" disabled={savingShift}>{savingShift ? 'Fechando...' : 'Fechar caixa'}</button>
          </form>
          {shiftError && <p className="pdv-shift-error" role="alert">{shiftError}</p>}
        </div>
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
                    <button className="header-btn" data-legacy-action="alert('Histórico de vendas')">Histórico</button>
                  </div>
                </div>
              </div>
              <div className="header-info">
                <div className="operator-name">Operador: {userProfile?.full_name || shift.operator_name}</div>
                <div className="operator-role">Cargo: {roleLabel(userProfile?.role || shift.operator_role)}</div>
                <div className="session-time"><span>Turno:</span><span id="sessionTime">{formatDuration(shift.opened_at)}</span></div>
              </div>
            </div>
            <div className="search-bar">
              <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
                <input type="text" className="search-input" id="searchInput" placeholder="Digite o nome do produto ou código de barras..." autoFocus />
              </div>
              <button className="barcode-btn" data-legacy-action="alert('Leitor de código de barras em desenvolvimento.')">Código de Barras</button>
            </div>
          </div>
          <div className="categories-bar"><div className="categories-scroll">
            <button className="category-chip active" data-category="all">📦 Todos</button>
            <button className="category-chip" data-category="alimentos">🌾 Alimentos Básicos</button>
            <button className="category-chip" data-category="bebidas">🥤 Bebidas</button>
            <button className="category-chip" data-category="limpeza">🧼 Limpeza</button>
            <button className="category-chip" data-category="higiene">🧴 Higiene</button>
            <button className="category-chip" data-category="massas">🍝 Massas</button>
            <button className="category-chip" data-category="oleos">🫒 Óleos e Temperos</button>
          </div></div>
          <div className="products-grid" id="productsGrid"><div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}><p style={{ fontSize: '18px', marginBottom: '8px' }}>😕 Nenhum produto encontrado</p><small>Tente buscar por outro termo</small></div></div>
        </div>
        <div className="cart-area" id="cartArea">
          <div className="cart-header"><h2>Carrinho</h2><span className="cart-items-count" id="itemsCount">0 itens</span></div>
          <div className="cart-items" id="cartItems"><div className="empty-cart"><p>Carrinho vazio</p><small>Clique nos produtos para adicionar ao carrinho</small></div></div>
          <div className="cart-summary">
            <div className="summary-row"><span className="summary-label">Subtotal:</span><span className="summary-value" id="subtotal">R$ 0,00</span></div>
            <div className="summary-row"><span className="summary-label">Desconto:</span><span className="summary-value" id="discount">R$ 0,00</span></div>
            <div className="summary-row total"><span className="summary-label">TOTAL:</span><span className="summary-value" id="total">R$ 0,00</span></div>
            <div className="payment-methods"><div className="payment-title">💳 Forma de Pagamento</div><div className="payment-grid">
              <button className="payment-btn selected" data-method="money">💵 Dinheiro</button><button className="payment-btn" data-method="debit">💳 Débito</button><button className="payment-btn" data-method="credit">💳 Crédito</button><button className="payment-btn" data-method="pix">📱 PIX</button>
            </div></div>
            <button className="finalize-btn" id="finalizeBtn" disabled>Finalizar Venda</button>
            <div className="action-buttons"><button className="action-btn cancel" data-legacy-action="clearCart()">🗑️ Limpar</button><button className="action-btn" data-legacy-action="window.location.href = '../dashboard/index.html'">◀ Voltar</button></div>
          </div>
        </div>
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
