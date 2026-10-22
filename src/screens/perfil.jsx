import { useContext, useEffect, useRef, useState } from 'react';
import pageCss from './perfil.css?inline';
import sidebarCss from '../../ProjetoSuperMarket/sidebar.css?inline';
import Sidebar from '../Sidebar.jsx';
import { PROFILE_PHOTO_STORAGE_KEY, PROFILE_PHOTO_UPDATED_EVENT } from '../profilePhoto.js';
import { AuthContext } from '../authContext.js';
import { authorizedFetch } from '../auth.js';
import { roleLabel } from '../roles.js';

export default function perfilScreen() {
  const { userProfile, updateUserProfile } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    name: userProfile?.full_name || '',
    email: userProfile?.email || ''
  });
  const [profileDraft, setProfileDraft] = useState(profile);
  const [notice, setNotice] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState('');
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!userProfile) return;
    const currentProfile = {
      name: userProfile.full_name || '',
      email: userProfile.email || ''
    };
    setProfile(currentProfile);
    setProfileDraft(currentProfile);
  }, [userProfile]);

  useEffect(() => {
    const syncPhoto = (event) => {
      setProfilePhoto(event.detail?.photo || '');
    };
    const syncStoredPhoto = (event) => {
      if (event.key === PROFILE_PHOTO_STORAGE_KEY) {
        setProfilePhoto(event.newValue || '');
      }
    };

    try {
      setProfilePhoto(window.localStorage.getItem(PROFILE_PHOTO_STORAGE_KEY) || '');
    } catch (error) {
      console.error('Não foi possível carregar a foto do perfil.', error);
      setNotice({ type: 'error', text: 'Não foi possível carregar a foto salva neste navegador.' });
    }

    window.addEventListener(PROFILE_PHOTO_UPDATED_EVENT, syncPhoto);
    window.addEventListener('storage', syncStoredPhoto);
    return () => {
      window.removeEventListener(PROFILE_PHOTO_UPDATED_EVENT, syncPhoto);
      window.removeEventListener('storage', syncStoredPhoto);
    };
  }, []);

  const handlePhotoChange = (event) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setNotice({ type: 'error', text: 'Escolha uma imagem no formato PNG ou JPEG.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setNotice({ type: 'error', text: 'A imagem deve ter no máximo 2 MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setNotice({ type: 'error', text: 'Não foi possível ler a imagem selecionada.' });
        return;
      }
      try {
        window.localStorage.setItem(PROFILE_PHOTO_STORAGE_KEY, reader.result);
        window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, { detail: { photo: reader.result } }));
        setNotice({ type: 'success', text: 'Foto do perfil atualizada neste navegador.' });
      } catch (error) {
        console.error('Não foi possível salvar a foto do perfil.', error);
        setNotice({ type: 'error', text: 'Não foi possível salvar a foto. Tente uma imagem menor.' });
      }
    };
    reader.onerror = () => {
      setNotice({ type: 'error', text: 'Não foi possível ler a imagem selecionada.' });
    };
    reader.readAsDataURL(file);
  };

  const removeProfilePhoto = () => {
    try {
      window.localStorage.removeItem(PROFILE_PHOTO_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, { detail: { photo: '' } }));
      setNotice({ type: 'success', text: 'Foto removida do perfil neste navegador.' });
    } catch (error) {
      console.error('Não foi possível remover a foto do perfil.', error);
      setNotice({ type: 'error', text: 'Não foi possível remover a foto do perfil.' });
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileSaving(true);
    setNotice('');
    try {
      const response = await authorizedFetch('/api/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: profileDraft.name, email: profileDraft.email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível salvar seu perfil.');

      const updatedProfile = {
        ...profile,
        name: result.user.full_name,
        email: result.user.email
      };
      setProfile(updatedProfile);
      updateUserProfile(result.user);
      setProfileDraft({
        ...updatedProfile,
        email: result.emailChangePending ? result.requestedEmail : result.user.email
      });
      setNotice({
        type: 'success',
        text: result.emailChangePending
          ? `Nome salvo. Para concluir a troca do e-mail, confirme o endereço enviado para ${result.requestedEmail}.`
          : 'Perfil atualizado com sucesso.'
      });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível salvar seu perfil.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const updatePassword = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const currentPassword = form.elements.currentPassword.value;
    const password = form.elements.newPassword.value;
    if (password.length < 8) {
      setNotice({ type: 'error', text: 'A nova senha deve ter pelo menos 8 caracteres.' });
      return;
    }
    if (password !== form.elements.confirmPassword.value) {
      setNotice({ type: 'error', text: 'A nova senha e a confirmação não são iguais.' });
      return;
    }

    setPasswordSaving(true);
    setNotice('');
    try {
      const response = await authorizedFetch('/api/me/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, password })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível atualizar sua senha.');
      form.reset();
      setNotice({ type: 'success', text: 'Senha atualizada com sucesso.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível atualizar sua senha.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <style>{pageCss}</style>
      <style>{sidebarCss}</style>
      <div className="legacy-screen profile-screen">
        <div className="app-container">
          <Sidebar />
          <div className="sidebar-overlay" id="sidebarOverlay" />
          <main className="main-content" id="mainContent">
            <header className="profile-topbar">
              <div className="profile-topbar-heading">
                <button className="menu-toggle" data-legacy-action="toggleSidebar()" aria-label="Abrir menu">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
                  </svg>
                </button>
                <span>Minha conta</span>
              </div>
              <span className="profile-demo-tag">{roleLabel(userProfile?.role)}</span>
            </header>

            <div className="profile-content">
              <div className="profile-heading">
                <div className="profile-breadcrumb"><a href="/dashboard">Início</a><span>/</span><span>Meu perfil</span></div>
                <h1>Meu perfil</h1>
                <p>Gerencie suas informações pessoais e de acesso.</p>
              </div>

              <section className="profile-identity-card" aria-label="Resumo do perfil">
                <div className="profile-photo-control">
                  <button
                    type="button"
                    className="profile-avatar-button"
                    onClick={() => photoInputRef.current?.click()}
                    aria-label={profilePhoto ? 'Trocar foto do perfil' : 'Adicionar foto do perfil'}
                  >
                    <span className="profile-avatar">
                      {profilePhoto
                        ? <img src={profilePhoto} alt="" />
                        : profile.name.trim().charAt(0).toUpperCase() || 'A'}
                    </span>
                    <span className="profile-photo-edit" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M4 8.5h3l1.5-2h7l1.5 2h3v10H4v-10Z" />
                        <circle cx="12" cy="13.5" r="3.2" />
                      </svg>
                    </span>
                  </button>
                  <input
                    ref={photoInputRef}
                    className="profile-photo-input"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handlePhotoChange}
                    aria-label="Selecionar foto do perfil"
                  />
                  {profilePhoto && (
                    <button type="button" className="profile-photo-remove" onClick={removeProfilePhoto}>
                      Remover foto
                    </button>
                  )}
                </div>
                <div className="profile-identity-copy">
                  <h2>{profile.name}</h2>
                  <p>{profile.email} · {roleLabel(userProfile?.role)}</p>
                </div>
                <span className="profile-status"><span /> Conta ativa</span>
              </section>

              {notice && (
                <div className={`profile-notice${notice.type === 'error' ? ' profile-notice-error' : ''}`} role={notice.type === 'error' ? 'alert' : 'status'}>
                  {notice.text}
                </div>
              )}

              <div className="profile-panels">
                <section className="profile-panel">
                  <div className="profile-panel-heading">
                    <div className="profile-panel-icon" aria-hidden="true">◎</div>
                    <div><h2>Informações pessoais</h2><p>Dados básicos do seu perfil</p></div>
                  </div>
                  <form className="profile-form" onSubmit={saveProfile}>
                    <label>
                      Nome completo
                      <input
                        name="name"
                        value={profileDraft.name}
                        onChange={(event) => setProfileDraft((current) => ({ ...current, name: event.target.value }))}
                        autoComplete="name"
                      />
                    </label>
                    <label>
                      E-mail
                      <input
                        name="email"
                        type="email"
                        value={profileDraft.email}
                        onChange={(event) => setProfileDraft((current) => ({ ...current, email: event.target.value }))}
                        autoComplete="email"
                      />
                    </label>
                    <label>
                      Telefone
                      <input value="Não informado" readOnly />
                    </label>
                    <label>
                      Cargo
                      <input value={roleLabel(userProfile?.role)} readOnly />
                    </label>
                    <div className="profile-form-actions">
                      <button type="submit" className="profile-primary-button" disabled={profileSaving}>{profileSaving ? 'Salvando...' : 'Salvar alterações'}</button>
                    </div>
                  </form>
                </section>

                <section className="profile-panel profile-security-panel">
                  <div className="profile-panel-heading">
                    <div className="profile-panel-icon profile-security-icon" aria-hidden="true">⌑</div>
                    <div><h2>Segurança</h2><p>Atualize sua senha de acesso</p></div>
                  </div>
                  <form className="profile-form" onSubmit={updatePassword}>
                    <label>
                      Senha atual
                      <input type="password" name="currentPassword" placeholder="Digite sua senha atual" required minLength="8" autoComplete="current-password" />
                    </label>
                    <label>
                      Nova senha
                      <input type="password" name="newPassword" placeholder="Mínimo de 8 caracteres" required minLength="8" autoComplete="new-password" />
                    </label>
                    <label>
                      Confirmar nova senha
                      <input type="password" name="confirmPassword" placeholder="Digite novamente a nova senha" required minLength="8" autoComplete="new-password" />
                    </label>
                    <p className="profile-demo-help">A alteração da senha exige a senha atual. A alteração do e-mail pode exigir confirmação enviada pelo Supabase.</p>
                    <div className="profile-form-actions">
                      <button type="submit" className="profile-secondary-button" disabled={passwordSaving}>{passwordSaving ? 'Atualizando...' : 'Atualizar senha'}</button>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
