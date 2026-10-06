
      function toggleSubmenu(event, id) {
        event.preventDefault();
        const link = event.currentTarget;
        const menu = document.getElementById(id);
        link.classList.toggle("expanded");
        menu.classList.toggle("open");
      }
      function toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        const main = document.getElementById("main");
        if (window.innerWidth <= 768) {
          sidebar.classList.toggle("mobile-visible");
          document.getElementById("overlay").classList.toggle("active");
        } else {
          sidebar.classList.toggle("collapsed");
          main.classList.toggle("expanded");
        }
      }
      document
        .getElementById("overlay")
        .addEventListener("click", toggleSidebar);
      function filterSales() {
        const term = document.getElementById("search").value.toLowerCase();
        const payment = document.getElementById("payment").value.toLowerCase();
        let visible = 0;
        document.querySelectorAll("#salesTable tr").forEach((row) => {
          const match =
            (!term || row.innerText.toLowerCase().includes(term)) &&
            (!payment ||
              row.querySelector(".payment").innerText.toLowerCase() ===
                payment);
          row.style.display = match ? "" : "none";
          if (match) visible++;
        });
        document.getElementById("empty").style.display = visible
          ? "none"
          : "block";
        document.getElementById("salesCount").innerText = visible;
      }
      function showSale(id) {
        alert("Detalhes da venda " + id + " serão exibidos aqui.");
      }
    