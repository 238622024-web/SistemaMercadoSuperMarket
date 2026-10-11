import pageCss from '../../ProjetoSuperMarket/pedidos-compra/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function pedidos_compraScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
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
          <h1 className="header-title">Pedidos de Compra</h1>
        </div>
      </header>
      <section className="page-content">
        <div className="breadcrumb">
          <a href="/dashboard">Início</a><span>/</span><a href="/fornecedores">Fornecedores</a><span>/</span><span>Pedidos de compra</span>
        </div>
        <div className="intro">
          <h2>Pedidos de compra</h2>
          <p>
            Acompanhe solicitações, aprovações e recebimentos de mercadorias.
          </p>
        </div>
        <div className="toolbar">
          <div className="field">
            <label htmlFor="search">Buscar pedido</label><input id="search" type="search" placeholder="Código ou fornecedor" />
          </div>
          <div className="field">
            <label htmlFor="status">Status</label><select id="status">
              <option value="">Todos os status</option>
              <option value="Em aberto">Em aberto</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Recebido">Recebido</option>
              <option value="Pendente">Pendente</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="period">Período</label><select id="period">
              <option>Últimos 7 dias</option>
              <option selected>Últimos 30 dias</option>
              <option>Este mês</option>
            </select>
          </div>
          <button className="button" data-legacy-action="filterOrders()">Filtrar</button><button className="button secondary" data-legacy-action="alert('Formulário de novo pedido de compra')">
            + Novo pedido
          </button>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Pedidos no período</div>
            <div className="stat-value" id="orderCount">18</div>
            <div className="stat-meta">+4 vs. período anterior</div>
          </div>
          <div className="stat">
            <div className="stat-label">Em aberto</div>
            <div className="stat-value">8</div>
            <div className="stat-meta warn">Aguardando recebimento</div>
          </div>
          <div className="stat">
            <div className="stat-label">Valor comprometido</div>
            <div className="stat-value">R$ 18.420</div>
            <div className="stat-meta">Pedidos em aberto</div>
          </div>
          <div className="stat">
            <div className="stat-label">Recebidos no mês</div>
            <div className="stat-value">10</div>
            <div className="stat-meta">83% no prazo</div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Pedidos recentes</div>
              <div className="panel-caption">
                18 pedidos encontrados no período selecionado
              </div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Fornecedor</th>
                  <th>Emissão</th>
                  <th>Previsão</th>
                  <th>Itens</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="orderTable">
                <tr>
                  <td><strong>#PC-00218</strong></td>
                  <td>Distribuidora Nova Era</td>
                  <td>20/09/2026</td>
                  <td>27/09/2026</td>
                  <td>24</td>
                  <td><strong>R$ 4.860,00</strong></td>
                  <td><span className="status open">Em aberto</span></td>
                  <td>
                    <button className="action" data-legacy-action="showOrder('#PC-00218')" aria-label="Ver pedido">
                      ›
                    </button>
                  </td>
                </tr>
                <tr>
                  <td><strong>#PC-00217</strong></td>
                  <td>HortiMais Distribuição</td>
                  <td>20/09/2026</td>
                  <td>23/09/2026</td>
                  <td>18</td>
                  <td><strong>R$ 2.340,50</strong></td>
                  <td><span className="status approved">Aprovado</span></td>
                  <td>
                    <button className="action" data-legacy-action="showOrder('#PC-00217')" aria-label="Ver pedido">
                      ›
                    </button>
                  </td>
                </tr>
                <tr>
                  <td><strong>#PC-00216</strong></td>
                  <td>Bebidas Brasil Ltda.</td>
                  <td>18/09/2026</td>
                  <td>02/10/2026</td>
                  <td>32</td>
                  <td><strong>R$ 6.780,00</strong></td>
                  <td><span className="status pending">Pendente</span></td>
                  <td>
                    <button className="action" data-legacy-action="showOrder('#PC-00216')" aria-label="Ver pedido">
                      ›
                    </button>
                  </td>
                </tr>
                <tr>
                  <td><strong>#PC-00215</strong></td>
                  <td>Casa da Limpeza</td>
                  <td>15/09/2026</td>
                  <td>22/09/2026</td>
                  <td>15</td>
                  <td><strong>R$ 1.920,00</strong></td>
                  <td><span className="status received">Recebido</span></td>
                  <td>
                    <button className="action" data-legacy-action="showOrder('#PC-00215')" aria-label="Ver pedido">
                      ›
                    </button>
                  </td>
                </tr>
                <tr>
                  <td><strong>#PC-00214</strong></td>
                  <td>Distribuidora Nova Era</td>
                  <td>12/09/2026</td>
                  <td>19/09/2026</td>
                  <td>28</td>
                  <td><strong>R$ 5.430,00</strong></td>
                  <td><span className="status received">Recebido</span></td>
                  <td>
                    <button className="action" data-legacy-action="showOrder('#PC-00214')" aria-label="Ver pedido">
                      ›
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="empty" id="empty">
              Nenhum pedido encontrado com os filtros informados.
            </div>
          </div>
        </div>
      </section>
    </main>
      
      

  

</div></>;
}
