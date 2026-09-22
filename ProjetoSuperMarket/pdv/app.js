
        function toggleSidebar() {
          const sidebar = document.getElementById("sidebar");
          const overlay = document.getElementById("sidebarOverlay");

          if (window.innerWidth <= 768) {
            sidebar.classList.toggle("mobile-visible");
            if (overlay) {
              overlay.classList.toggle(
                "active",
                sidebar.classList.contains("mobile-visible"),
              );
            }
          } else {
            sidebar.classList.toggle("collapsed");
            if (sidebar.classList.contains("collapsed")) {
              document
                .querySelectorAll(".submenu")
                .forEach((submenu) => submenu.classList.remove("open"));
              document
                .querySelectorAll(".nav-link.expanded")
                .forEach((link) => link.classList.remove("expanded"));
            }
          }
        }

        window.addEventListener("resize", () => {
          const sidebar = document.getElementById("sidebar");
          const overlay = document.getElementById("sidebarOverlay");

          if (window.innerWidth > 768) {
            sidebar.classList.remove("mobile-visible");
            if (overlay) overlay.classList.remove("active");
          } else {
            sidebar.classList.remove("collapsed");
            if (overlay) overlay.classList.remove("active");
          }
        });

        const sidebarOverlay = document.getElementById("sidebarOverlay");
        if (sidebarOverlay) {
          sidebarOverlay.addEventListener("click", () => {
            const sidebar = document.getElementById("sidebar");
            sidebar.classList.remove("mobile-visible");
            sidebarOverlay.classList.remove("active");
          });
        }

        // ========================================
        // PRODUTOS - Conecte aqui com seu backend
        // ========================================
        // Estrutura esperada para cada produto:
        // {
        //   id: number,           // ID único do produto
        //   name: string,         // Nome do produto
        //   price: number,        // Preço unitário
        //   stock: number,        // Quantidade em estoque
        //   barcode: string,      // Código de barras
        //   category: string,     // Categoria (alimentos, bebidas, limpeza, higiene, massas, oleos)
        //   emoji: string         // Emoji para representação visual (opcional)
        // }

        let products = [];

        // TODO: Substituir por chamada à API do backend
        // Exemplo de como buscar produtos:
        // async function loadProducts() {
        //     try {
        //         const response = await fetch('/api/products');
        //         products = await response.json();
        //         renderProducts();
        //     } catch (error) {
        //         console.error('Erro ao carregar produtos:', error);
        //         showToast('❌ Erro ao carregar produtos', 'error');
        //     }
        // }

        let cart = [];
        let selectedPayment = "money";
        let selectedCategory = "all";
        let sessionStartTime = Date.now();

        // Atualizar tempo de sessão
        setInterval(() => {
          const elapsed = Math.floor((Date.now() - sessionStartTime) / 1000);
          const hours = Math.floor(elapsed / 3600)
            .toString()
            .padStart(2, "0");
          const minutes = Math.floor((elapsed % 3600) / 60)
            .toString()
            .padStart(2, "0");
          const seconds = (elapsed % 60).toString().padStart(2, "0");
          document.getElementById("sessionTime").textContent =
            `${hours}:${minutes}:${seconds}`;
        }, 1000);

        // Renderizar produtos
        function renderProducts(filter = "", category = "all") {
          const grid = document.getElementById("productsGrid");
          let filtered = products;

          // Filtrar por categoria
          if (category !== "all") {
            filtered = filtered.filter((p) => p.category === category);
          }

          // Filtrar por busca
          if (filter) {
            filtered = filtered.filter(
              (p) =>
                p.name.toLowerCase().includes(filter.toLowerCase()) ||
                p.barcode.includes(filter),
            );
          }

          if (filtered.length === 0) {
            grid.innerHTML =
              '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #94a3b8;"><p style="font-size: 18px; margin-bottom: 8px;">😕 Nenhum produto encontrado</p><small>Tente buscar por outro termo</small></div>';
            return;
          }

          grid.innerHTML = filtered
            .map((product) => {
              const isLowStock = product.stock <= 10;
              return `
                    <div class="product-card ${isLowStock ? "low-stock" : ""}" onclick="addToCart(${product.id})">
                        ${isLowStock ? '<span class="low-stock-badge">⚠ Baixo</span>' : ""}
                        <div class="product-image">${product.emoji}</div>
                        <div class="product-name">${product.name}</div>
                        <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                        <div class="product-stock ${isLowStock ? "low" : ""}">
                            ${isLowStock ? "⚠️ " : "📦 "} ${product.stock} ${product.stock === 1 ? "unidade" : "unidades"}
                        </div>
                    </div>
                `;
            })
            .join("");
        }

        // Adicionar ao carrinho
        function addToCart(productId) {
          const product = products.find((p) => p.id === productId);
          if (!product) return;

          const existingItem = cart.find((item) => item.id === productId);

          if (existingItem) {
            if (existingItem.quantity < product.stock) {
              existingItem.quantity++;
              showToast(`+1 ${product.name}`, "success");
            } else {
              showToast("❌ Estoque insuficiente!", "error");
              return;
            }
          } else {
            cart.push({
              ...product,
              quantity: 1,
            });
            showToast(`✅ ${product.name} adicionado!`, "success");
          }

          updateCart();
        }

        // Atualizar carrinho
        function updateCart() {
          const cartItems = document.getElementById("cartItems");
          const itemsCount = document.getElementById("itemsCount");
          const finalizeBtn = document.getElementById("finalizeBtn");

          if (cart.length === 0) {
            cartItems.innerHTML = `
                    <div class="empty-cart">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
                        </svg>
                        <p>Carrinho vazio</p>
                        <small>Clique nos produtos para adicionar ao carrinho</small>
                    </div>
                `;
            finalizeBtn.disabled = true;
          } else {
            cartItems.innerHTML = cart
              .map(
                (item) => `
                    <div class="cart-item">
                        <div class="item-image">${item.emoji}</div>
                        <div class="item-details">
                            <div class="item-name">${item.name}</div>
                            <div class="item-price">R$ ${item.price.toFixed(2)} cada</div>
                        </div>
                        <div class="item-controls">
                            <div class="quantity-control">
                                <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
                                <span class="qty-value">${item.quantity}</span>
                                <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                            </div>
                            <div class="item-total">R$ ${(item.price * item.quantity).toFixed(2)}</div>
                            <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remover item">
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                `,
              )
              .join("");
            finalizeBtn.disabled = false;
          }

          const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
          itemsCount.textContent = `${totalItems} ${totalItems === 1 ? "item" : "itens"}`;

          updateSummary();
        }

        // Mudar quantidade
        function changeQuantity(productId, delta) {
          const item = cart.find((i) => i.id === productId);
          if (!item) return;

          const product = products.find((p) => p.id === productId);
          const newQuantity = item.quantity + delta;

          if (newQuantity <= 0) {
            removeFromCart(productId);
          } else if (newQuantity <= product.stock) {
            item.quantity = newQuantity;
            updateCart();
          } else {
            showToast("❌ Estoque insuficiente!", "error");
          }
        }

        // Remover do carrinho
        function removeFromCart(productId) {
          const item = cart.find((i) => i.id === productId);
          if (!item) return;

          showToast(`🗑️ ${item.name} removido`, "error");
          cart = cart.filter((i) => i.id !== productId);
          updateCart();
        }

        // Limpar carrinho
        function clearCart() {
          if (cart.length === 0) return;
          if (confirm("🗑️ Deseja realmente limpar todo o carrinho?")) {
            cart = [];
            updateCart();
            showToast("🗑️ Carrinho limpo!", "success");
          }
        }

        // Atualizar resumo
        function updateSummary() {
          const subtotal = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0,
          );
          const discount = 0;
          const total = subtotal - discount;

          document.getElementById("subtotal").textContent =
            `R$ ${subtotal.toFixed(2)}`;
          document.getElementById("discount").textContent =
            `R$ ${discount.toFixed(2)}`;
          document.getElementById("total").textContent =
            `R$ ${total.toFixed(2)}`;
        }

        // Selecionar pagamento
        document.querySelectorAll(".payment-btn").forEach((btn) => {
          btn.addEventListener("click", function () {
            document
              .querySelectorAll(".payment-btn")
              .forEach((b) => b.classList.remove("selected"));
            this.classList.add("selected");
            selectedPayment = this.dataset.method;
          });
        });

        // Filtrar por categoria
        document.querySelectorAll(".category-chip").forEach((chip) => {
          chip.addEventListener("click", function () {
            document
              .querySelectorAll(".category-chip")
              .forEach((c) => c.classList.remove("active"));
            this.classList.add("active");
            selectedCategory = this.dataset.category;
            const searchTerm = document.getElementById("searchInput").value;
            renderProducts(searchTerm, selectedCategory);
          });
        });

        // Finalizar venda
        document
          .getElementById("finalizeBtn")
          .addEventListener("click", function () {
            if (cart.length === 0) return;

            const total = cart.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0,
            );
            const paymentNames = {
              money: "Dinheiro",
              debit: "Cartão de Débito",
              credit: "Cartão de Crédito",
              pix: "PIX",
            };

            const itemsList = cart
              .map(
                (item) =>
                  `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`,
              )
              .join("\n");

            if (
              confirm(
                `🛒 CONFIRMAR VENDA\n\n${itemsList}\n\n💰 Total: R$ ${total.toFixed(2)}\n💳 Pagamento: ${paymentNames[selectedPayment]}\n\nConfirmar esta venda?`,
              )
            ) {
              const saleId =
                "VD-" +
                Math.floor(Math.random() * 100000)
                  .toString()
                  .padStart(5, "0");

              alert(
                `✅ VENDA FINALIZADA COM SUCESSO!\n\n🎫 ID da Venda: ${saleId}\n💰 Valor: R$ ${total.toFixed(2)}\n💳 Pagamento: ${paymentNames[selectedPayment]}\n⏰ ${new Date().toLocaleString("pt-BR")}\n\nObrigado pela preferência!`,
              );

              showToast("✅ Venda finalizada com sucesso!", "success");
              cart = [];
              updateCart();
            }
          });

        // Busca de produtos
        document
          .getElementById("searchInput")
          .addEventListener("input", function (e) {
            renderProducts(e.target.value, selectedCategory);
          });

        // Atalhos de teclado
        document.addEventListener("keydown", function (e) {
          // F2 - Finalizar venda
          if (e.key === "F2" && cart.length > 0) {
            e.preventDefault();
            document.getElementById("finalizeBtn").click();
          }
          // F4 - Limpar carrinho
          if (e.key === "F4") {
            e.preventDefault();
            clearCart();
          }
          // ESC - Focar na busca
          if (e.key === "Escape") {
            document.getElementById("searchInput").focus();
          }
        });

        // Toast de notificação
        function showToast(message, type = "success") {
          const toast = document.getElementById("toast");
          const toastMessage = document.getElementById("toastMessage");

          toast.className = `toast ${type}`;
          toastMessage.textContent = message;

          toast.classList.add("show");

          setTimeout(() => {
            toast.classList.remove("show");
          }, 3000);
        }

        // Inicializar
        renderProducts();

        // Log de boas-vindas
        console.log(
          "%c🛒 PDV Mercado Pro",
          "font-size: 20px; font-weight: bold; color: #667eea;",
        );
        console.log("%cAtalhos de teclado:", "font-weight: bold;");
        console.log("• F2: Finalizar venda");
        console.log("• F4: Limpar carrinho");
        console.log("• ESC: Focar na busca");
      

