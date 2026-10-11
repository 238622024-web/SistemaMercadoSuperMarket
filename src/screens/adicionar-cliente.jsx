import pageCss from '../../ProjetoSuperMarket/adicionar-cliente/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function adicionar_clienteScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app">
      <Sidebar />
      <main className="main">
        <header>
          <button className="menu" id="menu" aria-label="Abrir menu">
            <svg viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
            </svg>
          </button>
          <h1>Cadastrar Cliente</h1>
        </header>
        <section className="content">
          <div className="breadcrumb">
            Gerenciamento / Clientes /
            <strong style={{color: "#667eea"}}>Cadastrar Cliente</strong>
          </div>
          <p className="subtitle">
            Preencha os dados para cadastrar um novo cliente.
          </p>
          <div className="card">
            <h2>Dados do cliente</h2>
            <form id="clientForm">
              <div className="form-grid">
                <div className="field full">
                  <label htmlFor="name">Nome completo *</label><input id="name" required placeholder="Digite o nome do cliente" />
                </div>
                <div className="field">
                  <label htmlFor="document">CPF/CNPJ</label><input id="document" placeholder="000.000.000-00" />
                </div>
                <div className="field">
                  <label htmlFor="phone">Telefone</label><input id="phone" placeholder="(00) 00000-0000" />
                </div>
                <div className="field">
                  <label htmlFor="email">E-mail</label><input id="email" type="email" placeholder="cliente@email.com" />
                </div>
                <div className="field">
                  <label htmlFor="status">Status</label><select id="status">
                    <option>Ativo</option>
                    <option>Inativo</option>
                  </select>
                </div>
                <div className="field full">
                  <label htmlFor="address">Endereço</label><input id="address" placeholder="Rua, número, bairro e cidade" />
                </div>
              </div>
              <div className="actions">
                <a className="button cancel" href="/clientes">Cancelar</a><button className="primary" type="submit">Salvar cliente</button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>
    
      
      


</div></>;
}
