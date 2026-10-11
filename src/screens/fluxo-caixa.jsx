import pageCss from '../../ProjetoSuperMarket/fluxo-caixa/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function fluxo_caixaScreen(props) {
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
          <h1>Fluxo de Caixa</h1>
        </div>
      </header>
      <section className="content">
        <div className="crumb">
          <a href="/dashboard">Início</a><span>/</span><span>Financeiro</span><span>/</span><span>Fluxo de Caixa</span>
        </div>
        <div className="intro">
          <h2>Fluxo de caixa</h2>
          <p>
            Visualize entradas, saídas e a projeção de saldo para planejar a
            operação.
          </p>
        </div>
        <div className="toolbar">
          <div className="field">
            <label htmlFor="period">Período</label><select id="period">
              <option>Próximos 7 dias</option>
              <option selected>Próximos 30 dias</option>
              <option>Próximos 90 dias</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="unit">Unidade</label><select id="unit">
              <option>Todas as unidades</option>
              <option>Loja principal</option>
              <option>Loja 02</option>
            </select>
          </div>
          <button className="button" data-legacy-action="alert('Fluxo atualizado')">
            Atualizar fluxo</button><button className="button secondary" data-legacy-action="window.print()">
            Exportar
          </button>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="label">Saldo inicial</div>
            <div className="value">R$ 24.680</div>
            <div className="meta">Disponível hoje</div>
          </div>
          <div className="stat">
            <div className="label">Entradas previstas</div>
            <div className="value">R$ 42.360</div>
            <div className="meta">Próximos 30 dias</div>
          </div>
          <div className="stat">
            <div className="label">Saídas previstas</div>
            <div className="value">R$ 31.840</div>
            <div className="meta red">Compromissos mapeados</div>
          </div>
          <div className="stat">
            <div className="label">Saldo projetado</div>
            <div className="value">R$ 35.200</div>
            <div className="meta">+42,6% no período</div>
          </div>
        </div>
        <div className="grid">
          <div className="panel">
            <h3>Projeção diária</h3>
            <div className="caption">
              Entradas e saídas previstas para os próximos 7 dias
            </div>
            <div className="legend">
              <span><i></i>Entradas</span><span><i className="red"></i>Saídas</span>
            </div>
            <div className="chart">
              <div className="bar-group">
                <div className="bar" style={{height: "62%"}}></div>
                <div className="bar out" style={{height: "38%"}}></div>
                <span className="day">Hoje</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: "78%"}}></div>
                <div className="bar out" style={{height: "44%"}}></div>
                <span className="day">22/09</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: "54%"}}></div>
                <div className="bar out" style={{height: "72%"}}></div>
                <span className="day">23/09</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: "88%"}}></div>
                <div className="bar out" style={{height: "51%"}}></div>
                <span className="day">24/09</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: "66%"}}></div>
                <div className="bar out" style={{height: "83%"}}></div>
                <span className="day">25/09</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: "92%"}}></div>
                <div className="bar out" style={{height: "46%"}}></div>
                <span className="day">26/09</span>
              </div>
              <div className="bar-group">
                <div className="bar" style={{height: "72%"}}></div>
                <div className="bar out" style={{height: "35%"}}></div>
                <span className="day">27/09</span>
              </div>
            </div>
            <div className="axis">
              <span>R$ 0</span><span>R$ 5 mil</span><span>R$ 10 mil</span>
            </div>
          </div>
          <div className="panel">
            <h3>Resumo projetado</h3>
            <div className="caption">Consolidação do período</div>
            <div className="summary">
              <div className="summary-row">
                <span>Vendas previstas</span><strong>R$ 38.640</strong>
              </div>
              <div className="summary-row">
                <span>Recebimentos</span><strong>R$ 3.720</strong>
              </div>
              <div className="summary-row">
                <span>Fornecedores</span><strong>R$ 18.420</strong>
              </div>
              <div className="summary-row">
                <span>Despesas fixas</span><strong>R$ 13.420</strong>
              </div>
              <div className="balance">
                <span>Saldo ao final do período</span><strong>R$ 35.200</strong>
              </div>
            </div>
          </div>
        </div>
        <div className="panel table-panel">
          <h3>Próximos lançamentos</h3>
          <div className="caption">Eventos que impactam o saldo projetado</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Saldo após lançamento</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>22/09/2026</td>
                  <td><strong>Pedido PC-00215</strong></td>
                  <td>Fornecedores</td>
                  <td className="out">Saída</td>
                  <td className="out">- R$ 1.920</td>
                  <td>R$ 28.460</td>
                </tr>
                <tr>
                  <td>24/09/2026</td>
                  <td><strong>Recebimento corporativo</strong></td>
                  <td>Vendas</td>
                  <td className="in">Entrada</td>
                  <td className="in">+ R$ 4.850</td>
                  <td>R$ 33.310</td>
                </tr>
                <tr>
                  <td>27/09/2026</td>
                  <td><strong>Pedido PC-00218</strong></td>
                  <td>Fornecedores</td>
                  <td className="out">Saída</td>
                  <td className="out">- R$ 4.860</td>
                  <td>R$ 35.200</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
    
      
      


</div></>;
}
