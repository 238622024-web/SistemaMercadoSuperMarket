import pageCss from '../../ProjetoSuperMarket/vendas/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function vendasScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app">
      <Sidebar />
      <div className="mobile-overlay" id="overlay"></div>
      <main className="main" id="main">
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" data-legacy-action="toggleSidebar()" aria-label="Abrir menu">
              <svg viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1 className="header-title">Histórico de Vendas</h1>
          </div>
        </header>
        <section className="page-content">
          <div className="breadcrumb">
            <a href="/dashboard">Início</a><span>/</span><a href="/pdv">Vendas</a><span>/</span><span>Histórico</span>
          </div>
          <div className="page-intro">
            <h2>Histórico de vendas</h2>
            <p>
              Consulte, filtre e acompanhe todas as vendas realizadas no
              sistema.
            </p>
          </div>
          <div className="toolbar">
            <div className="field">
              <label htmlFor="period">Período</label><select id="period">
                <option>Hoje</option>
                <option selected>Últimos 7 dias</option>
                <option>Últimos 30 dias</option>
                <option>Este mês</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="search">Buscar venda</label><input id="search" type="search" placeholder="Código ou cliente" />
            </div>
            <div className="field">
              <label htmlFor="payment">Pagamento</label><select id="payment">
                <option value="">Todos</option>
                <option>Pix</option>
                <option>Cartão</option>
                <option>Dinheiro</option>
              </select>
            </div>
            <button className="button" type="button" data-legacy-action="filterSales()">
              <svg viewBox="0 0 24 24">
                <path d="M9.5 3a6.5 6.5 0 0 0 0 13c1.61 0 3.09-.59 4.23-1.57L19.29 20 20.7 18.59l-5.98-5.98A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 0 0 9.5 3zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"></path></svg>Filtrar</button><button className="button secondary" type="button" data-legacy-action="window.print()">
              Exportar
            </button>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-label">Vendas no período</div>
              <div className="stat-value" id="salesCount">48</div>
              <div className="stat-meta">+12,5% vs. período anterior</div>
            </div>
            <div className="stat">
              <div className="stat-label">Faturamento</div>
              <div className="stat-value">R$ 8.642,80</div>
              <div className="stat-meta">+8,2% vs. período anterior</div>
            </div>
            <div className="stat">
              <div className="stat-label">Ticket médio</div>
              <div className="stat-value">R$ 180,06</div>
              <div className="stat-meta neutral">Por venda realizada</div>
            </div>
            <div className="stat">
              <div className="stat-label">Cancelamentos</div>
              <div className="stat-value">2</div>
              <div className="stat-meta neutral">4,1% das vendas</div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Vendas realizadas</div>
                <div className="panel-caption">
                  48 registros encontrados no período selecionado
                </div>
              </div>
              <span className="status">Operação normal</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Venda</th>
                    <th>Data e hora</th>
                    <th>Cliente</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="salesTable">
                  <tr>
                    <td><strong>#V-1048</strong></td>
                    <td>21/09/2026, 14:32</td>
                    <td>Consumidor final</td>
                    <td className="payment">Pix</td>
                    <td><strong>R$ 286,40</strong></td>
                    <td><span className="status">Concluída</span></td>
                    <td>
                      <button className="action" data-legacy-action="showSale('#V-1048')" aria-label="Ver detalhes">
                        ›
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>#V-1047</strong></td>
                    <td>21/09/2026, 14:05</td>
                    <td>Mariana Oliveira</td>
                    <td className="payment">Cartão</td>
                    <td><strong>R$ 94,90</strong></td>
                    <td><span className="status">Concluída</span></td>
                    <td>
                      <button className="action" data-legacy-action="showSale('#V-1047')" aria-label="Ver detalhes">
                        ›
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>#V-1046</strong></td>
                    <td>21/09/2026, 13:48</td>
                    <td>Consumidor final</td>
                    <td className="payment">Dinheiro</td>
                    <td><strong>R$ 412,75</strong></td>
                    <td><span className="status">Concluída</span></td>
                    <td>
                      <button className="action" data-legacy-action="showSale('#V-1046')" aria-label="Ver detalhes">
                        ›
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>#V-1045</strong></td>
                    <td>21/09/2026, 13:21</td>
                    <td>João Santos</td>
                    <td className="payment">Pix</td>
                    <td><strong>R$ 158,20</strong></td>
                    <td><span className="status">Concluída</span></td>
                    <td>
                      <button className="action" data-legacy-action="showSale('#V-1045')" aria-label="Ver detalhes">
                        ›
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td><strong>#V-1044</strong></td>
                    <td>21/09/2026, 12:57</td>
                    <td>Consumidor final</td>
                    <td className="payment">Cartão</td>
                    <td><strong>R$ 76,50</strong></td>
                    <td><span className="status cancelled">Cancelada</span></td>
                    <td>
                      <button className="action" data-legacy-action="showSale('#V-1044')" aria-label="Ver detalhes">
                        ›
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div className="empty" id="empty">
                Nenhuma venda encontrada com os filtros informados.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    
      
      


</div></>;
}
