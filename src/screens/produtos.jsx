import pageCss from '../../ProjetoSuperMarket/produtos/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function produtosScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app-container">
      
      <Sidebar />

      
      <div className="sidebar-overlay" id="sidebarOverlay"></div>

      
      <main className="main-content" id="mainContent">
        
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" id="menuToggle">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1 className="header-title">Lista de Produtos</h1>
          </div>
          <div className="header-right">
            <button className="header-icon-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"></path>
              </svg>
            </button>
            <button className="header-icon-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
              </svg>
            </button>
          </div>
        </header>

        
        <div className="page-content">
          
          <div className="page-header">
            <div className="page-breadcrumb">
              <span>Gerenciamento</span>
              <span className="breadcrumb-separator">/</span>
              <span>Produtos</span>
              <span className="breadcrumb-separator">/</span>
              <span style={{color: "#667eea"}}>Lista de Produtos</span>
            </div>
            <p className="page-subtitle">
              Gerencie todos os produtos do seu estoque
            </p>
          </div>

          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon blue">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>0</h3>
                  <p>Total de Produtos</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon green">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>0</h3>
                  <p>Produtos Ativos</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon orange">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>0</h3>
                  <p>Estoque Baixo</p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon red">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                  </svg>
                </div>
                <div className="stat-info">
                  <h3>0</h3>
                  <p>Produtos Inativos</p>
                </div>
              </div>
            </div>
          </div>

          
          <div className="content-section">
            
            <div className="section-toolbar">
              <div className="toolbar-left">
                <div className="search-box">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                  </svg>
                  <input type="text" id="searchInput" placeholder="Buscar por nome, código ou categoria..." value={props.search} onChange={props.onSearch} />
                </div>
                <button className="filter-btn" data-legacy-action="alert('Filtros em desenvolvimento')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"></path>
                  </svg>
                  Filtros
                </button>
              </div>
              <div className="toolbar-right">
                <button className="btn-secondary" data-legacy-action="alert('Exportar para Excel')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z"></path>
                  </svg>
                  Exportar
                </button>
                <button className="btn-primary" data-legacy-action="window.location.href = '../adicionar-produto/index.html'">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                  </svg>
                  Novo Produto
                </button>
              </div>
            </div>

            
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th style={{width: "50px"}}>
                      <input type="checkbox" id="selectAll" checked={props.selectAll} onChange={props.onSelectAll} />
                    </th>
                    <th>Produto</th>
                    <th>Código</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th>Status</th>
                    <th style={{width: "120px"}}>Ações</th>
                  </tr>
                </thead>
                <tbody id="productsTableBody">{props.rows}</tbody>
              </table>
            </div>

            
            <div className="pagination">
              <div className="pagination-info">
                Mostrando <strong>0</strong> de <strong>0</strong> produtos
              </div>
              <div className="pagination-controls">
                <button className="page-btn" disabled>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width: "16px", height: "16px"}}>
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
                  </svg>
                </button>
                <button className="page-btn active">1</button>
                <button className="page-btn" disabled>
                  <svg viewBox="0 0 24 24" fill="currentColor" style={{width: "16px", height: "16px"}}>
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <div className="product-modal" id="productDetailsModal" role="dialog" aria-modal="true" aria-labelledby="productDetailsTitle" aria-describedby="productDetailsSubtitle" hidden={props.detailHidden} onClick={(event) => { if (event.target === event.currentTarget) props.onClose(); }}>
      <section className="product-modal-card">
        <header className="product-modal-header">
          <div>
            <h2 id="productDetailsTitle">{props.product?.nome || "Detalhes do produto"}</h2>
            <p id="productDetailsSubtitle">Informações cadastradas</p>
          </div>
          <button type="button" className="product-modal-close" id="closeProductDetails" aria-label="Fechar detalhes do produto" onClick={props.onClose}>
            ×
          </button>
        </header>
        <dl className="product-details-list" id="productDetailsList">{props.details}</dl>
        <div className="product-modal-actions" id="productDetailsActions" hidden={!props.product}>
          <button type="button" className="product-modal-button secondary" id="editProductButton" onClick={props.onEdit}>
            Editar
          </button>
          <button type="button" className="product-modal-button danger" id="deactivateProductButton" onClick={props.onDeactivate}>
            Desativar
          </button>
        </div>
        <form className="product-edit-form" id="productEditForm" key={`${props.product?.id || ""}-${props.editing}`} hidden={!props.editing} onSubmit={props.onSave}>
          <div className="product-edit-grid">
            <label className="product-edit-field">
              Nome do produto
              <input name="nome" type="text" required defaultValue={props.product?.["nome"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Código/SKU
              <input name="codigo" type="text" required defaultValue={props.product?.["codigo"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Categoria
              <select name="categoria" required defaultValue={props.product?.["categoria"] ?? ''}>
                <option value="">Selecione uma categoria</option>
                <option value="alimentos">Alimentos</option>
                <option value="bebidas">Bebidas</option>
                <option value="higiene">Higiene e Limpeza</option>
                <option value="frios">Frios e Laticínios</option>
                <option value="hortifruti">Hortifrúti</option>
                <option value="padaria">Padaria</option>
                <option value="acougue">Açougue</option>
                <option value="outros">Outros</option>
              </select>
            </label>
            <label className="product-edit-field">
              Marca
              <input name="marca" type="text" required defaultValue={props.product?.["marca"] ?? ''} />
            </label>
            <label className="product-edit-field product-edit-field-wide">
              Descrição
              <textarea name="descricao" rows="3"></textarea>
            </label>
            <label className="product-edit-field">
              Preço de custo (R$)
              <input name="preco_custo" type="number" min="0" step="0.01" required defaultValue={props.product?.["preco_custo"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Preço de venda (R$)
              <input name="preco_venda" type="number" min="0" step="0.01" required defaultValue={props.product?.["preco_venda"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Estoque atual
              <input name="estoque_atual" type="number" min="0" step="any" required defaultValue={props.product?.["estoque_atual"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Estoque mínimo
              <input name="estoque_minimo" type="number" min="0" step="any" defaultValue={props.product?.["estoque_minimo"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Unidade
              <select name="unidade" required defaultValue={props.product?.["unidade"] ?? ''}>
                <option value="">Selecione</option>
                <option value="un">Unidade (UN)</option>
                <option value="kg">Quilograma (KG)</option>
                <option value="g">Grama (G)</option>
                <option value="l">Litro (L)</option>
                <option value="ml">Mililitro (ML)</option>
                <option value="cx">Caixa (CX)</option>
                <option value="pc">Pacote (PC)</option>
              </select>
            </label>
            <label className="product-edit-field">
              Código de barras
              <input name="codigo_barras" type="text" defaultValue={props.product?.["codigo_barras"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Fornecedor
              <select name="fornecedor" defaultValue={props.product?.["fornecedor"] ?? ''}>
                <option value="">Selecione um fornecedor</option>
                {props.product?.fornecedor && !props.supplierOptions?.some((supplier) => supplier.nome === props.product.fornecedor) && <option value={props.product.fornecedor}>{props.product.fornecedor}</option>}
                {props.supplierOptions?.map((supplier) => <option key={supplier.id} value={supplier.nome}>{supplier.nome}</option>)}
              </select>
              {props.supplierLoadError && <small className="product-edit-error">{props.supplierLoadError}</small>}
            </label>
            <label className="product-edit-field">
              Data de validade
              <input name="data_validade" type="date" defaultValue={props.product?.["data_validade"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Peso (g)
              <input name="peso_gramas" type="number" min="0" step="any" defaultValue={props.product?.["peso_gramas"] ?? ''} />
            </label>
            <label className="product-edit-field">
              Localização
              <input name="localizacao" type="text" defaultValue={props.product?.["localizacao"] ?? ''} />
            </label>
          </div>
          <p className="product-edit-error" id="productEditError" hidden={!props.error}>{props.error}</p>
          <div className="product-modal-actions">
            <button type="button" className="product-modal-button secondary" id="cancelProductEdit" onClick={props.onCancelEdit}>
              Cancelar
            </button>
            <button type="submit" className="product-modal-button primary" id="saveProductEdit" disabled={props.saving}>
              {props.saving ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </section>
    </div>

    <div className="product-modal confirmation-modal" id="deactivateConfirmModal" role="alertdialog" aria-modal="true" aria-labelledby="deactivateConfirmTitle" aria-describedby="deactivateConfirmMessage" hidden={!props.confirming} onClick={(event) => { if (event.target === event.currentTarget) props.onCancelDeactivate(); }}>
      <section className="confirmation-card">
        <div className="confirmation-icon" aria-hidden="true">!</div>
        <h2 id="deactivateConfirmTitle">Desativar produto?</h2>
        <p id="deactivateConfirmMessage">{props.confirmMessage}</p>
        <p className="confirmation-note">
          O produto não será excluído permanentemente. Você poderá consultá-lo
          como inativo.
        </p>
        <div className="product-modal-actions">
          <button type="button" className="product-modal-button secondary" id="cancelDeactivateProduct" onClick={props.onCancelDeactivate}>
            Cancelar
          </button>
          <button type="button" className="product-modal-button danger" id="confirmDeactivateProduct" onClick={props.onConfirmDeactivate}>
            Sim, desativar
          </button>
        </div>
      </section>
    </div>

    
    


</div></>;
}
