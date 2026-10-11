import pageCss from '../../ProjetoSuperMarket/estoque/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function estoqueScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app-container">
        
        <Sidebar />

        
        <div className="sidebar-overlay" id="sidebarOverlay"></div>

        
        <main className="main-content" id="mainContent">
            <div className="page-container">
                
                <div className="page-header">
            <div className="header-left">
                <button className="menu-toggle" id="menuToggle" data-legacy-action="toggleSidebar()">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
                    </svg>
                </button>
                <div>
                    <div className="breadcrumb">
                        <a href="/dashboard">Dashboard</a>
                        <span>›</span>
                        <span>Produtos</span>
                        <span>›</span>
                        <span>Controle de Estoque</span>
                    </div>
                    <h1>📦 Controle de Estoque</h1>
                </div>
            </div>
            <div className="header-actions">
                <button className="btn btn-secondary" data-legacy-action="window.print()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"></path>
                    </svg>
                    Imprimir
                </button>
                <button className="btn btn-primary" data-legacy-action="openModal('adjustModal')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                    </svg>
                    Ajustar Estoque
                </button>
            </div>
        </div>

        
        <div className="summary-cards">
            <div className="summary-card total">
                <h3>Total de Produtos</h3>
                <div className="summary-value" id="totalProducts">0</div>
                <div className="summary-label">itens cadastrados</div>
            </div>
            <div className="summary-card low">
                <h3>Estoque Baixo</h3>
                <div className="summary-value" id="lowStock">0</div>
                <div className="summary-label">
                    <span>⚠️</span> requer atenção
                </div>
            </div>
            <div className="summary-card critical">
                <h3>Estoque Crítico</h3>
                <div className="summary-value" id="criticalStock">0</div>
                <div className="summary-label">
                    <span>🚨</span> repor urgente
                </div>
            </div>
            <div className="summary-card expiring">
                <h3>Próximo ao Vencimento</h3>
                <div className="summary-value" id="expiringStock">0</div>
                <div className="summary-label">
                    <span>📅</span> vence em 30 dias
                </div>
            </div>
        </div>

        
        

        
        <div className="filters-section">
            <div className="filters-grid">
                <div className="filter-group">
                    <label>Buscar Produto</label>
                    <input type="text" className="filter-input" id="searchInput" placeholder="Nome ou código..." />
                </div>
                <div className="filter-group">
                    <label>Categoria</label>
                    <select className="filter-select" id="categoryFilter">
                        <option value="">Todas as categorias</option>
                        <option value="alimentos">Alimentos</option>
                        <option value="bebidas">Bebidas</option>
                        <option value="limpeza">Limpeza</option>
                        <option value="higiene">Higiene</option>
                        <option value="laticínios">Laticínios</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Status do Estoque</label>
                    <select className="filter-select" id="statusFilter">
                        <option value="">Todos os status</option>
                        <option value="ok">Estoque OK</option>
                        <option value="low">Estoque Baixo</option>
                        <option value="critical">Estoque Crítico</option>
                        <option value="out">Sem Estoque</option>
                    </select>
                </div>
                <div className="filter-group">
                    <button className="btn btn-secondary" style={{width: "100%"}} data-legacy-action="clearFilters()">
                        Limpar Filtros
                    </button>
                </div>
            </div>
        </div>

        
        <div className="stock-table-section">
            <div className="table-header">
                <h2>Produtos em Estoque</h2>
                <div className="table-actions">
                    <button className="icon-btn" title="Exportar Excel" data-legacy-action="alert('Exportar para Excel - Em desenvolvimento')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"></path>
                        </svg>
                    </button>
                    <button className="icon-btn" title="Atualizar" data-legacy-action="location.reload()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="stock-table">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Categoria</th>
                            <th>Estoque Atual</th>
                            <th>Estoque Mínimo</th>
                            <th>Estoque Máximo</th>
                            <th>Status</th>
                            <th>Validade</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody id="stockTableBody">
                        <tr>
                            <td colSpan="8" style={{ textAlign: 'center', padding: '80px 20px' }}>
                                <p style={{ fontSize: '18px', fontWeight: 600, color: '#64748b', marginBottom: '8px' }}>📦 Nenhum produto em estoque</p>
                                <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>Cadastre produtos no sistema para gerenciar o estoque</p>
                                <a href="/adicionar-produto" style={{ display: 'inline-block', padding: '12px 24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>➕ Cadastrar Produtos</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
                </div>
            </div>
        </main>
    </div>

    
    <div className="modal" id="adjustModal">
        <div className="modal-content">
            <div className="modal-header">
                <h2>Ajustar Estoque</h2>
                <button className="close-modal" data-legacy-action="closeModal('adjustModal')">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                    </svg>
                </button>
            </div>

            <form>
                <div className="form-group">
                    <label>Selecionar Produto</label>
                    <select className="form-input" id="adjustProduct" required>
                        <option value="">Nenhum produto cadastrado</option>
                        
                    </select>
                </div>

                <div className="form-group">
                    <label>Tipo de Ajuste</label>
                    <select className="form-input" id="adjustType" required>
                        <option value="add">Entrada (Adicionar)</option>
                        <option value="remove">Saída (Remover)</option>
                        <option value="set">Ajuste Manual (Definir)</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Quantidade</label>
                    <input type="number" className="form-input" id="adjustQuantity" min="1" required />
                </div>

                <div className="form-group">
                    <label>Motivo do Ajuste</label>
                    <select className="form-input" id="adjustReason" required>
                        <option value="">Selecione...</option>
                        <option value="compra">Compra de Fornecedor</option>
                        <option value="devolucao">Devolução de Cliente</option>
                        <option value="perda">Perda/Quebra</option>
                        <option value="vencimento">Produto Vencido</option>
                        <option value="inventario">Inventário/Contagem</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Observações (opcional)</label>
                    <input type="text" className="form-input" id="adjustNotes" placeholder="Detalhes adicionais..." />
                </div>

                <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" data-legacy-action="closeModal('adjustModal')">
                        Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                        Confirmar Ajuste
                    </button>
                </div>
            </form>
        </div>
    </div>

    
    
    
    


</div></>;
}
