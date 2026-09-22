
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
    