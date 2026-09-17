// ========================================
// SIDEBAR NAVIGATION - Mercado Pro
// ========================================
// Script compartilhado por todas as páginas do sistema

// Toggle do submenu
function toggleSubmenu(event, submenuId) {
    event.preventDefault();
    event.stopPropagation();
    
    const link = event.currentTarget;
    const submenu = document.getElementById(submenuId);
    const sidebar = document.getElementById('sidebar');
    
    // Se o sidebar estiver colapsado, primeiro expanda-o
    if (sidebar.classList.contains('collapsed')) {
        sidebar.classList.remove('collapsed');
        document.getElementById('mainContent').classList.remove('expanded');
    }
    
    // Toggle classe expanded no link
    link.classList.toggle('expanded');
    
    // Toggle classe open no submenu
    submenu.classList.toggle('open');
}

// Toggle sidebar (desktop - colapsar/expandir)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (window.innerWidth > 768) {
        // Desktop: colapsar/expandir
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // Fechar todos os submenus quando colapsar
        if (sidebar.classList.contains('collapsed')) {
            document.querySelectorAll('.submenu').forEach(submenu => {
                submenu.classList.remove('open');
            });
            document.querySelectorAll('.nav-link.expanded').forEach(link => {
                link.classList.remove('expanded');
            });
        }
    } else {
        // Mobile: mostrar/ocultar
        toggleMobileSidebar();
    }
}

// Toggle sidebar no mobile (mostrar/esconder completamente)
function toggleMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('mobile-visible');
    overlay.classList.toggle('active');
}

// Fechar sidebar ao clicar no overlay (mobile)
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.getElementById('sidebarOverlay');
    if (overlay) {
        overlay.addEventListener('click', toggleMobileSidebar);
    }
    
    // Fechar sidebar ao clicar em um link (mobile) - apenas se não for submenu
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.nav-link, .submenu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                // Não fechar se for um link que tem submenu
                if (!link.querySelector('.nav-arrow')) {
                    toggleMobileSidebar();
                }
            });
        });
    }
    
    // Gerenciar redimensionamento da janela
    window.addEventListener('resize', () => {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.getElementById('mainContent');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (window.innerWidth > 768) {
            // Desktop: remover classes mobile
            sidebar.classList.remove('mobile-visible');
            if (overlay) overlay.classList.remove('active');
        } else {
            // Mobile: remover classe collapsed
            sidebar.classList.remove('collapsed');
            mainContent.classList.remove('expanded');
        }
    });
});

// Log de inicialização
console.log('🎯 Sidebar navigation loaded - Mercado Pro');
