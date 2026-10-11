import pageCss from '../../ProjetoSuperMarket/analise/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function analiseScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app-container">
      <Sidebar />

      <main className="main-content" id="mainContent">
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" data-legacy-action="toggleSidebar()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1 className="header-title">Análise</h1>
          </div>
        </header>

        <div className="page-content">
          <div className="page-header">
            <div className="page-breadcrumb">
              <a href="/dashboard" className="breadcrumb-link">Início</a>
              <span>/</span>
              <span>Análise</span>
            </div>
            <p className="page-subtitle">
              Acompanhe métricas do negócio, desempenho geral e movimentos mais
              relevantes do mercado.
            </p>
          </div>

          <div className="dashboard-toolbar">
            <div>
              <h2>Visão geral do negócio</h2>
              <p>Desempenho comercial e pontos de atenção da operação.</p>
            </div>
            <div className="toolbar-actions">
              <select className="period-select" id="periodSelect" aria-label="Período da análise" value={props.period} onChange={props.onPeriodChange}>
                <option value="7">Últimos 7 dias</option>
                <option value="30" selected>Últimos 30 dias</option>
                <option value="90">Últimos 90 dias</option>
              </select>
              <button className="export-button" id="exportButton" type="button" onClick={props.onExport}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"></path>
                </svg>
                Exportar
              </button>
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <div className="stat-label">Faturamento</div>
              <div className="stat-value" id="revenueValue">{props.revenue}</div>
              <div className="stat-meta">↑ 12,8% vs. período anterior</div>
            </article>
            <article className="stat-card">
              <div className="stat-label">Vendas realizadas</div>
              <div className="stat-value" id="salesValue">{props.sales}</div>
              <div className="stat-meta">↑ 8,4% vs. período anterior</div>
            </article>
            <article className="stat-card">
              <div className="stat-label">Ticket médio</div>
              <div className="stat-value" id="ticketValue">{props.ticket}</div>
              <div className="stat-meta">↑ 4,1% vs. período anterior</div>
            </article>
            <article className="stat-card">
              <div className="stat-label">Margem bruta</div>
              <div className="stat-value" id="marginValue">{props.margin}</div>
              <div className="stat-meta neutral">Meta mensal: 30%</div>
            </article>
          </div>

          <div className="analysis-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Faturamento ao longo do período</div>
                  <div className="panel-caption">
                    Receita bruta por dia, em reais
                  </div>
                </div>
                <span className="simulated-badge">Dados simulados</span>
              </div>
              <div className="chart-wrap">
                <canvas id="salesChart" ref={props.chartRef} aria-label="Gráfico de faturamento por dia"></canvas>
              </div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Vendas por categoria</div>
                  <div className="panel-caption">Participação no faturamento</div>
                </div>
              </div>
              <div className="category-list" id="categoryList">{props.categories}</div>
            </section>
          </div>

          <div className="bottom-grid">
            <section className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Produtos mais vendidos</div>
                  <div className="panel-caption">
                    Itens com maior saída no período
                  </div>
                </div>
                <a className="panel-link" href="/produtos">Ver produtos</a>
              </div>
              <div className="product-list" id="productList">{props.topProducts}</div>
            </section>

            <section className="panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">Atenção necessária</div>
                  <div className="panel-caption">Indicadores para agir hoje</div>
                </div>
                <a className="panel-link" href="/estoque">Estoque</a>
              </div>
              <div className="alert-list">
                <div className="alert-item critical">
                  <span className="alert-icon">!</span>
                  <div>
                    <div className="alert-name">Arroz Tipo 1 5kg</div>
                    <div className="alert-detail">2 unidades em estoque</div>
                  </div>
                </div>
                <div className="alert-item">
                  <span className="alert-icon">!</span>
                  <div>
                    <div className="alert-name">Leite Integral 1L</div>
                    <div className="alert-detail">Estoque abaixo do mínimo</div>
                  </div>
                </div>
                <div className="alert-item">
                  <span className="alert-icon">!</span>
                  <div>
                    <div className="alert-name">Óleo de Soja 900ml</div>
                    <div className="alert-detail">Validade em 18 dias</div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>

    <div className="sidebar-overlay" id="sidebarOverlay"></div>

    
    
      
      


</div></>;
}
