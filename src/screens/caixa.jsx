import pageCss from '../../ProjetoSuperMarket/caixa/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function caixaScreen(props) {
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
          <h1>Controle de Caixa</h1>
        </div>
      </header>
      <section className="content">
        <div className="crumb">
          <a href="/dashboard">Início</a><span>/</span><span>Financeiro</span><span>/</span><span>Controle de Caixa</span>
        </div>
        <div className="intro">
          <h2>Controle de caixa</h2>
          <p>
            Acompanhe o saldo, as movimentações e a conferência do caixa da
            loja.
          </p>
        </div>
        <div className="toolbar">
          <div className="field">
            <label htmlFor="date">Data do caixa</label><input id="date" type="date" value="2026-09-21" />
          </div>
          <div className="field">
            <label htmlFor="cashier">Operador</label><select id="cashier">
              <option>Todos os operadores</option>
              <option>Administrador</option>
              <option>Caixa 02</option>
            </select>
          </div>
          <button className="button" data-legacy-action="alert('Novo lançamento de caixa')">
            + Lançamento</button><button className="button secondary" data-legacy-action="window.print()">
            Exportar
          </button>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="label">Saldo inicial</div>
            <div className="value">R$ 1.500,00</div>
            <div className="meta">Abertura às 08:00</div>
          </div>
          <div className="stat">
            <div className="label">Entradas</div>
            <div className="value">R$ 4.862,40</div>
            <div className="meta">42 vendas realizadas</div>
          </div>
          <div className="stat">
            <div className="label">Saídas</div>
            <div className="value">R$ 680,00</div>
            <div className="meta red">3 sangrias</div>
          </div>
          <div className="stat">
            <div className="label">Saldo atual</div>
            <div className="value">R$ 5.682,40</div>
            <div className="meta">Caixa aberto</div>
          </div>
        </div>
        <div className="grid">
          <div className="panel">
            <h3>Movimentações do dia</h3>
            <div className="caption">
              Entradas e saídas registradas no caixa atual
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Horário</th>
                    <th>Descrição</th>
                    <th>Operador</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>14:32</td>
                    <td><strong>Venda #V-1048</strong></td>
                    <td>Administrador</td>
                    <td className="positive">Entrada</td>
                    <td className="positive">+ R$ 286,40</td>
                  </tr>
                  <tr>
                    <td>13:10</td>
                    <td><strong>Sangria para depósito</strong></td>
                    <td>Administrador</td>
                    <td className="negative">Saída</td>
                    <td className="negative">- R$ 500,00</td>
                  </tr>
                  <tr>
                    <td>12:44</td>
                    <td><strong>Venda #V-1046</strong></td>
                    <td>Caixa 02</td>
                    <td className="positive">Entrada</td>
                    <td className="positive">+ R$ 412,75</td>
                  </tr>
                  <tr>
                    <td>10:20</td>
                    <td><strong>Troco inicial</strong></td>
                    <td>Administrador</td>
                    <td className="negative">Saída</td>
                    <td className="negative">- R$ 180,00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="panel">
            <h3>Resumo da conferência</h3>
            <div className="caption">Valores por forma de pagamento</div>
            <div className="summary">
              <div className="summary-row">
                <span>Dinheiro</span><strong>R$ 1.842,40</strong>
              </div>
              <div className="summary-row">
                <span>Cartões</span><strong>R$ 1.920,00</strong>
              </div>
              <div className="summary-row">
                <span>Pix</span><strong>R$ 1.100,00</strong>
              </div>
              <div className="summary-row">
                <span>Outros recebimentos</span><strong>R$ 0,00</strong>
              </div>
              <div className="closing">
                <span>Saldo esperado</span><strong>R$ 5.682,40</strong>
              </div>
              <button className="button" data-legacy-action="alert('Caixa encerrado com sucesso')">
                Encerrar caixa
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
    
      
      


</div></>;
}
