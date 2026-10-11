import pageCss from '../../ProjetoSuperMarket/relatorios/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function relatoriosScreen(props) {
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
            <h1 className="header-title">Relatórios de Vendas</h1>
          </div>
        </header>
        <section className="page-content">
          <div className="breadcrumb">
            <a href="/dashboard">Início</a><span>/</span><a href="/pdv">Vendas</a><span>/</span><span>Relatórios</span>
          </div>
          <div className="intro">
            <h2>Relatórios de vendas</h2>
            <p>
              Transforme os dados da operação em decisões mais rápidas para o
              negócio.
            </p>
          </div>
          <div className="toolbar">
            <div className="field">
              <label htmlFor="period">Período do relatório</label><select id="period">
                <option>Últimos 7 dias</option>
                <option selected>Últimos 30 dias</option>
                <option>Este trimestre</option>
                <option>Este ano</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="store">Unidade</label><select id="store">
                <option>Todas as unidades</option>
                <option>Loja principal</option>
                <option>Loja 02</option>
              </select>
            </div>
            <button className="button" data-legacy-action="updateReport()">
              Atualizar relatório</button><button className="button secondary" data-legacy-action="window.print()">
              Exportar PDF
            </button>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-label">Faturamento bruto</div>
              <div className="stat-value">R$ 36.480,90</div>
              <div className="stat-meta">+14,8% no período</div>
            </div>
            <div className="stat">
              <div className="stat-label">Total de pedidos</div>
              <div className="stat-value">214</div>
              <div className="stat-meta">+9,4% no período</div>
            </div>
            <div className="stat">
              <div className="stat-label">Ticket médio</div>
              <div className="stat-value">R$ 170,47</div>
              <div className="stat-meta">+5,1% no período</div>
            </div>
            <div className="stat">
              <div className="stat-label">Margem estimada</div>
              <div className="stat-value">28,6%</div>
              <div className="stat-meta down">-1,2% no período</div>
            </div>
          </div>
          <div className="dashboard">
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Evolução do faturamento</div>
                  <div className="panel-caption">
                    Comparativo das vendas nos últimos 7 dias
                  </div>
                </div>
                <div className="legend">
                  <span><i></i>Atual</span><span><i className="purple"></i>Anterior</span>
                </div>
              </div>
              <div className="chart">
                <div className="chart-day">
                  <div className="bar" style={{height: "48%"}}></div>
                  <div className="bar alt" style={{height: "35%"}}></div>
                  <span className="chart-label">Seg</span>
                </div>
                <div className="chart-day">
                  <div className="bar" style={{height: "66%"}}></div>
                  <div className="bar alt" style={{height: "49%"}}></div>
                  <span className="chart-label">Ter</span>
                </div>
                <div className="chart-day">
                  <div className="bar" style={{height: "57%"}}></div>
                  <div className="bar alt" style={{height: "63%"}}></div>
                  <span className="chart-label">Qua</span>
                </div>
                <div className="chart-day">
                  <div className="bar" style={{height: "83%"}}></div>
                  <div className="bar alt" style={{height: "58%"}}></div>
                  <span className="chart-label">Qui</span>
                </div>
                <div className="chart-day">
                  <div className="bar" style={{height: "70%"}}></div>
                  <div className="bar alt" style={{height: "67%"}}></div>
                  <span className="chart-label">Sex</span>
                </div>
                <div className="chart-day">
                  <div className="bar" style={{height: "92%"}}></div>
                  <div className="bar alt" style={{height: "73%"}}></div>
                  <span className="chart-label">Sáb</span>
                </div>
                <div className="chart-day">
                  <div className="bar" style={{height: "61%"}}></div>
                  <div className="bar alt" style={{height: "45%"}}></div>
                  <span className="chart-label">Dom</span>
                </div>
              </div>
              <div className="chart-axis">
                <span>R$ 0</span><span>R$ 2 mil</span><span>R$ 4 mil</span><span>R$ 6 mil</span>
              </div>
            </div>
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Formas de pagamento</div>
                  <div className="panel-caption">Participação no faturamento</div>
                </div>
              </div>
              <div className="payment-list">
                <div className="payment-row">
                  <div className="payment-label">
                    <span>Pix</span><strong>42% · R$ 15.321</strong>
                  </div>
                  <div className="track">
                    <div className="fill" style={{width: "42%"}}></div>
                  </div>
                </div>
                <div className="payment-row">
                  <div className="payment-label">
                    <span>Cartão de crédito</span><strong>31% · R$ 11.309</strong>
                  </div>
                  <div className="track">
                    <div className="fill blue" style={{width: "31%"}}></div>
                  </div>
                </div>
                <div className="payment-row">
                  <div className="payment-label">
                    <span>Cartão de débito</span><strong>18% · R$ 6.566</strong>
                  </div>
                  <div className="track">
                    <div className="fill purple" style={{width: "18%"}}></div>
                  </div>
                </div>
                <div className="payment-row">
                  <div className="payment-label">
                    <span>Dinheiro</span><strong>9% · R$ 3.284</strong>
                  </div>
                  <div className="track">
                    <div className="fill orange" style={{width: "9%"}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bottom">
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Produtos mais vendidos</div>
                  <div className="panel-caption">
                    Ranking por quantidade de itens vendidos
                  </div>
                </div>
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Qtd.</th>
                    <th>Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <span className="rank">1</span><strong>Arroz Tipo 1 5kg</strong>
                    </td>
                    <td>Mercearia</td>
                    <td>184</td>
                    <td><strong>R$ 4.968,00</strong></td>
                  </tr>
                  <tr>
                    <td>
                      <span className="rank">2</span><strong>Leite Integral 1L</strong>
                    </td>
                    <td>Laticínios</td>
                    <td>172</td>
                    <td><strong>R$ 1.032,00</strong></td>
                  </tr>
                  <tr>
                    <td>
                      <span className="rank">3</span><strong>Café Torrado 500g</strong>
                    </td>
                    <td>Mercearia</td>
                    <td>136</td>
                    <td><strong>R$ 2.720,00</strong></td>
                  </tr>
                  <tr>
                    <td>
                      <span className="rank">4</span><strong>Refrigerante 2L</strong>
                    </td>
                    <td>Bebidas</td>
                    <td>118</td>
                    <td><strong>R$ 1.888,00</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Insights da operação</div>
                  <div className="panel-caption">Pontos que merecem atenção</div>
                </div>
              </div>
              <div className="insight">
                <div>
                  <strong>Melhor dia de vendas</strong>
                  <p>Sábado representa 22% do faturamento do período.</p>
                </div>
              </div>
              <div className="insight">
                <div>
                  <strong>Categoria em alta</strong>
                  <p>Bebidas cresceu 18,4% contra o período anterior.</p>
                </div>
              </div>
              <div className="insight warn">
                <div>
                  <strong>Oportunidade</strong>
                  <p>
                    O ticket médio cai 11% aos domingos. Avalie uma ação
                    promocional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    
      
      


</div></>;
}
