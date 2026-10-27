import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PROFILE_PHOTO_STORAGE_KEY, PROFILE_PHOTO_UPDATED_EVENT } from './profilePhoto.js';
import { AuthContext } from './authContext.js';
import { ROLE_ROUTES, roleLabel } from './roles.js';

const groups = [
  {
    title: 'Principal',
    links: [
      ['Início', 'dashboard', 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'],
      ['Análise', 'analise', 'M5 9.5h3v9H5zm5-5h3v14h-3zm5 8h3v6h-3zM3 19.5h18v2H3z']
    ]
  },
  {
    title: 'Gerenciamento',
    links: [
      ['Produtos', null, 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z', [
        ['Lista de Produtos', 'produtos'],
        ['Adicionar Produto', 'adicionar-produto'],
        ['Categorias', 'categorias'],
        ['Etiqueta de Gôndola', 'etiqueta-gondola'],
        ['Controle de Estoque', 'estoque']
      ]],
      ['Vendas', null, 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42l.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1z', [
        ['PDV (Caixa)', 'pdv'],
        ['Histórico de Vendas', 'vendas'],
        ['Relatórios', 'relatorios']
      ]],
      ['Financeiro', null, 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z', [
        ['Controle de Caixa', 'caixa'],
        ['Contas a Pagar', 'contas'],
        ['Fluxo de Caixa', 'fluxo-caixa']
      ]],
      ['Clientes', null, 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c-2.33-4.67-7-3.5-7-3.5z', [
        ['Lista de Clientes', 'clientes'],
        ['Cadastrar Cliente', 'adicionar-cliente']
      ]],
      ['Fornecedores', null, 'M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z', [
        ['Lista de Fornecedores', 'fornecedores'],
        ['Pedidos de Compra', 'pedidos-compra']
      ]]
    ]
  },
  {
    title: 'Sistema',
    links: [
      ['Configurações', 'configuracoes', 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.37 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'],
      ['Colaboradores', 'colaboradores', 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c-2.33-4.67-7-3.5-7-3.5z'],
      ['Ajuda', 'ajuda', 'M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z']
    ]
  }
];

const sidebarParticles = Array.from({ length: 22 }, (_, index) => ({
  left: `${(index * 47 + 13) % 100}%`,
  top: `${(index * 61 + 7) % 100}%`,
  size: `${1.5 + (index % 4) * 0.6}px`,
  duration: `${8 + (index % 7)}s`,
  delay: `${-((index * 3) % 15)}s`,
  drift: `${(index % 5) * 7 - 14}px`,
  bright: index % 5 === 0
}));

export default function Sidebar({ activeRoute }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut } = useContext(AuthContext);
  const [openGroup, setOpenGroup] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState('');
  const pathParts = location.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  const active = pathParts.at(-1) === 'index.html'
    ? pathParts.at(-2) || 'login'
    : pathParts.at(-1) || 'login';
  const visibleGroups = groups.map((group) => ({
    ...group,
    links: group.links.flatMap((item) => {
      const [label, route, icon, children] = item;
      if (userProfile?.role === 'admin') return [item];
      const allowedRoutes = ROLE_ROUTES[userProfile?.role] || [];
      if (!children) return allowedRoutes.includes(route) ? [item] : [];
      const allowedChildren = children.filter((child) => allowedRoutes.includes(child[1]));
      return allowedChildren.length ? [[label, route, icon, allowedChildren]] : [];
    })
  })).filter((group) => group.links.length);

  const closeMobileSidebar = () => {
    document.getElementById('sidebar')?.classList.remove('mobile-visible');
    document.querySelector('#sidebarOverlay, #overlay, .sidebar-overlay, .mobile-overlay')?.classList.remove('active');
    document.body.classList.remove('sidebar-open');
  };

  useEffect(() => {
    const selectedGroup = groups.flatMap((group) => group.links).find((item) =>
      (item[3] || []).some((child) => child[1] === active)
    );
    setOpenGroup(selectedGroup?.[0] || null);
  }, [active]);

  useEffect(() => {
    const syncPhoto = (event) => setProfilePhoto(event.detail?.photo || '');
    const syncStoredPhoto = (event) => {
      if (event.key === PROFILE_PHOTO_STORAGE_KEY) {
        setProfilePhoto(event.newValue || '');
      }
    };

    try {
      setProfilePhoto(window.localStorage.getItem(PROFILE_PHOTO_STORAGE_KEY) || '');
    } catch (error) {
      console.error('Não foi possível carregar a foto do perfil na barra lateral.', error);
    }

    window.addEventListener(PROFILE_PHOTO_UPDATED_EVENT, syncPhoto);
    window.addEventListener('storage', syncStoredPhoto);
    return () => {
      window.removeEventListener(PROFILE_PHOTO_UPDATED_EVENT, syncPhoto);
      window.removeEventListener('storage', syncStoredPhoto);
    };
  }, []);

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-particles" aria-hidden="true">
        {sidebarParticles.map((particle, index) => (
          <span
            className={`sidebar-particle${particle.bright ? ' sidebar-particle--bright' : ''}`}
            key={index}
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
              '--particle-duration': particle.duration,
              '--particle-delay': particle.delay,
              '--particle-drift': particle.drift
            }}
          />
        ))}
      </div>
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon"><img src="/images/Logo-SuperMarket.png" alt="Logo Super Market" /></div>
          <div className="logo-copy"><span>Super Market</span><small>GESTÃO INTELIGENTE</small></div>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        {visibleGroups.map((group) => (
          <section className="nav-section" key={group.title}>
            <div className="nav-section-title">{group.title}</div>
            <ul>
              {group.links.map(([label, route, icon, children]) => {
                const expanded = openGroup === label;
                const current = route === active || (children || []).some((child) => child[1] === active);
                const submenuId = `sidebar-${label.toLowerCase()}`;
                return (
                  <li className="nav-item" key={label}>
                    {children ? (
                      <>
                        <a
                          href="#"
                          className={`nav-link${current ? ' active' : ''}${expanded ? ' expanded' : ''}`}
                          data-tooltip={label}
                          aria-controls={submenuId}
                          aria-expanded={expanded}
                          onClick={(event) => {
                            event.preventDefault();
                            const sidebar = document.getElementById('sidebar');
                            if (window.innerWidth > 850 && sidebar?.classList.contains('collapsed')) {
                              sidebar.classList.remove('collapsed');
                              document.querySelector('#mainContent, #main, .main-content, .main')?.classList.remove('expanded');
                              setOpenGroup(label);
                            } else if (window.innerWidth <= 850 && !sidebar?.classList.contains('mobile-visible')) {
                              sidebar?.classList.add('mobile-visible');
                              document.querySelector('#sidebarOverlay, #overlay, .sidebar-overlay, .mobile-overlay')?.classList.add('active');
                              document.body.classList.add('sidebar-open');
                              setOpenGroup(label);
                            } else {
                              setOpenGroup((currentGroup) => currentGroup === label ? null : label);
                            }
                          }}
                        >
                          <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon} /></svg>
                          <span className="nav-text">{label}</span>
                          <svg className="nav-arrow" viewBox="0 0 24 24" aria-hidden="true">
                            <path
                              d={expanded ? 'M7 7l5 5 5-5M7 13l5 5 5-5' : 'M10 7l5 5-5 5'}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </a>
                        <ul className={`submenu${expanded ? ' open' : ''}`} id={submenuId}>
                          {children.map(([childLabel, childRoute]) => (
                            <li className="submenu-item" key={childRoute}>
                              <Link className={`submenu-link${active === childRoute ? ' active' : ''}`} to={`/${childRoute}`} onClick={closeMobileSidebar}>
                                <span className="submenu-dot" aria-hidden="true" /><span>{childLabel}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link className={`nav-link${route === active ? ' active' : ''}`} to={route ? `/${route}` : '#'} data-tooltip={label} onClick={closeMobileSidebar}>
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d={icon} /></svg>
                        <span className="nav-text">{label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </nav>
      <div className="sidebar-footer">
        <Link className="user-profile" to="/perfil" onClick={closeMobileSidebar} aria-label={`Abrir perfil de ${userProfile?.full_name || 'usuário'}`}>
          <div className="user-avatar">
            {profilePhoto ? <img src={profilePhoto} alt="" /> : 'A'}
          </div>
          <div className="user-info"><span className="user-name">{userProfile?.full_name || 'Usuário'}</span><span className="user-role">{roleLabel(userProfile?.role)}</span></div>
          <span className="user-more" aria-hidden="true"><span /><span /><span /></span>
        </Link>
        <button
          type="button"
          className="sidebar-logout"
          aria-label="Sair da conta"
          title="Sair da conta"
          onClick={async () => {
            await signOut();
            navigate('/index');
          }}
        >
          <svg className="sidebar-logout-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 17l5-5-5-5M15 12H3m9-8h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="sidebar-logout-label">Sair da conta</span>
          <span className="sidebar-logout-hint" aria-hidden="true">Encerrar sessão</span>
        </button>
      </div>
    </aside>
  );
}
