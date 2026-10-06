


      const labels = document.getElementById("labels");
      const product = document.getElementById("product");
      const price = document.getElementById("price");
      const code = document.getElementById("code");
      const quantity = document.getElementById("quantity");
      const offer = document.getElementById("offer");
      const labelCount = document.getElementById("labelCount");

      function toggleSubmenu(event, submenuId) {
        event.preventDefault();
        const link = event.currentTarget;
        const submenu = document.getElementById(submenuId);
        submenu.classList.toggle("open");
        link.classList.toggle("expanded");
      }

      function normalizeEan13(value) {
        const digits = value.replace(/\D/g, "").slice(0, 13);
        const base = digits.length >= 12 ? digits.slice(0, 12) : "789000000001";
        let sum = 0;
        for (let index = 0; index < base.length; index += 1) {
          sum += Number(base[index]) * (index % 2 === 0 ? 1 : 3);
        }
        return `${base}${(10 - (sum % 10)) % 10}`;
      }

      function renderLabels() {
        const total = Math.max(1, Math.min(30, Number(quantity.value) || 1));
        const title = product.value.trim() || "Produto sem nome";
        const value = price.value.trim() || "0,00";
        const barcodeValue = normalizeEan13(code.value);
        labels.innerHTML = Array.from(
          { length: total },
          () => `
                <article class="label">
                    <div class="label-brand">Mercado SuperMarket</div>
                    <div class="label-name">${title}</div>
                    <div class="price">R$ ${value}</div>
                    <div class="code"><svg class="barcode" data-code="${barcodeValue}"></svg><span>CÓD. ${barcodeValue}</span></div>
                </article>`,
        ).join("");
        if (typeof JsBarcode === "function") {
          labels.querySelectorAll(".barcode").forEach((barcode) => {
            try {
              JsBarcode(barcode, barcode.dataset.code, {
                format: "ean13",
                width: 1.1,
                height: 38,
                displayValue: false,
                margin: 0,
                background: "#f4d900",
              });
            } catch (error) {
              barcode.replaceWith(document.createTextNode("CÓDIGO"));
            }
          });
        }
        labelCount.textContent = `${total} etiqueta${total === 1 ? "" : "s"}`;
      }

      document
        .getElementById("generate")
        .addEventListener("click", renderLabels);
      document.getElementById("print").addEventListener("click", () => {
        renderLabels();
        window.print();
      });
      document.getElementById("menuButton").addEventListener("click", () => {
        const sidebar = document.getElementById("sidebar");
        const main = document.querySelector(".main");
        if (window.innerWidth <= 850) {
          sidebar.classList.toggle("open");
        } else {
          sidebar.classList.toggle("collapsed");
          main.classList.toggle("expanded");
        }
      });
      renderLabels();
    