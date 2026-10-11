import pageCss from '../../ProjetoSuperMarket/clientes/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function clientesScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app">
      <Sidebar />

      <main className="main">
        <header>
          <div className="header-left">
            <button className="menu" id="menu" type="button">
              <svg viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1>Lista de Clientes</h1>
          </div>
          <span className="muted">Gerenciamento de clientes</span>
        </header>

        <section className="content">
          <div className="breadcrumb">
            Gerenciamento / Clientes /
            <strong style={{color: "#667eea"}}>Lista de Clientes</strong>
          </div>
          <p className="subtitle">
            Consulte e gerencie os clientes cadastrados no sistema.
          </p>

          <div className="stats">
            <div className="card">
              <span className="stat-number">0</span>
              <span className="muted">Total de clientes</span>
            </div>
            <div className="card">
              <span className="stat-number">0</span>
              <span className="muted">Clientes ativos</span>
            </div>
            <div className="card">
              <span className="stat-number">0</span>
              <span className="muted">Novos este mês</span>
            </div>
          </div>

          <div className="card">
            <div className="toolbar">
              <input className="search" placeholder="Buscar por nome, CPF ou telefone" />
              <a className="button primary" href="/adicionar-cliente">+ Cadastrar cliente</a>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>CPF/CNPJ</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="5" style={{textAlign: "center", padding: "50px", color: "#64748b"}}>
                      Nenhum cliente cadastrado
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>

    
      
      


</div></>;
}
