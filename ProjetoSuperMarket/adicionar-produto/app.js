


      // Toggle Sidebar
      function toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        const mainContent = document.getElementById("mainContent");

        if (window.innerWidth <= 768) {
          sidebar.classList.toggle("mobile-visible");
        } else {
          sidebar.classList.toggle("collapsed");
          mainContent.classList.toggle("expanded");
        }
      }

      // Toggle Submenu
      function toggleSubmenu(event, submenuId) {
        event.preventDefault();
        const link = event.currentTarget;
        const submenu = document.getElementById(submenuId);

        link.classList.toggle("expanded");
        submenu.classList.toggle("open");
      }

      // Upload de Imagem
      const imageUpload = document.getElementById("imageUpload");
      const imagePreview = document.getElementById("imagePreview");
      let uploadedImages = [];

      // Drag and drop
      imageUpload.addEventListener("dragover", (e) => {
        e.preventDefault();
        imageUpload.classList.add("dragover");
      });

      imageUpload.addEventListener("dragleave", () => {
        imageUpload.classList.remove("dragover");
      });

      imageUpload.addEventListener("drop", (e) => {
        e.preventDefault();
        imageUpload.classList.remove("dragover");

        const files = e.dataTransfer.files;
        handleFiles(files);
      });

      function handleImageUpload(event) {
        const files = event.target.files;
        handleFiles(files);
      }

      function handleFiles(files) {
        Array.from(files).forEach((file) => {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.onload = (e) => {
              uploadedImages.push(e.target.result);
              displayImages();
            };

            reader.readAsDataURL(file);
          }
        });
      }

      function displayImages() {
        imagePreview.innerHTML = "";
        imagePreview.classList.add("active");

        uploadedImages.forEach((src, index) => {
          const previewItem = document.createElement("div");
          previewItem.className = "preview-item";

          const img = document.createElement("img");
          img.src = src;

          const removeBtn = document.createElement("button");
          removeBtn.className = "preview-remove";
          removeBtn.innerHTML = "×";
          removeBtn.onclick = (e) => {
            e.stopPropagation();
            removeImage(index);
          };

          previewItem.appendChild(img);
          previewItem.appendChild(removeBtn);
          imagePreview.appendChild(previewItem);
        });
      }

      function removeImage(index) {
        uploadedImages.splice(index, 1);
        if (uploadedImages.length > 0) {
          displayImages();
        } else {
          imagePreview.classList.remove("active");
          document.getElementById("productImage").value = "";
        }
      }

      // Submissão do Formulário
      document
        .getElementById("productForm")
        .addEventListener("submit", function (e) {
          e.preventDefault();

          // Coletar dados do formulário
          const formData = {
            name: document.getElementById("productName").value,
            code: document.getElementById("productCode").value,
            category: document.getElementById("productCategory").value,
            brand: document.getElementById("productBrand").value,
            description: document.getElementById("productDescription").value,
            cost: document.getElementById("productCost").value,
            price: document.getElementById("productPrice").value,
            stock: document.getElementById("productStock").value,
            minStock: document.getElementById("productMinStock").value,
            unit: document.getElementById("productUnit").value,
            barcode: document.getElementById("productBarcode").value,
            supplier: document.getElementById("productSupplier").value,
            validity: document.getElementById("productValidity").value,
            weight: document.getElementById("productWeight").value,
            location: document.getElementById("productLocation").value,
            images: uploadedImages,
          };

          // Aqui você pode enviar os dados para um servidor
          console.log("Produto a ser salvo:", formData);

          // Salvar no localStorage (simulação)
          let products = JSON.parse(localStorage.getItem("products") || "[]");
          formData.id = Date.now();
          formData.createdAt = new Date().toISOString();
          products.push(formData);
          localStorage.setItem("products", JSON.stringify(products));

          // Mostrar notificação de sucesso
          showNotification("Produto adicionado com sucesso!", "success");

          // Limpar formulário
          setTimeout(() => {
            this.reset();
            uploadedImages = [];
            imagePreview.classList.remove("active");
            imagePreview.innerHTML = "";

            // Opcional: redirecionar para lista de produtos
            // window.location.href = '../produtos/';
          }, 1500);
        });

      // Mostrar Notificação
      function showNotification(message, type = "success") {
        const notification = document.getElementById("notification");
        const notificationText = document.getElementById("notificationText");

        notificationText.textContent = message;
        notification.className = `notification ${type} show`;

        setTimeout(() => {
          notification.classList.remove("show");
        }, 3000);
      }

      // Calcular margem de lucro automaticamente
      document
        .getElementById("productCost")
        .addEventListener("input", calculateProfit);
      document
        .getElementById("productPrice")
        .addEventListener("input", calculateProfit);

      function calculateProfit() {
        const cost =
          parseFloat(document.getElementById("productCost").value) || 0;
        const price =
          parseFloat(document.getElementById("productPrice").value) || 0;

        if (cost > 0 && price > 0) {
          const profit = (((price - cost) / cost) * 100).toFixed(2);
          console.log(`Margem de lucro: ${profit}%`);
        }
      }
    