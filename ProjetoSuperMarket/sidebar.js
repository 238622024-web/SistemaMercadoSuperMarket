// ========================================
// SIDEBAR NAVIGATION - Super Market
// ========================================
// Script compartilhado por todas as páginas do sistema
// Responsável por:
// - Renderizar a sidebar
// - Navegação
// - Submenus
// - Sidebar recolhida
// - Sidebar mobile
// - Overlay mobile
// - Partículas decorativas
// ========================================

(() => {
  const script = document.currentScript;

  if (script?.src && !document.querySelector("[data-sidebar-styles]")) {
    const stylesheet = document.createElement("link");

    stylesheet.rel = "stylesheet";
    stylesheet.href = new URL("sidebar.css", script.src).href;
    stylesheet.dataset.sidebarStyles = "";

    document.head.appendChild(stylesheet);
  }
})();


// ========================================
// CONFIGURAÇÃO DA NAVEGAÇÃO
// ========================================

const SIDEBAR_NAVIGATION = [
  {
    title: "Principal",

    links: [
      {
        label: "Início",
        route: "dashboard",
        icon: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"
      },

      {
        label: "Análise",
        route: "analise",
        icon: "M5 9.5h3v9H5zm5-5h3v14h-3zm5 8h3v6h-3zM3 19.5h18v2H3z"
      }
    ]
  },

  {
    title: "Gerenciamento",

    links: [
      {
        label: "Produtos",

        icon:
          "M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z",

        children: [
          ["Lista de Produtos", "produtos"],
          ["Adicionar Produto", "adicionar-produto"],
          ["Categorias", "categorias"],
          ["Etiqueta de Gôndola", "etiqueta-gondola"],
          ["Controle de Estoque", "estoque"]
        ]
      },

      {
        label: "Vendas",

        icon:
          "M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42l.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1z",

        children: [
          ["PDV (Caixa)", "pdv"],
          ["Histórico de Vendas", "vendas"],
          ["Relatórios", "relatorios"]
        ]
      },

      {
        label: "Financeiro",

        icon:
          "M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z",

        children: [
          ["Controle de Caixa", "caixa"],
          ["Contas a Pagar/Receber", "contas"],
          ["Fluxo de Caixa", "fluxo-caixa"]
        ]
      },

      {
        label: "Clientes",

        icon:
          "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z",

        children: [
          ["Lista de Clientes", "clientes"],
          ["Cadastrar Cliente", "adicionar-cliente"]
        ]
      },

      {
        label: "Fornecedores",

        icon:
          "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z",

        children: [
          ["Lista de Fornecedores", "fornecedores"],
          ["Pedidos de Compra", "pedidos-compra"]
        ]
      }
    ]
  },

  {
    title: "Sistema",

    links: [
      {
        label: "Configurações",

        route: "configuracoes",

        icon:
          "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.37 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
      },

      {
        label: "Ajuda",

        route: null,

        icon:
          "M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      }
    ]
  }
];


// ========================================
// SUBMENUS
// ========================================

function toggleSidebarSubmenu(event, submenuId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const link = event?.currentTarget;
  const submenu = document.getElementById(submenuId);
  const sidebar = document.getElementById("sidebar");

  if (!submenu || !sidebar) return;

  const sidebarWasCollapsed =
    window.innerWidth > 850
      ? sidebar.classList.contains("collapsed")
      : !sidebar.classList.contains("mobile-visible");

  if (sidebarWasCollapsed) {
    if (window.innerWidth > 850) {
      sidebar.classList.remove("collapsed");
      getMainContent()?.classList.remove("expanded");
      updateSidebarControls();
    } else {
      setMobileSidebarVisibility(true);
    }
  }

  const shouldOpen =
    sidebarWasCollapsed || !submenu.classList.contains("open");

  sidebar.querySelectorAll(".submenu.open").forEach((openSubmenu) => {
    if (openSubmenu === submenu) return;

    openSubmenu.classList.remove("open");

    const openLink = openSubmenu.previousElementSibling;
    openLink?.classList.remove("expanded");
    openLink?.setAttribute("aria-expanded", "false");
  });

  submenu.classList.toggle("open", shouldOpen);

  link?.classList.toggle("expanded", shouldOpen);

  link?.setAttribute(
    "aria-expanded",
    String(shouldOpen)
  );
}


function toggleSidebarMenu(event, submenuId) {
  toggleSidebarSubmenu(event, submenuId);
}


function toggleSidebarManagement(event, submenuId) {
  toggleSidebarSubmenu(event, submenuId);
}


function toggleSidebarCustomerSubmenu(event) {
  toggleSidebarSubmenu(event, "clients-submenu");
}


// ========================================
// MAIN CONTENT
// ========================================

function getMainContent() {
  return (
    document.getElementById("mainContent") ||
    document.getElementById("main")
  );
}


// ========================================
// PARTÍCULAS DECORATIVAS
// ========================================

function createSidebarParticles(sidebar) {
  if (!sidebar || sidebar.querySelector(".sidebar-particles")) return;

  const particlesContainer = document.createElement("div");
  particlesContainer.className = "sidebar-particles";
  particlesContainer.setAttribute("aria-hidden", "true");

  for (let index = 0; index < 22; index += 1) {
    const particle = document.createElement("span");
    const size = Math.random() * 2.5 + 1.5;
    const duration = Math.random() * 7 + 8;

    particle.className = "sidebar-particle";
    if (index % 5 === 0) {
      particle.classList.add("sidebar-particle--bright");
    }

    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.setProperty("--particle-duration", `${duration}s`);
    particle.style.setProperty("--particle-delay", `${Math.random() * -15}s`);
    particle.style.setProperty(
      "--particle-drift",
      `${Math.random() * 36 - 18}px`
    );

    particlesContainer.appendChild(particle);
  }

  sidebar.prepend(particlesContainer);
}


// ========================================
// RENDERIZAÇÃO DA SIDEBAR
// ========================================

function renderCompleteSidebar(sidebar) {
  sidebar.innerHTML = `
    <div class="sidebar-header">

      <div class="logo">

        <div class="logo-icon">
          <img src="../images/Logo-SuperMarket.png" alt="Logo Super Market" />
        </div>

        <div class="logo-copy">
          <span>Super Market</span>
          <small>GESTÃO INTELIGENTE</small>
        </div>

      </div>

    </div>

    <nav
      class="sidebar-nav"
      aria-label="Navegação principal">
    </nav>

    <div class="sidebar-footer">

      <div class="user-profile">

        <div class="user-avatar">
          A
        </div>

        <div class="user-info">

          <span class="user-name">
            Administrador
          </span>

          <span class="user-role">
            Gerente
          </span>

        </div>

        <button
          type="button"
          class="user-more"
          aria-label="Opções do usuário">
          <span></span>
          <span></span>
          <span></span>
        </button>

      </div>

    </div>
  `;

  createSidebarParticles(sidebar);

  const navigation =
    sidebar.querySelector(".sidebar-nav");

  const currentPath =
    window.location.pathname
      .replace(/\/index\.html$/, "")
      .replace(/\/$/, "");


  // ========================================
  // CRIAÇÃO DOS MENUS
  // ========================================

  SIDEBAR_NAVIGATION.forEach((section) => {

    const sectionElement =
      document.createElement("div");

    sectionElement.className =
      "nav-section";


    const title =
      document.createElement("div");

    title.className =
      "nav-section-title";

    title.textContent =
      section.title;

    sectionElement.appendChild(title);


    const list =
      document.createElement("ul");

    section.links.forEach((item) => {

      const listItem =
        document.createElement("li");

      listItem.className =
        "nav-item";


      const link =
        document.createElement("a");

      link.className =
        "nav-link";

      link.dataset.tooltip =
        item.label;


      // ========================================
      // ÍCONE
      // ========================================

      const icon =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );

      icon.classList.add("nav-icon");

      icon.setAttribute(
        "viewBox",
        "0 0 24 24"
      );

      icon.setAttribute(
        "fill",
        "currentColor"
      );

      icon.setAttribute(
        "aria-hidden",
        "true"
      );


      const path =
        document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path"
        );

      path.setAttribute(
        "d",
        item.icon
      );

      icon.appendChild(path);

      link.appendChild(icon);


      // ========================================
      // TEXTO
      // ========================================

      const label =
        document.createElement("span");

      label.className =
        "nav-text";

      label.textContent =
        item.label;

      link.appendChild(label);


      // ========================================
      // SUBMENU
      // ========================================

      if (item.children) {

        const submenuId =
          `sidebar-${item.label.toLowerCase()}`;

        link.href = "#";

        link.setAttribute(
          "aria-controls",
          submenuId
        );

        link.setAttribute(
          "aria-expanded",
          "false"
        );


        const arrow =
          document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );

        arrow.classList.add(
          "nav-arrow"
        );

        arrow.setAttribute(
          "viewBox",
          "0 0 24 24"
        );

        arrow.setAttribute(
          "aria-hidden",
          "true"
        );

        arrow.innerHTML =
          '<path d="M7 10l5 5 5-5z"/>';

        link.appendChild(arrow);


        link.addEventListener(
          "click",
          (event) =>
            toggleSidebarSubmenu(
              event,
              submenuId
            )
        );


        listItem.appendChild(link);


        const submenu =
          document.createElement("ul");

        submenu.className =
          "submenu";

        submenu.id =
          submenuId;


        item.children.forEach(
          ([childLabel, route]) => {

            const childItem =
              document.createElement("li");

            childItem.className =
              "submenu-item";


            const childLink =
              document.createElement("a");

            childLink.className =
              "submenu-link";

            childLink.href =
              `../${route}/index.html`;


            const dot =
              document.createElement("span");

            dot.className =
              "submenu-dot";

            dot.setAttribute(
              "aria-hidden",
              "true"
            );


            const childText =
              document.createElement("span");

            childText.textContent =
              childLabel;


            childLink.append(
              dot,
              childText
            );

            childItem.appendChild(
              childLink
            );

            submenu.appendChild(
              childItem
            );
          }
        );


        listItem.appendChild(
          submenu
        );

      } else {

        link.href =
          item.route
            ? `../${item.route}/index.html`
            : "#";


        if (
          item.route &&
          (
            currentPath.endsWith(
              `/${item.route}`
            ) ||
            currentPath.endsWith(
              `/${item.route}/index.html`
            )
          )
        ) {
          link.classList.add(
            "active"
          );
        }


        listItem.appendChild(
          link
        );
      }


      list.appendChild(
        listItem
      );

    });


    sectionElement.appendChild(
      list
    );

    navigation.appendChild(
      sectionElement
    );

  });
}


// ========================================
// INICIALIZA SUBMENUS
// ========================================

function initializeSubmenus() {

  const currentPath =
    window.location.pathname
      .replace(/\/index\.html$/, "")
      .replace(/\/$/, "");


  document
    .querySelectorAll(".submenu")
    .forEach((submenu) => {

      const activeLink =
        [
          ...submenu.querySelectorAll(
            "a[href]"
          )
        ].find((link) => {

          const linkPath =
            new URL(
              link.href,
              window.location.href
            ).pathname
              .replace(/\/index\.html$/, "")
              .replace(/\/$/, "");

          return (
            linkPath === currentPath
          );

        });


      if (activeLink) {

        activeLink.classList.add(
          "active"
        );

        submenu.classList.add(
          "open"
        );


        const parentLink =
          submenu.previousElementSibling;


        if (
          parentLink?.classList.contains(
            "nav-link"
          )
        ) {

          parentLink.classList.add(
            "active",
            "expanded"
          );

          parentLink.setAttribute(
            "aria-expanded",
            "true"
          );

        }

      }


      const parentLink =
        submenu.previousElementSibling;


      if (
        parentLink?.classList.contains(
          "nav-link"
        )
      ) {

        parentLink.classList.toggle(
          "expanded",
          submenu.classList.contains(
            "open"
          )
        );

        parentLink.setAttribute(
          "aria-expanded",
          String(
            submenu.classList.contains(
              "open"
            )
          )
        );

      }

    });
}


// ========================================
// ESTABILIZA LAYOUT
// ========================================

function stabilizeSidebarLayout() {

  const sidebar =
    document.getElementById(
      "sidebar"
    );

  const navigation =
    sidebar?.querySelector(
      ".sidebar-nav"
    );

  const footer =
    sidebar?.querySelector(
      ".sidebar-footer"
    );


  if (!sidebar) return;


  sidebar.style.display =
    "flex";

  sidebar.style.flexDirection =
    "column";

  sidebar.style.justifyContent =
    "flex-start";

  sidebar.style.alignItems =
    "stretch";

  sidebar.style.overflow =
    "hidden";


  if (navigation) {

    navigation.style.flex =
      "1 1 auto";

    navigation.style.minHeight =
      "0";

    navigation.style.overflowY =
      "auto";

    navigation.style.overscrollBehavior =
      "contain";
  }


  if (footer) {

    footer.style.position =
      "sticky";

    footer.style.bottom =
      "0";

    footer.style.flexShrink =
      "0";
  }
}


// ========================================
// OVERLAY
// ========================================

function getSidebarOverlay() {

  let overlay =
    document.getElementById(
      "sidebarOverlay"
    );


  if (!overlay) {

    overlay =
      document.createElement(
        "div"
      );

    overlay.id =
      "sidebarOverlay";

    overlay.className =
      "sidebar-overlay";

    document.body.appendChild(
      overlay
    );
  }


  overlay.setAttribute(
    "aria-hidden",
    String(
      !overlay.classList.contains(
        "active"
      )
    )
  );


  return overlay;
}


// ========================================
// CONTROLES
// ========================================

function updateSidebarControls() {

  const sidebar =
    document.getElementById(
      "sidebar"
    );

  if (!sidebar) return;


  const isExpanded =
    window.innerWidth <= 850
      ? sidebar.classList.contains(
          "mobile-visible"
        )
      : !sidebar.classList.contains(
          "collapsed"
        );


  document
    .querySelectorAll(
      ".menu-toggle, .menu-toggle-pdv, .menu, #menu, #menuToggle"
    )
    .forEach((button) => {

      button.setAttribute(
        "aria-controls",
        "sidebar"
      );

      button.setAttribute(
        "aria-expanded",
        String(isExpanded)
      );

      button.setAttribute(
        "aria-label",
        isExpanded
          ? "Recolher menu"
          : "Expandir menu"
      );

    });

  const sidebarCloseButton =
    sidebar.querySelector(".sidebar-close");

  if (sidebarCloseButton) {
    const isMobile = window.innerWidth <= 850;
    const isCollapsed = sidebar.classList.contains("collapsed");

    sidebarCloseButton.setAttribute(
      "aria-label",
      isMobile
        ? sidebar.classList.contains("mobile-visible")
          ? "Recolher menu"
          : "Expandir menu"
        : isCollapsed
          ? "Expandir menu"
          : "Recolher menu"
    );

    sidebarCloseButton.setAttribute(
      "aria-expanded",
      String(isMobile
        ? sidebar.classList.contains("mobile-visible")
        : !isCollapsed)
    );

    sidebarCloseButton.innerHTML = isMobile
      ? `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${sidebar.classList.contains("mobile-visible") ? "M14.71 17.29 13.3 18.7 6.6 12l6.7-6.7 1.41 1.41L9.41 12z" : "M9.29 6.71 10.7 5.3 17.4 12l-6.7 6.7-1.41-1.41L14.59 12z"}"/></svg>`
      : `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${isCollapsed ? "M9.29 6.71 10.7 5.3 17.4 12l-6.7 6.7-1.41-1.41L14.59 12z" : "M14.71 17.29 13.3 18.7 6.6 12l6.7-6.7 1.41 1.41L9.41 12z"}"/></svg>`;
  }
}


// ========================================
// MOBILE
// ========================================

function setMobileSidebarVisibility(
  isVisible
) {

  const sidebar =
    document.getElementById(
      "sidebar"
    );

  if (!sidebar) return;


  const overlay =
    getSidebarOverlay();


  sidebar.classList.toggle(
    "mobile-visible",
    isVisible
  );

  overlay.setAttribute(
    "aria-hidden",
    String(!isVisible)
  );

  overlay.classList.toggle(
    "active",
    isVisible
  );

  document.body.classList.toggle(
    "sidebar-open",
    isVisible
  );


  updateSidebarControls();
}


// ========================================
// TOGGLE SIDEBAR
// ========================================

function toggleSharedSidebar() {

  const sidebar =
    document.getElementById(
      "sidebar"
    );

  if (!sidebar) return;


  if (
    window.innerWidth > 850
  ) {

    sidebar.classList.toggle(
      "collapsed"
    );


    getMainContent()?.classList.toggle(
      "expanded",
      sidebar.classList.contains(
        "collapsed"
      )
    );

  } else {

    setMobileSidebarVisibility(
      !sidebar.classList.contains(
        "mobile-visible"
      )
    );

  }


  updateSidebarControls();
}


function toggleMobileSidebar() {

  const sidebar =
    document.getElementById(
      "sidebar"
    );

  if (!sidebar) return;


  setMobileSidebarVisibility(
    !sidebar.classList.contains(
      "mobile-visible"
    )
  );
}


function closeMobileSidebar() {

  setMobileSidebarVisibility(
    false
  );
}


// ========================================
// DOM READY
// ========================================

document.addEventListener(
  "DOMContentLoaded",
  () => {

    const sidebar =
      document.getElementById(
        "sidebar"
      );

    if (!sidebar) return;


    // Renderiza
    renderCompleteSidebar(
      sidebar
    );


    // Submenus
    initializeSubmenus();


    // Layout
    stabilizeSidebarLayout();


    // Overlay
    const overlay =
      getSidebarOverlay();


    overlay.addEventListener(
      "click",
      closeMobileSidebar
    );


    // ========================================
    // BOTÕES DE MENU
    // ========================================

    document.addEventListener(
      "click",
      (event) => {

        const toggleButton =
          event.target.closest(
            ".menu-toggle, .menu-toggle-pdv, .menu, #menu, #menuToggle"
          );


        if (!toggleButton) return;


        event.preventDefault();

        event.stopImmediatePropagation();

        toggleSharedSidebar();

      },
      true
    );


    // ========================================
    // BOTÃO FECHAR MOBILE
    // ========================================

    const sidebarHeader =
      sidebar.querySelector(
        ".sidebar-header"
      );


    if (
      sidebarHeader &&
      !sidebarHeader.querySelector(
        ".sidebar-close"
      )
    ) {

      const closeButton =
        document.createElement(
          "button"
        );


      closeButton.type =
        "button";

      closeButton.className =
        "sidebar-close";

      closeButton.addEventListener(
        "click",
        toggleSharedSidebar
      );


      sidebarHeader.appendChild(
        closeButton
      );

    }


    // ========================================
    // FECHA MENU AO NAVEGAR NO MOBILE
    // ========================================

    sidebar.addEventListener(
      "click",
      (event) => {

        const link =
          event.target.closest(
            "a"
          );


        if (
          !link ||
          link.querySelector(
            ".nav-arrow"
          ) ||
          link.getAttribute(
            "href"
          ) === "#"
        ) {
          return;
        }


        if (
          window.innerWidth <= 850
        ) {
          closeMobileSidebar();
        }

      }
    );


    // ========================================
    // ESC
    // ========================================

    document.addEventListener(
      "keydown",
      (event) => {

        if (
          event.key === "Escape" &&
          sidebar.classList.contains(
            "mobile-visible"
          )
        ) {

          closeMobileSidebar();

        }

      }
    );


    // ========================================
    // RESIZE
    // ========================================

    window.addEventListener(
      "resize",
      () => {

        const mainContent =
          getMainContent();


        if (
          window.innerWidth > 850
        ) {

          sidebar.classList.remove(
            "mobile-visible"
          );

          const overlay = getSidebarOverlay();
          overlay.classList.remove("active");
          overlay.setAttribute("aria-hidden", "true");


          document.body.classList.remove(
            "sidebar-open"
          );


          mainContent?.classList.toggle(
            "expanded",
            sidebar.classList.contains(
              "collapsed"
            )
          );

        } else {

          sidebar.classList.remove("collapsed");


          mainContent?.classList.remove(
            "expanded"
          );


          const overlay = getSidebarOverlay();
          overlay.classList.remove("active");
          overlay.setAttribute("aria-hidden", "true");


          document.body.classList.remove(
            "sidebar-open"
          );

        }


        updateSidebarControls();

      }
    );


    // ========================================
    // ESTADO INICIAL MOBILE
    // ========================================

    if (
      window.innerWidth <= 850
    ) {

      sidebar.classList.remove(
        "collapsed"
      );

      getMainContent()?.classList.remove(
        "expanded"
      );

    }


    updateSidebarControls();

  }
);