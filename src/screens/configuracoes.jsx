import pageCss from '../../ProjetoSuperMarket/configuracoes/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function configuracoesScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app-container">
      <Sidebar />

      <div className="sidebar-overlay" id="sidebarOverlay"></div>

      <main className="main-content" id="mainContent">
        <div className="page-container">
          <header className="page-header">
            <div className="header-left">
              <button className="menu-toggle" id="menuToggle" aria-label="Alternar menu lateral" data-legacy-action="toggleSidebar()">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
                </svg>
              </button>
              <div>
                <div className="breadcrumb">
                  <a href="/dashboard">Dashboard</a>
                  <span>›</span>
                  <span>Sistema</span>
                  <span>›</span>
                  <span>Configurações</span>
                </div>
                <h1>⚙️ Configurações</h1>
              </div>
            </div>

            <div className="header-actions">
              <button className="btn btn-secondary" type="button">Cancelar</button>
              <button className="btn btn-primary" type="button">
                Salvar alterações
              </button>
            </div>
          </header>

          <div className="content">
            <section className="summary-cards">
              <div className="summary-card">
                <div className="summary-card-top">
                  <div className="label">Loja</div>
                  <div className="card-icon">🏪</div>
                </div>
                <div className="value">Mercado Super Market</div>
                <div className="meta">Ativa e sincronizada</div>
              </div>

              <div className="summary-card">
                <div className="summary-card-top">
                  <div className="label">Segurança</div>
                  <div className="card-icon">🔐</div>
                </div>
                <div className="value">Nível 3</div>
                <div className="meta">Autenticação reforçada</div>
              </div>

              <div className="summary-card">
                <div className="summary-card-top">
                  <div className="label">Backup</div>
                  <div className="card-icon">💾</div>
                </div>
                <div className="value">12h</div>
                <div className="meta">Último backup: hoje</div>
              </div>

              <div className="summary-card">
                <div className="summary-card-top">
                  <div className="label">Notificações</div>
                  <div className="card-icon">📣</div>
                </div>
                <div className="value">4 ativos</div>
                <div className="meta">Alertas configurados</div>
              </div>
            </section>

            <section className="settings-grid">
              <div className="settings-card">
                <div className="card-header">
                  <h2>Dados da loja</h2>
                  <span className="badge">Geral</span>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <label className="field">
                      <span>Nome da loja</span>
                      <input type="text" value="Mercado Super Market" />
                    </label>
                    <label className="field">
                      <span>CNPJ</span>
                      <input type="text" value="12.345.678/0001-90" />
                    </label>
                    <label className="field full">
                      <span>Endereço</span>
                      <input type="text" value="Rua das Flores, 245 - Centro, São Paulo/SP" />
                    </label>
                    <label className="field">
                      <span>Telefone</span>
                      <input type="tel" value="(11) 3456-7890" />
                    </label>
                    <label className="field">
                      <span>E-mail</span>
                      <input type="email" value="contato@mercadopro.com.br" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="card-header">
                  <h2>Preferências do sistema</h2>
                  <span className="badge">UX</span>
                </div>
                <div className="card-body">
                  <div className="toggle-list">
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <span className="toggle-label">Ativar modo escuro</span>
                        <span className="toggle-hint">Visual mais confortável em ambientes internos</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-row">
                      <div className="toggle-info">
                        <span className="toggle-label">Salvar alterações automaticamente</span>
                        <span className="toggle-hint">Sincroniza ajustes realizados em tempo real</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" checked />
                        <span className="slider"></span>
                      </label>
                    </div>

                    <div className="toggle-row">
                      <div className="toggle-info">
                        <span className="toggle-label">Habilitar notificações de estoque</span>
                        <span className="toggle-hint">Alertas para baixa e vencimento de produtos</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" checked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-card wide">
                <div className="card-header">
                  <h2>Segurança e acesso</h2>
                  <span className="badge">Proteção</span>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <label className="field">
                      <span>Senha atual</span>
                      <input type="password" value="********" />
                    </label>
                    <label className="field">
                      <span>Nova senha</span>
                      <input type="password" value="********" />
                    </label>
                    <label className="field full">
                      <span>Permissão de acesso</span>
                      <select>
                        <option selected>Administrador completo</option>
                        <option>Gerente</option>
                        <option>Operador de caixa</option>
                        <option>Visualização</option>
                      </select>
                    </label>
                    <label className="field full">
                      <span>Observações de segurança</span>
                      <textarea>Requisição de autenticação em dois fatores habilitada para usuários com perfil de suporte e gestão.</textarea>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="card-header">
                  <h2>Notificações</h2>
                  <span className="badge">Alertas</span>
                </div>
                <div className="card-body">
                  <div className="check-grid">
                    <label className="check-item">
                      <input type="checkbox" checked />
                      <span>E-mails de vendas</span>
                    </label>
                    <label className="check-item">
                      <input type="checkbox" checked />
                      <span>Baixa de estoque</span>
                    </label>
                    <label className="check-item">
                      <input type="checkbox" checked />
                      <span>Produtos vencendo</span>
                    </label>
                    <label className="check-item">
                      <input type="checkbox" />
                      <span>Relatórios diários</span>
                    </label>
                    <label className="check-item">
                      <input type="checkbox" checked />
                      <span>Alarmes de caixa</span>
                    </label>
                    <label className="check-item">
                      <input type="checkbox" />
                      <span>Atualizações do sistema</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="settings-card">
                <div className="card-header">
                  <h2>Backup e sincronização</h2>
                  <span className="badge">Cloud</span>
                </div>
                <div className="card-body">
                  <div className="toggle-list">
                    <div className="toggle-row">
                      <div className="toggle-info">
                        <span className="toggle-label">Sincronização automática</span>
                        <span className="toggle-hint">Backup em nuvem a cada 12 horas</span>
                      </div>
                      <label className="switch">
                        <input type="checkbox" checked />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="backup-box">
                    <span className="pill">Último backup: 08:30</span>
                    <span className="pill">Armazenamento: 76%</span>
                    <span className="pill">Status: normal</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>

    
      
      


</div></>;
}
