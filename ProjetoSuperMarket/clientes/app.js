
      const sidebar = document.getElementById("sidebar");
      sidebar.innerHTML = `
        <div class="logo"><div class="logo-mark">M</div><span>Mercado Pro</span></div>
        <div class="section-title">Principal</div>
        <a class="nav-link" href="../dashboard/"><svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg><span>Início</span></a>
        <a class="nav-link" href="../analise/"><svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/></svg><span>Análises</span></a>
        <div class="section-title">Gerenciamento</div>
        <a class="nav-link" href="#" onclick="toggleManagement(event, 'products-submenu')"><svg viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z"/></svg><span>Produtos</span><span class="nav-arrow">⌄</span></a>
        <div class="submenu" id="products-submenu"><a class="submenu-link" href="../produtos/"><span class="dot"></span>Lista de Produtos</a><a class="submenu-link" href="../adicionar-produto/"><span class="dot"></span>Adicionar Produto</a><a class="submenu-link" href="../categorias/"><span class="dot"></span>Categorias</a><a class="submenu-link" href="../etiqueta-gondola/"><span class="dot"></span>Etiqueta de Gôndola</a><a class="submenu-link" href="../estoque/"><span class="dot"></span>Controle de Estoque</a></div>
        <a class="nav-link" href="#" onclick="toggleManagement(event, 'sales-submenu')"><svg viewBox="0 0 24 24"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1z"/></svg><span>Vendas</span><span class="nav-arrow">⌄</span></a>
        <div class="submenu" id="sales-submenu"><a class="submenu-link" href="../pdv/"><span class="dot"></span>PDV (Caixa)</a><a class="submenu-link" href="../vendas/"><span class="dot"></span>Histórico de Vendas</a><a class="submenu-link" href="../relatorios/"><span class="dot"></span>Relatórios</a></div>
        <a class="nav-link" href="#" onclick="toggleManagement(event, 'finance-submenu')"><svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg><span>Financeiro</span><span class="nav-arrow">⌄</span></a>
        <div class="submenu" id="finance-submenu"><a class="submenu-link" href="../caixa/"><span class="dot"></span>Controle de Caixa</a><a class="submenu-link" href="../contas/"><span class="dot"></span>Contas a Pagar/Receber</a><a class="submenu-link" href="../fluxo-caixa/"><span class="dot"></span>Fluxo de Caixa</a></div>
        <a class="nav-link active expanded" href="#" onclick="toggleManagement(event, 'clients-submenu')"><svg viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg><span>Clientes</span><span class="nav-arrow">⌃</span></a>
        <div class="submenu open" id="clients-submenu"><a class="submenu-link active" href="../clientes/"><span class="dot"></span>Lista de Clientes</a><a class="submenu-link" href="../adicionar-cliente/"><span class="dot"></span>Cadastrar Cliente</a></div>
        <a class="nav-link" href="#" onclick="toggleManagement(event, 'suppliers-submenu')"><svg viewBox="0 0 24 24"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/></svg><span>Fornecedores</span><span class="nav-arrow">⌄</span></a>
        <div class="submenu" id="suppliers-submenu"><a class="submenu-link" href="../fornecedores/"><span class="dot"></span>Lista de Fornecedores</a><a class="submenu-link" href="../pedidos-compra/"><span class="dot"></span>Pedidos de Compra</a></div>
        <div class="section-title">Sistema</div><a class="nav-link" href="#"><svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.37 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg><span>Configurações</span></a><a class="nav-link" href="#"><svg viewBox="0 0 24 24"><path d="M11 7h2v2h-2zm0 4h2v6h-2zm1-9C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg><span>Ajuda</span></a>`;

      document.querySelectorAll(".sidebar .nav-arrow").forEach((arrow) => {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        svg.setAttribute("class", "nav-arrow");
        svg.setAttribute("viewBox", "0 0 24 24");
        svg.innerHTML = '<path d="M7 10l5 5 5-5z"/>';
        arrow.replaceWith(svg);
      });

      function toggleManagement(event, submenuId) {
        event.preventDefault();
        const link = event.currentTarget;
        const submenu = document.getElementById(submenuId);
        const isOpen = submenu.classList.toggle("open");
        link.classList.toggle("expanded", isOpen);
      }

      function toggleCustomerSubmenu(event) {
        event.preventDefault();
        const link = event.currentTarget;
        const submenu = document.getElementById("clients-submenu");
        const isOpen = submenu.classList.toggle("open");
        link.classList.toggle("expanded", isOpen);
      }

      document
        .getElementById("menu")
        .addEventListener("click", () =>
          document.getElementById("sidebar").classList.toggle("open"),
        );
      const customerLinks = [
        ...document.querySelectorAll(".sidebar .nav-link"),
      ].filter((link) => link.textContent.trim().startsWith("Clientes"));
      customerLinks.slice(0, -1).forEach((link) => link.remove());

      ["Produtos", "Vendas", "Financeiro", "Clientes", "Fornecedores"].forEach(
        (label) => {
          const link = [
            ...document.querySelectorAll(".sidebar .nav-link"),
          ].find((item) => item.textContent.trim().startsWith(label));
          if (link && !link.querySelector(".nav-arrow")) {
            const arrow = document.createElement("span");
            arrow.className = "nav-arrow";
            arrow.textContent = "⌄";
            link.appendChild(arrow);
          }
        },
      );
    