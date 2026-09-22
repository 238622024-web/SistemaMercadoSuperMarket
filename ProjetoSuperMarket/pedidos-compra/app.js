
    function toggleSubmenu(e, id) {
      e.preventDefault();
      e.currentTarget.classList.toggle("expanded");
      document.getElementById(id).classList.toggle("open");
    }
    function toggleSidebar() {
      const s = document.getElementById("sidebar"),
        m = document.getElementById("main"),
        o = document.getElementById("overlay");
      if (innerWidth <= 768) {
        s.classList.toggle("mobile-visible");
        o.classList.toggle("active");
      } else {
        s.classList.toggle("collapsed");
        m.classList.toggle("expanded");
      }
    }
    document.getElementById("overlay").addEventListener("click", toggleSidebar);
    function filterOrders() {
      const term = document.getElementById("search").value.toLowerCase(),
        status = document.getElementById("status").value.toLowerCase();
      let visible = 0;
      document.querySelectorAll("#orderTable tr").forEach((row) => {
        const match =
          (!term || row.innerText.toLowerCase().includes(term)) &&
          (!status ||
            row.querySelector(".status").innerText.toLowerCase() === status);
        row.style.display = match ? "" : "none";
        if (match) visible++;
      });
      document.getElementById("empty").style.display = visible
        ? "none"
        : "block";
      document.getElementById("orderCount").innerText = visible;
    }
    function showOrder(id) {
      alert("Detalhes do pedido " + id);
    }
  