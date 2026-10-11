import { useCallback, useEffect, useState } from 'react';
import pageCss from './colaboradores.css?inline';
import sidebarCss from '../../ProjetoSuperMarket/sidebar.css?inline';
import Sidebar from '../Sidebar.jsx';
import { authorizedFetch } from '../auth.js';

export default function ColaboradoresScreen() {
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadCollaborators = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authorizedFetch('/api/collaborators');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar os colaboradores.');
      setCollaborators(result.data);
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível carregar os colaboradores.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCollaborators();
  }, [loadCollaborators]);

  const createCollaborator = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setSaving(true);
    setNotice(null);
    try {
      const response = await authorizedFetch('/api/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.get('fullName'),
          email: formData.get('email'),
          password: formData.get('password')
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível criar o colaborador.');
      form.reset();
      setCollaborators((current) => [result.data, ...current]);
      setNotice({ type: 'success', text: 'Conta criada. O colaborador precisará trocar a senha inicial no primeiro acesso.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível criar o colaborador.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (collaborator) => {
    setNotice(null);
    try {
      const response = await authorizedFetch(`/api/collaborators/${encodeURIComponent(collaborator.id)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !collaborator.is_active })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível atualizar o acesso.');
      setCollaborators((current) => current.map((item) => item.id === collaborator.id ? result.data : item));
      setNotice({ type: 'success', text: result.data.is_active ? 'Acesso do colaborador reativado.' : 'Acesso do colaborador desativado.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível atualizar o acesso.' });
    }
  };

  return (
    <>
      <style>{pageCss}</style>
      <style>{sidebarCss}</style>
      <div className="legacy-screen collaborators-screen">
        <div className="app-container">
          <Sidebar />
          <div className="sidebar-overlay" id="sidebarOverlay" />
          <main className="main-content" id="mainContent">
            <header className="collaborators-header">
              <button className="menu-toggle" aria-label="Alternar menu lateral" data-legacy-action="toggleSidebar()">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                </svg>
              </button>
              <div>
                <p>Administração / Acessos</p>
                <h1>Colaboradores</h1>
              </div>
            </header>

            <div className="collaborators-content">
              <section className="collaborators-intro">
                <h2>Contas da equipe</h2>
                <p>O perfil Colaborador pode acessar somente o PDV e a Etiqueta de Gôndola. A senha inicial deve ser trocada no primeiro acesso.</p>
              </section>

              {notice && <div className={`collaborators-notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</div>}

              <section className="collaborators-card">
                <h2>Criar colaborador</h2>
                <form className="collaborator-form" onSubmit={createCollaborator}>
                  <label>
                    Nome completo
                    <input name="fullName" type="text" minLength="2" maxLength="120" autoComplete="name" required />
                  </label>
                  <label>
                    E-mail de acesso
                    <input name="email" type="email" autoComplete="email" required />
                  </label>
                  <label>
                    Senha inicial
                    <input name="password" type="password" minLength="8" autoComplete="new-password" required />
                  </label>
                  <p className="collaborator-access-note">Compartilhe a senha inicial diretamente com o colaborador. Ele será obrigado a trocá-la ao entrar.</p>
                  <button type="submit" disabled={saving}>{saving ? 'Criando conta...' : 'Criar conta'}</button>
                </form>
              </section>

              <section className="collaborators-card">
                <div className="collaborators-list-heading">
                  <h2>Colaboradores cadastrados</h2>
                  <button type="button" onClick={() => void loadCollaborators()} disabled={loading}>Atualizar lista</button>
                </div>
                {loading ? (
                  <p role="status">Carregando colaboradores...</p>
                ) : collaborators.length ? (
                  <div className="collaborators-table-wrap">
                    <table className="collaborators-table">
                      <thead>
                        <tr><th>Nome</th><th>E-mail</th><th>Acesso</th><th>Status</th><th>Ação</th></tr>
                      </thead>
                      <tbody>
                        {collaborators.map((collaborator) => (
                          <tr key={collaborator.id}>
                            <td>{collaborator.full_name}</td>
                            <td>{collaborator.email}</td>
                            <td>PDV e Etiqueta de Gôndola</td>
                            <td><span className={`collaborator-status${collaborator.is_active ? ' active' : ''}`}>{collaborator.is_active ? 'Ativo' : 'Inativo'}</span></td>
                            <td><button type="button" className="collaborator-status-button" onClick={() => void toggleStatus(collaborator)}>{collaborator.is_active ? 'Desativar' : 'Reativar'}</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>Nenhum colaborador cadastrado.</p>
                )}
              </section>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
