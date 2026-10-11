import pageCss from '../../ProjetoSuperMarket/dashboard/style.css?inline';
import dashboardCss from './dashboard.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";

const recentSales = [
  { id: 'V-1048', customer: 'Mariana Costa', products: 'Arroz, feijão e óleo', time: '14:32', total: 'R$ 186,40', payment: 'Pix', status: 'Concluída' },
  { id: 'V-1047', customer: 'Carlos Oliveira', products: 'Leite e pão de forma', time: '14:18', total: 'R$ 42,90', payment: 'Débito', status: 'Concluída' },
  { id: 'V-1046', customer: 'Ana Souza', products: 'Hortifruti (6 itens)', time: '13:56', total: 'R$ 93,75', payment: 'Crédito', status: 'Concluída' },
  { id: 'V-1045', customer: 'João Santos', products: 'Limpeza (4 itens)', time: '13:41', total: 'R$ 78,20', payment: 'Dinheiro', status: 'Concluída' }
];

const bestSellingProducts = [
  { name: 'Arroz Integral 1kg', category: 'Alimentos', quantity: 86, revenue: 'R$ 1.290,00' },
  { name: 'Feijão Carioca 1kg', category: 'Alimentos', quantity: 72, revenue: 'R$ 936,00' },
  { name: 'Leite Integral 1L', category: 'Laticínios', quantity: 64, revenue: 'R$ 384,00' },
  { name: 'Óleo de Soja 900ml', category: 'Alimentos', quantity: 51, revenue: 'R$ 459,00' }
];

const weeklySales = [
  { day: 'Seg', x: 48, y: 135 },
  { day: 'Ter', x: 152, y: 105 },
  { day: 'Qua', x: 256, y: 119 },
  { day: 'Qui', x: 360, y: 70 },
  { day: 'Sex', x: 464, y: 88 },
  { day: 'Sáb', x: 568, y: 42 },
  { day: 'Dom', x: 672, y: 58 }
];

export default function dashboardScreen(props) {
  return <><style>{pageCss}</style><style>{dashboardCss}</style><style>{sidebarCss}</style><div className="legacy-screen dashboard-screen">
    <div className="app-container">
      
      <Sidebar />

      
      <div className="sidebar-overlay" id="sidebarOverlay" data-legacy-action="toggleMobileSidebar()"></div>

      
      <main className="main-content" id="mainContent">
        
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" data-legacy-action="toggleSidebar()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1 className="header-title">Dashboard</h1>
          </div>
          <div className="header-right">
            <div className="search-box">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
              </svg>
              <input type="text" placeholder="Pesquisar..." />
            </div>
            <button className="header-icon-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
              </svg>
              <span className="notification-badge"></span>
            </button>
            <button className="header-icon-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path>
              </svg>
            </button>
          </div>
        </header>

        
        <div className="page-content">
          
          <div className="page-header">
            <div className="page-breadcrumb">
              <span>Dashboard</span>
              <span className="breadcrumb-separator">›</span>
              <span>Início</span>
            </div>
            <h2 className="header-title">Visão Geral</h2>
            <p className="page-subtitle">
              Acompanhe as principais métricas do seu negócio em tempo real
            </p>
            <div className="demo-notice" role="note">
              <span className="demo-notice-dot" aria-hidden="true"></span>
              Modo demonstração: os valores e registros exibidos são simulados.
            </div>
          </div>

          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon blue">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"></path>
                  </svg>
                </div>
                <div className="stat-trend up">
                  <span>↑ 15% <small>vs. ontem</small></span>
                </div>
              </div>
              <div className="stat-value">R$ 1.248,50</div>
              <div className="stat-label">Vendas do Dia</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon green">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"></path>
                  </svg>
                </div>
                <div className="stat-trend up">
                  <span>↑ 23% <small>vs. mês anterior</small></span>
                </div>
              </div>
              <div className="stat-value">R$ 28.640,90</div>
              <div className="stat-label">Receita do Mês</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon purple">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"></path>
                  </svg>
                </div>
                <div className="stat-trend down">
                  <span>312 itens</span>
                </div>
              </div>
              <div className="stat-value">312</div>
              <div className="stat-label">Produtos em Estoque</div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon orange">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                  </svg>
                </div>
                <div className="stat-trend up">
                  <span>↑ 8% <small>vs. ontem</small></span>
                </div>
              </div>
              <div className="stat-value">24</div>
              <div className="stat-label">Vendas Realizadas</div>
            </div>
          </div>

          <section className="content-section sales-chart-section" aria-labelledby="sales-chart-title">
            <div className="section-header">
              <div>
                <h3 className="section-title" id="sales-chart-title">Faturamento da semana</h3>
                <p className="chart-caption">Acompanhe a evolução das vendas nos últimos 7 dias</p>
              </div>
              <div className="chart-total">
                <span>Total da semana</span>
                <strong>R$ 7.845,20</strong>
              </div>
            </div>
            <div className="sales-chart">
              <div className="chart-y-labels" aria-hidden="true">
                <span>R$ 1.500</span>
                <span>R$ 1.000</span>
                <span>R$ 500</span>
                <span>R$ 0</span>
              </div>
              <svg className="sales-chart-svg" viewBox="0 0 720 190" role="img" aria-label="Gráfico demonstrativo de vendas crescendo durante a semana">
                <defs>
                  <linearGradient id="salesArea" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#667eea" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#667eea" stopOpacity="0.01" />
                  </linearGradient>
                </defs>
                {[24, 70, 116, 162].map((y) => <line className="chart-grid-line" key={y} x1="24" x2="696" y1={y} y2={y} />)}
                <path className="chart-area" d={`M ${weeklySales.map(({ x, y }) => `${x} ${y}`).join(' L ')} L 672 162 L 48 162 Z`} />
                <polyline className="chart-line" points={weeklySales.map(({ x, y }) => `${x},${y}`).join(' ')} />
                {weeklySales.map(({ day, x, y }) => <circle className="chart-point" key={day} cx={x} cy={y} r="4" />)}
              </svg>
              <div className="chart-x-labels" aria-hidden="true">
                {weeklySales.map(({ day }) => <span key={day}>{day}</span>)}
              </div>
            </div>
          </section>

          <div className="content-section">
            <div className="section-header">
              <h3 className="section-title">Últimas Vendas do Dia</h3>
              <a className="section-action" href="/vendas">Ver Todas</a>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Produtos</th>
                  <th>Horário</th>
                  <th>Valor</th>
                  <th>Pagamento</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale) => (
                  <tr key={sale.id}>
                    <td className="demo-cell-strong">{sale.id}</td>
                    <td>{sale.customer}</td>
                    <td>{sale.products}</td>
                    <td>{sale.time}</td>
                    <td className="demo-cell-strong">{sale.total}</td>
                    <td>{sale.payment}</td>
                    <td><span className="demo-status">{sale.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          
          <div style={{display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px"}} className="responsive-grid">
            
            <div className="content-section">
              <div className="section-header">
                <h3 className="section-title">Produtos Mais Vendidos</h3>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Qtd. Vendida</th>
                    <th>Receita</th>
                  </tr>
                </thead>
                <tbody>
                  {bestSellingProducts.map((product) => (
                    <tr key={product.name}>
                      <td className="demo-cell-strong">{product.name}</td>
                      <td>{product.category}</td>
                      <td>{product.quantity} un.</td>
                      <td className="demo-cell-strong">{product.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            
            <div className="content-section">
              <div className="section-header" style={{borderBottom: "none", paddingBottom: "0"}}>
                <h3 className="section-title">Alertas de Estoque</h3>
              </div>
              <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
                <div className="inventory-alert inventory-alert-warning">
                  <div className="inventory-alert-title">
                    Estoque Baixo
                  </div>
                  <div className="inventory-alert-product">
                    Óleo de Soja 900ml
                  </div>
                  <div className="inventory-alert-detail">
                    Apenas 8 unidades restantes
                  </div>
                </div>
                <div className="inventory-alert inventory-alert-danger">
                  <div className="inventory-alert-title">
                    Estoque Crítico
                  </div>
                  <div className="inventory-alert-product">
                    Macarrão Espaguete 500g
                  </div>
                  <div className="inventory-alert-detail">
                    Apenas 3 unidades restantes
                  </div>
                </div>
                <div className="inventory-alert inventory-alert-warning">
                  <div className="inventory-alert-title">
                    Estoque Baixo
                  </div>
                  <div className="inventory-alert-product">
                    Detergente Líquido 500ml
                  </div>
                  <div className="inventory-alert-detail">
                    Apenas 12 unidades restantes
                  </div>
                </div>
                <div className="inventory-alert inventory-alert-info">
                  <div className="inventory-alert-title">
                    Validade Próxima
                  </div>
                  <div className="inventory-alert-product">
                    Iogurte Natural 170g
                  </div>
                  <div className="inventory-alert-detail">
                    Vence em 5 dias - 28 unidades
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    
    
      
      


</div></>;
}
