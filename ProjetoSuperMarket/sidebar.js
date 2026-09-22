// ========================================
// SIDEBAR NAVIGATION - Mercado Pro
// ========================================
// Script compartilhado por todas as páginas do sistema

// Toggle do submenu
function toggleSubmenu(event, submenuId) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const link = event && event.currentTarget;
  const submenu = document.getElementById(submenuId);
  const sidebar = document.getElementById("sidebar");

  if (!submenu || !sidebar) return;

  // Se o sidebar estiver colapsado, primeiro expanda-o
  if (sidebar.classList.contains("collapsed")) {
    sidebar.classList.remove("collapsed");
    const mainContent = document.getElementById("mainContent");
    if (mainContent) {
      mainContent.classList.remove("expanded");
    }
  }

  const isOpen = submenu.classList.contains("open");

  // Mantenha apenas um grupo aberto para evitar que a navegação se sobreponha.
  sidebar.querySelectorAll(".submenu.open").forEach((item) => {
    if (item !== submenu) {
      item.classList.remove("open");
      item.previousElementSibling?.classList.remove("expanded");
    }
  });

  submenu.classList.toggle("open", !isOpen);
  if (link) {
    link.classList.toggle("expanded", !isOpen);
  }
}

// Compatibilidade com as páginas que usam os nomes antigos.
function toggleMenu(event, submenuId) {
  toggleSubmenu(event, submenuId);
}

function toggleManagement(event, submenuId) {
  toggleSubmenu(event, submenuId);
}

function toggleCustomerSubmenu(event) {
  toggleSubmenu(event, "clients-submenu");
}

function initializeSubmenus() {
  const currentPath = window.location.pathname.replace(/\/$/, "");

  document.querySelectorAll(".submenu").forEach((submenu) => {
    const activeLink = [...submenu.querySelectorAll("a[href]")].find((link) => {
      const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/$/, "");
      return linkPath === currentPath;
    });

    if (activeLink) {
      activeLink.classList.add("active");
      submenu.classList.add("open");
      const parentLink = submenu.previousElementSibling;
      if (parentLink && parentLink.classList.contains("nav-link")) {
        parentLink.classList.add("active", "expanded");
      }
    }

    const parentLink = submenu.previousElementSibling;
    if (parentLink && parentLink.classList.contains("nav-link")) {
      parentLink.classList.toggle("expanded", submenu.classList.contains("open"));
    }
  });
}

function stabilizeSidebarLayout() {
  const sidebar = document.getElementById("sidebar");
  const navigation = sidebar?.querySelector(".sidebar-nav");
  const footer = sidebar?.querySelector(".sidebar-footer");

  if (!sidebar || !navigation || !footer) return;

  sidebar.style.display = "flex";
  sidebar.style.flexDirection = "column";
  navigation.style.flex = "1 1 auto";
  navigation.style.minHeight = "0";
  navigation.style.overflowY = "auto";
  footer.style.position = "sticky";
  footer.style.bottom = "0";
  footer.style.flexShrink = "0";
}

// Toggle sidebar (desktop - colapsar/expandir)
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const mainContent = document.getElementById("mainContent");

  if (!sidebar) return;

  if (window.innerWidth > 768) {
    // Desktop: colapsar/expandir
    sidebar.classList.toggle("collapsed");
    if (mainContent) {
      mainContent.classList.toggle("expanded");
    }

    // Fechar todos os submenus quando colapsar
    if (sidebar.classList.contains("collapsed")) {
      document.querySelectorAll(".submenu").forEach((submenu) => {
        submenu.classList.remove("open");
      });
      document.querySelectorAll(".nav-link.expanded").forEach((link) => {
        link.classList.remove("expanded");
      });
    }
  } else {
    // Mobile: mostrar/ocultar
    toggleMobileSidebar();
  }
}

// Toggle sidebar no mobile (mostrar/esconder completamente)
function toggleMobileSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!sidebar) return;

  sidebar.classList.toggle("mobile-visible");
  if (overlay) {
    overlay.classList.toggle("active");
  }
}

// Fechar sidebar ao clicar no overlay (mobile)
document.addEventListener("DOMContentLoaded", function () {
  initializeSubmenus();
  stabilizeSidebarLayout();

  const overlay = document.getElementById("sidebarOverlay");
  if (overlay) {
    overlay.addEventListener("click", toggleMobileSidebar);
  }

  // Delegação mantém o comportamento correto após redimensionar a janela.
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    sidebar.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link || link.querySelector(".nav-arrow") || link.getAttribute("href") === "#") return;
      if (window.innerWidth <= 768) toggleMobileSidebar();
    });
  }

  // Gerenciar redimensionamento da janela
  window.addEventListener("resize", () => {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("mainContent");
    const overlay = document.getElementById("sidebarOverlay");

    if (!sidebar) return;

    if (window.innerWidth > 768) {
      // Desktop: remover classes mobile
      sidebar.classList.remove("mobile-visible");
      if (overlay) overlay.classList.remove("active");
    } else {
      // Mobile: remover classe collapsed
      sidebar.classList.remove("collapsed");
      if (mainContent) {
        mainContent.classList.remove("expanded");
      }
    }
  });
});

// Log de inicialização
console.log("🎯 Sidebar navigation loaded - Mercado Pro");
