import pageCss from '../../ProjetoSuperMarket/pdv/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function pdvScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app-container">
      
      <Sidebar />

      
      <div className="sidebar-overlay" id="sidebarOverlay"></div>

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

      
      <div className="toast" id="toast">
        <svg className="toast-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
        </svg>
        <span className="toast-message" id="toastMessage"></span>
      </div>

      
    </div>

    
      
      


</div></>;
}
