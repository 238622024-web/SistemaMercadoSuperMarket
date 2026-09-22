


      // Toggle do menu sidebar
      const menuToggle = document.getElementById("menuToggle");
      const sidebar = document.getElementById("sidebar");
      const mainContent = document.getElementById("mainContent");
      const sidebarOverlay = document.getElementById("sidebarOverlay");

      menuToggle.addEventListener("click", () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.toggle("mobile-visible");
          sidebarOverlay.classList.toggle("active");
        } else {
          sidebar.classList.toggle("collapsed");
          mainContent.classList.toggle("expanded");
        }
      });

      sidebarOverlay.addEventListener("click", () => {
        sidebar.classList.remove("mobile-visible");
        sidebarOverlay.classList.remove("active");
      });

      // Toggle do submenu
      function toggleSubmenu(event, submenuId) {
        event.preventDefault();
        const submenu = document.getElementById(submenuId);
        const navLink = event.currentTarget;

        submenu.classList.toggle("open");
        navLink.classList.toggle("expanded");
      }

      // Busca de produtos
      const searchInput = document.getElementById("searchInput");
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll("#productsTableBody tr");

        rows.forEach((row) => {
          const productName = row
            .querySelector(".product-details h4")
            .textContent.toLowerCase();
          const productCode = row
            .querySelectorAll("td")[2]
            .textContent.toLowerCase();
          const productCategory = row
            .querySelectorAll("td")[3]
            .textContent.toLowerCase();

          if (
            productName.includes(searchTerm) ||
            productCode.includes(searchTerm) ||
            productCategory.includes(searchTerm)
          ) {
            row.style.display = "";
          } else {
            row.style.display = "none";
          }
        });
      });

      // Selecionar todos os checkboxes
      const selectAll = document.getElementById("selectAll");
      const rowCheckboxes = document.querySelectorAll(".row-checkbox");

      selectAll.addEventListener("change", (e) => {
        rowCheckboxes.forEach((checkbox) => {
          checkbox.checked = e.target.checked;
        });
      });

      rowCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", () => {
          const allChecked = Array.from(rowCheckboxes).every(
            (cb) => cb.checked,
          );
          selectAll.checked = allChecked;
        });
      });

      // Confirmar exclusão
      function confirmDelete(productName) {
        if (
          confirm(`Tem certeza que deseja excluir o produto "${productName}"?`)
        ) {
          alert(`Produto "${productName}" excluído com sucesso!`);
          // Aqui você adicionaria a lógica real de exclusão
        }
      }

      // Responsividade
      window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
          sidebar.classList.remove("mobile-visible");
          sidebarOverlay.classList.remove("active");
        }
      });
    