
        // ========================================
        // DADOS DE ESTOQUE - Conecte aqui com seu backend
        // ========================================
        // Estrutura esperada para cada item de estoque:
        // {
        //   id: number,           // ID único do produto
        //   name: string,         // Nome do produto
        //   code: string,         // Código de barras
        //   category: string,     // Categoria
        //   current: number,      // Estoque atual
        //   min: number,          // Estoque mínimo
        //   max: number,          // Estoque máximo
        //   expiry: string        // Data de validade (formato: YYYY-MM-DD)
        // }
        
        let stockData = [];
        
        // TODO: Substituir por chamada à API do backend
        // async function loadStockData() {
        //     try {
        //         const response = await fetch('/api/stock');
        //         stockData = await response.json();
        //         renderTable();
        //     } catch (error) {
        //         console.error('Erro ao carregar dados de estoque:', error);
        //     }
        // }

        // Determinar status do estoque
        function getStockStatus(current, min) {
            if (current === 0) return 'out';
            if (current < min * 0.3) return 'critical';
            if (current < min) return 'low';
            return 'ok';
        }

        // Formatar data
        function formatDate(dateStr) {
            const date = new Date(dateStr);
            const now = new Date();
            const diffTime = date - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) return '<span style="color: #ef4444;">Vencido</span>';
            if (diffDays <= 30) return `<span style="color: #f59e0b;">${diffDays} dias</span>`;
            return date.toLocaleDateString('pt-BR');
        }

        // Renderizar tabela
        function renderTable(data = stockData) {
            const tbody = document.getElementById('stockTableBody');
            
            if (data.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 80px 20px;">
                            <svg width="100" height="100" viewBox="0 0 24 24" fill="#cbd5e1" style="margin-bottom: 20px; opacity: 0.4;">
                                <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                            </svg>
                            <p style="font-size: 18px; font-weight: 600; color: #64748b; margin-bottom: 8px;">
                                📦 Nenhum produto em estoque
                            </p>
                            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 20px;">
                                Cadastre produtos no sistema para gerenciar o estoque
                            </p>
                            <button onclick="window.location.href='../adicionar-produto/'" style="padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;">
                                ➕ Cadastrar Produtos
                            </button>
                        </td>
                    </tr>
                `;
                updateSummary([]);
                return;
            }
            
            tbody.innerHTML = data.map(item => {
                const status = getStockStatus(item.current, item.min);
                const statusLabels = {
                    ok: 'Estoque OK',
                    low: 'Estoque Baixo',
                    critical: 'Crítico',
                    out: 'Sem Estoque'
                };

                return `
                    <tr>
                        <td>
                            <div class="product-info">
                                <div class="product-image">📦</div>
                                <div class="product-details">
                                    <div class="product-name">${item.name}</div>
                                    <div class="product-code">${item.code}</div>
                                </div>
                            </div>
                        </td>
                        <td>${item.category.charAt(0).toUpperCase() + item.category.slice(1)}</td>
                        <td><span class="quantity-display ${status}">${item.current}</span></td>
                        <td>${item.min}</td>
                        <td>${item.max}</td>
                        <td><span class="stock-badge ${status}">${statusLabels[status]}</span></td>
                        <td>${formatDate(item.expiry)}</td>
                        <td>
                            <div class="actions-cell">
                                <button class="action-icon-btn" title="Ajustar" onclick="quickAdjust(${item.id})">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                                    </svg>
                                </button>
                                <button class="action-icon-btn" title="Histórico" onclick="viewHistory(${item.id})">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');

            // Atualizar resumos
            updateSummary(data);
        }

        // Atualizar cards de resumo
        function updateSummary(data) {
            const total = data.length;
            const low = data.filter(item => getStockStatus(item.current, item.min) === 'low').length;
            const critical = data.filter(item => getStockStatus(item.current, item.min) === 'critical').length;
            const expiring = data.filter(item => {
                const diffDays = Math.ceil((new Date(item.expiry) - new Date()) / (1000 * 60 * 60 * 24));
                return diffDays <= 30 && diffDays > 0;
            }).length;

            document.getElementById('totalProducts').textContent = total;
            document.getElementById('lowStock').textContent = low;
            document.getElementById('criticalStock').textContent = critical;
            document.getElementById('expiringStock').textContent = expiring;
        }

        // Filtros
        document.getElementById('searchInput').addEventListener('input', applyFilters);
        document.getElementById('categoryFilter').addEventListener('change', applyFilters);
        document.getElementById('statusFilter').addEventListener('change', applyFilters);

        function applyFilters() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            const category = document.getElementById('categoryFilter').value;
            const status = document.getElementById('statusFilter').value;

            let filtered = stockData.filter(item => {
                const matchSearch = item.name.toLowerCase().includes(search) || item.code.includes(search);
                const matchCategory = !category || item.category === category;
                const matchStatus = !status || getStockStatus(item.current, item.min) === status;
                return matchSearch && matchCategory && matchStatus;
            });

            renderTable(filtered);
        }

        function clearFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('statusFilter').value = '';
            renderTable();
        }

        // Modal
        function openModal(modalId) {
            document.getElementById(modalId).classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        function quickAdjust(productId) {
            openModal('adjustModal');
            document.getElementById('adjustProduct').value = productId;
        }

        function viewHistory(productId) {
            alert(`Histórico de movimentações do produto ID ${productId}\n\nEsta funcionalidade será implementada em breve!`);
        }

        function submitAdjustment(event) {
            event.preventDefault();
            const product = document.getElementById('adjustProduct').value;
            const type = document.getElementById('adjustType').value;
            const quantity = document.getElementById('adjustQuantity').value;
            const reason = document.getElementById('adjustReason').value;

            alert(`✅ Ajuste realizado com sucesso!\n\nProduto: ${product}\nTipo: ${type}\nQuantidade: ${quantity}\nMotivo: ${reason}`);
            
            closeModal('adjustModal');
            event.target.reset();
        }

        // Inicializar
        renderTable();
    

