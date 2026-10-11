import pageCss from '../../ProjetoSuperMarket/categorias/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function categoriasScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app-container">
      <Sidebar />

      <div className="sidebar-overlay" id="sidebarOverlay"></div>

      <main className="main-content" id="mainContent">
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" id="menuToggle" aria-label="Abrir menu">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1 className="header-title">Categorias</h1>
          </div>
          <div className="header-right">
            <button className="header-icon-btn" aria-label="Notificações">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
              </svg>
            </button>
            <button className="header-icon-btn" aria-label="Ajuda">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
              </svg>
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-header">
            <div className="page-breadcrumb">
              <span>Gerenciamento</span>
              <span className="breadcrumb-separator">/</span>
              <span>Produtos</span>
              <span className="breadcrumb-separator">/</span>
              <span style={{color: "#667eea"}}>Categorias</span>
            </div>
            <p className="page-subtitle">
              Organize os produtos do seu supermercado por tipo e segmento.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon blue">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>12</h3>
                  <p>Total de Categorias</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon green">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>10</h3>
                  <p>Categorias Ativas</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon orange">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 0 1 9.5 9 2.5 2.5 0 0 1 12 6.5 2.5 2.5 0 0 1 14.5 9 2.5 2.5 0 0 1 12 11.5z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>205</h3>
                  <p>Produtos Mapeados</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon red">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>02</h3>
                  <p>Em Revisão</p>
                </div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="section-toolbar">
              <div className="toolbar-left">
                <div className="search-box">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                  </svg>
                  <input type="text" placeholder="Buscar categoria..." />
                </div>
                <button className="filter-btn" data-legacy-action="alert('Filtros em desenvolvimento')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path>
                  </svg>
                  Filtros
                </button>
              </div>
              <div className="toolbar-right">
                <button className="btn-secondary" data-legacy-action="alert('Exportar categorias')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"></path>
                  </svg>
                  Exportar
                </button>
                <button className="btn-primary" data-legacy-action="alert('Nova categoria')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                  </svg>
                  Nova Categoria
                </button>
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Categoria</th>
                    <th>Produtos</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="category-meta">
                        <div className="category-icon">F</div>
                        <div className="category-name">
                          <strong>Frutas</strong>
                          <span>Categoria principal</span>
                        </div>
                      </div>
                    </td>
                    <td>48</td>
                    <td>R$ 3.420,00</td>
                    <td>
                      <span className="category-badge badge-green">Ativa</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn" aria-label="Editar">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-1.34-1.34a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.35-1.33z"></path>
                          </svg>
                        </button>
                        <button className="action-btn" aria-label="Excluir">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zm3-4h6l1 2h4v2H4V5h4l1-2z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="category-meta">
                        <div className="category-icon" style={{background: "linear-gradient(\n                              135deg,\n                              #dcfce7 0%,\n                              #dbeafe 100%\n                            )", color: "#15803d"}}>
                          L
                        </div>
                        <div className="category-name">
                          <strong>Laticínios</strong>
                          <span>Categoria fresca</span>
                        </div>
                      </div>
                    </td>
                    <td>31</td>
                    <td>R$ 2.180,00</td>
                    <td>
                      <span className="category-badge badge-blue">Normal</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn" aria-label="Editar">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-1.34-1.34a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.35-1.33z"></path>
                          </svg>
                        </button>
                        <button className="action-btn" aria-label="Excluir">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zm3-4h6l1 2h4v2H4V5h4l1-2z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="category-meta">
                        <div className="category-icon" style={{background: "linear-gradient(\n                              135deg,\n                              #fef3c7 0%,\n                              #fde68a 100%\n                            )", color: "#b45309"}}>
                          B
                        </div>
                        <div className="category-name">
                          <strong>Bebidas</strong>
                          <span>Refrigerantes e sucos</span>
                        </div>
                      </div>
                    </td>
                    <td>57</td>
                    <td>R$ 4.760,00</td>
                    <td>
                      <span className="category-badge badge-orange">Promoção</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn" aria-label="Editar">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-1.34-1.34a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.35-1.33z"></path>
                          </svg>
                        </button>
                        <button className="action-btn" aria-label="Excluir">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zm3-4h6l1 2h4v2H4V5h4l1-2z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="category-meta">
                        <div className="category-icon" style={{background: "linear-gradient(\n                              135deg,\n                              #e9d5ff 0%,\n                              #f3e8ff 100%\n                            )", color: "#7c3aed"}}>
                          H
                        </div>
                        <div className="category-name">
                          <strong>Higiene</strong>
                          <span>Itens pessoais</span>
                        </div>
                      </div>
                    </td>
                    <td>26</td>
                    <td>R$ 1.940,00</td>
                    <td>
                      <span className="category-badge badge-purple">Destaque</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn" aria-label="Editar">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-1.34-1.34a1.003 1.003 0 0 0-1.42 0l-1.34 1.34 3.75 3.75 1.35-1.33z"></path>
                          </svg>
                        </button>
                        <button className="action-btn" aria-label="Excluir">
                          <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7zm3-4h6l1 2h4v2H4V5h4l1-2z"></path>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="pagination-info">
                Mostrando <strong>04</strong> de <strong>12</strong> categorias
              </div>
              <div className="pagination-controls">
                <button className="page-btn" disabled>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width: "16px", height: "16px"}}>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                  </svg>
                </button>
                <button className="page-btn active">1</button>
                <button className="page-btn">2</button>
                <button className="page-btn">
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width: "16px", height: "16px"}}>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    
    
      
      


</div></>;
}
