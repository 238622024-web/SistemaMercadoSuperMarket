import pageCss from '../../ProjetoSuperMarket/contas/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function contasScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <Sidebar />
    <div className="overlay" id="overlay"></div>
    <main className="main" id="main">
      <header className="header">
        <div className="header-left">
          <button className="menu" data-legacy-action="toggleSidebar()" aria-label="Abrir menu">
            <svg viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
            </svg>
          </button>
          <h1>Contas a Pagar/Receber</h1>
        </div>
      </header>
      <section className="content">
        <div className="crumb">
          <a href="/dashboard">Início</a><span>/</span><span>Financeiro</span><span>/</span><span>Contas</span>
        </div>
        <div className="intro">
          <h2>Contas a pagar e receber</h2>
          <p>
            Organize compromissos financeiros, vencimentos e recebimentos da
            operação.
          </p>
        </div>
        <div className="toolbar">
          <div className="field">
            <label htmlFor="search">Buscar conta</label><input id="search" type="search" placeholder="Descrição ou fornecedor" />
          </div>
          <div className="field">
            <label htmlFor="period">Período</label><select id="period">
              <option>Próximos 7 dias</option>
              <option selected>Este mês</option>
              <option>Próximo mês</option>
            </select>
          </div>
          <button className="button" data-legacy-action="filterAccounts()">Filtrar</button><button className="button secondary" data-legacy-action="alert('Novo lançamento financeiro')">
            + Nova conta
          </button>
        </div>
        <div className="tabs">
          <button className="tab active" data-legacy-action="setTab(this, 'all')">Todas</button><button className="tab" data-legacy-action="setTab(this, 'payable')">A pagar</button><button className="tab" data-legacy-action="setTab(this, 'receivable')">
            A receber
          </button>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="label">Total a pagar</div>
            <div className="value">R$ 12.840</div>
            <div className="meta red">9 contas em aberto</div>
          </div>
          <div className="stat">
            <div className="label">Total a receber</div>
            <div className="value">R$ 8.460</div>
            <div className="meta">6 recebimentos previstos</div>
          </div>
          <div className="stat">
            <div className="label">Vencidas</div>
            <div className="value">R$ 1.280</div>
            <div className="meta red">2 contas em atraso</div>
          </div>
          <div className="stat">
            <div className="label">Saldo projetado</div>
            <div className="value">R$ 4.340</div>
            <div className="meta">Após compromissos</div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Contas cadastradas</h3>
              <div className="caption">15 lançamentos no período selecionado</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Vencimento</th>
                  <th>Categoria</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="accountTable">
                <tr data-type="payable">
                  <td>
                    <strong>Pedido PC-00218</strong><br /><small>Distribuidora Nova Era</small>
                  </td>
                  <td className="type">A pagar</td>
                  <td>27/09/2026</td>
                  <td>Estoque</td>
                  <td className="expense">R$ 4.860,00</td>
                  <td><span className="status pending">Pendente</span></td>
                  <td>
                    <button className="action" data-legacy-action="showAccount('Pedido PC-00218')">
                      ›
                    </button>
                  </td>
                </tr>
                <tr data-type="receivable">
                  <td>
                    <strong>Recebimento cliente #RC-042</strong><br /><small>Venda faturada</small>
                  </td>
                  <td className="type">A receber</td>
                  <td>24/09/2026</td>
                  <td>Vendas</td>
                  <td className="income">R$ 2.340,50</td>
                  <td><span className="status paid">Previsto</span></td>
                  <td>
                    <button className="action" data-legacy-action="showAccount('Recebimento cliente #RC-042')">
                      ›
                    </button>
                  </td>
                </tr>
                <tr data-type="payable">
                  <td>
                    <strong>Energia elétrica</strong><br /><small>Concessionária local</small>
                  </td>
                  <td className="type">A pagar</td>
                  <td>20/09/2026</td>
                  <td>Operacional</td>
                  <td className="expense">R$ 1.280,00</td>
                  <td><span className="status overdue">Vencida</span></td>
                  <td>
                    <button className="action" data-legacy-action="showAccount('Energia elétrica')">
                      ›
                    </button>
                  </td>
                </tr>
                <tr data-type="payable">
                  <td>
                    <strong>Aluguel da loja</strong><br /><small>Imobiliária Central</small>
                  </td>
                  <td className="type">A pagar</td>
                  <td>10/10/2026</td>
                  <td>Operacional</td>
                  <td className="expense">R$ 6.700,00</td>
                  <td><span className="status pending">Pendente</span></td>
                  <td>
                    <button className="action" data-legacy-action="showAccount('Aluguel da loja')">
                      ›
                    </button>
                  </td>
                </tr>
                <tr data-type="receivable">
                  <td>
                    <strong>Venda corporativa #V-1038</strong><br /><small>Mercado Bom Preço</small>
                  </td>
                  <td className="type">A receber</td>
                  <td>30/09/2026</td>
                  <td>Vendas</td>
                  <td className="income">R$ 4.850,00</td>
                  <td><span className="status paid">Previsto</span></td>
                  <td>
                    <button className="action" data-legacy-action="showAccount('Venda corporativa #V-1038')">
                      ›
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
    
      
      


</div></>;
}
