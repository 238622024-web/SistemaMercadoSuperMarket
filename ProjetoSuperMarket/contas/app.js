
      function menuToggle(e, id) {
        e.preventDefault();
        e.currentTarget.classList.toggle("expanded");
        document.getElementById(id).classList.toggle("open");
      }
      function toggleSidebar() {
        const s = document.getElementById("sidebar"),
          m = document.getElementById("main"),
          o = document.getElementById("overlay");
        if (innerWidth <= 768) {
          s.classList.toggle("mobile");
          o.classList.toggle("active");
        } else {
          s.classList.toggle("collapsed");
          m.classList.toggle("expanded");
        }
      }
      document
        .getElementById("overlay")
        .addEventListener("click", toggleSidebar);
      function filterAccounts() {
        const term = document.getElementById("search").value.toLowerCase();
        document
          .querySelectorAll("#accountTable tr")
          .forEach(
            (row) =>
              (row.style.display =
                !term || row.innerText.toLowerCase().includes(term)
                  ? ""
                  : "none"),
          );
      }
      function setTab(button, type) {
        document
          .querySelectorAll(".tab")
          .forEach((tab) => tab.classList.remove("active"));
        button.classList.add("active");
        document
          .querySelectorAll("#accountTable tr")
          .forEach(
            (row) =>
              (row.style.display =
                type === "all" || row.dataset.type === type ? "" : "none"),
          );
      }
      function showAccount(name) {
        alert("Detalhes da conta: " + name);
      }
    