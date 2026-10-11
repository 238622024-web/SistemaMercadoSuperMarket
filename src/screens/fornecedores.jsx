import pageCss from '../../ProjetoSuperMarket/fornecedores/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function fornecedoresScreen(props) {
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
          <h1 className="header-title">Fornecedores</h1>
        </div>
      </header>
      <section className="page-content">
        <div className="breadcrumb">
          <a href="/dashboard">Início</a><span>/</span><span>Fornecedores</span><span>/</span><span>Lista</span>
        </div>
        <div className="intro">
          <h2>Lista de fornecedores</h2>
          <p>
            Centralize contatos, categorias e condições comerciais dos seus
            parceiros.
          </p>
        </div>
        <div className="toolbar">
          <div className="field">
            <label htmlFor="search">Buscar fornecedor</label><input id="search" type="search" placeholder="Nome, CNPJ ou contato" />
          </div>
          <div className="field">
            <label htmlFor="category">Categoria</label><select id="category">
              <option value="">Todas as categorias</option>
              <option>Mercearia</option>
              <option>Bebidas</option>
              <option>Hortifruti</option>
              <option>Limpeza</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="status">Status</label><select id="status">
              <option value="">Todos</option>
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>
          <button className="button" data-legacy-action="filterSuppliers()">Filtrar</button><button className="button secondary" data-legacy-action="alert('Formulário de novo fornecedor')">
            + Novo fornecedor
          </button>
        </div>
        <div className="stats">
          <div className="stat">
            <div className="stat-label">Fornecedores cadastrados</div>
            <div className="stat-value" id="supplierCount">24</div>
            <div className="stat-meta">+3 neste mês</div>
          </div>
          <div className="stat">
            <div className="stat-label">Fornecedores ativos</div>
            <div className="stat-value">21</div>
            <div className="stat-meta">87,5% da base</div>
          </div>
          <div className="stat">
            <div className="stat-label">Pedidos em aberto</div>
            <div className="stat-value">8</div>
            <div className="stat-meta">R$ 18.420,00</div>
          </div>
          <div className="stat">
            <div className="stat-label">Vencimentos próximos</div>
            <div className="stat-value">4</div>
            <div className="stat-meta">Nos próximos 7 dias</div>
          </div>
        </div>
        <div className="panel">
          <div className="panel-head">
            <div>
              <div className="panel-title">Fornecedores cadastrados</div>
              <div className="panel-caption">24 parceiros encontrados na base</div>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Fornecedor</th>
                  <th>Categoria</th>
                  <th>Contato</th>
                  <th>Prazo médio</th>
                  <th>Último pedido</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="supplierTable">
                <tr>
                  <td>
                    <strong>Distribuidora Nova Era</strong><br /><small>CNPJ 12.345.678/0001-90</small>
                  </td>
                  <td>Mercearia</td>
                  <td className="contact">
                    <span>Rafael Mendes</span><small>(11) 99845-2201</small>
                  </td>
                  <td>7 dias</td>
                  <td>18/09/2026</td>
                  <td><span className="status">Ativo</span></td>
                  <td>
                    <button className="action" data-legacy-action="showSupplier('Distribuidora Nova Era')" aria-label="Ver fornecedor">
                      ›
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Bebidas Brasil Ltda.</strong><br /><small>CNPJ 27.890.123/0001-44</small>
                  </td>
                  <td>Bebidas</td>
                  <td className="contact">
                    <span>Camila Torres</span><small>(11) 98732-4410</small>
                  </td>
                  <td>14 dias</td>
                  <td>16/09/2026</td>
                  <td><span className="status">Ativo</span></td>
                  <td>
                    <button className="action" data-legacy-action="showSupplier('Bebidas Brasil Ltda.')" aria-label="Ver fornecedor">
                      ›
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>HortiMais Distribuição</strong><br /><small>CNPJ 44.567.890/0001-12</small>
                  </td>
                  <td>Hortifruti</td>
                  <td className="contact">
                    <span>Juliana Alves</span><small>(11) 97654-8102</small>
                  </td>
                  <td>3 dias</td>
                  <td>20/09/2026</td>
                  <td><span className="status">Ativo</span></td>
                  <td>
                    <button className="action" data-legacy-action="showSupplier('HortiMais Distribuição')" aria-label="Ver fornecedor">
                      ›
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Casa da Limpeza</strong><br /><small>CNPJ 39.123.456/0001-77</small>
                  </td>
                  <td>Limpeza</td>
                  <td className="contact">
                    <span>Marcos Lima</span><small>(11) 96543-2210</small>
                  </td>
                  <td>21 dias</td>
                  <td>02/08/2026</td>
                  <td><span className="status inactive">Inativo</span></td>
                  <td>
                    <button className="action" data-legacy-action="showSupplier('Casa da Limpeza')" aria-label="Ver fornecedor">
                      ›
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="empty" id="empty">
              Nenhum fornecedor encontrado com os filtros informados.
            </div>
          </div>
        </div>
      </section>
    </main>
      
      

  

</div></>;
}
