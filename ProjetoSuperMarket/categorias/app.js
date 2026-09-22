


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
    