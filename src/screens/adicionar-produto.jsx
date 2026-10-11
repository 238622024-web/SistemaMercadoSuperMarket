import pageCss from '../../ProjetoSuperMarket/adicionar-produto/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
export default function adicionar_produtoScreen(props) {
  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app-container">
      
      <Sidebar />

      
      <main className="main-content" id="mainContent">
        
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" data-legacy-action="toggleSidebar()">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1 className="header-title">Adicionar Produto</h1>
          </div>
        </header>

        
        <div className="page-content">
          <div className="page-header">
            <div className="page-breadcrumb">
              <a href="/dashboard" className="breadcrumb-link">Início</a>
              <span className="breadcrumb-separator">/</span>
              <span>Produtos</span>
              <span className="breadcrumb-separator">/</span>
              <span>Adicionar Produto</span>
            </div>
            <p className="page-subtitle">
              Preencha os campos abaixo para adicionar um novo produto ao
              sistema
            </p>
          </div>

          <form id="productForm" onSubmit={props.onSubmit} className="form-container">
            
            <div className="form-section">
              <h2 className="form-section-title">Informações Básicas</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required" htmlFor="productName">Nome do Produto</label>
                  <input type="text" id="productName" className="form-input" placeholder="Ex: Arroz Integral 1kg" required />
                </div>
                <div className="form-group">
                  <label className="form-label required" htmlFor="productCode">Código/SKU</label>
                  <input type="text" id="productCode" className="form-input" placeholder="Ex: PROD-001" required />
                </div>
                <div className="form-group">
                  <label className="form-label required" htmlFor="productCategory">Categoria</label>
                  <select id="productCategory" className="form-select" required>
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
                </div>
                <div className="form-group">
                  <label className="form-label required" htmlFor="productBrand">Marca</label>
                  <input type="text" id="productBrand" className="form-input" placeholder="Ex: Tio João" required />
                </div>
              </div>
              <div className="form-grid full">
                <div className="form-group">
                  <label className="form-label" htmlFor="productDescription">Descrição</label>
                  <textarea id="productDescription" className="form-textarea" placeholder="Descrição detalhada do produto..."></textarea>
                </div>
              </div>
            </div>

            
            <div className="form-section">
              <h2 className="form-section-title">Precificação e Estoque</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required" htmlFor="productCost">Preço de Custo (R$)</label>
                  <input type="number" id="productCost" className="form-input" placeholder="0,00" step="0.01" min="0" required />
                  <span className="form-hint">Valor pago ao fornecedor</span>
                </div>
                <div className="form-group">
                  <label className="form-label required" htmlFor="productPrice">Preço de Venda (R$)</label>
                  <input type="number" id="productPrice" className="form-input" placeholder="0,00" step="0.01" min="0" required />
                  <span className="form-hint">Valor cobrado do cliente</span>
                </div>
                <div className="form-group">
                  <label className="form-label required" htmlFor="productStock">Quantidade em Estoque</label>
                  <input type="number" id="productStock" className="form-input" placeholder="0" min="0" required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="productMinStock">Estoque Mínimo</label>
                  <input type="number" id="productMinStock" className="form-input" placeholder="0" min="0" />
                  <span className="form-hint">Alerta quando atingir este valor</span>
                </div>
                <div className="form-group">
                  <label className="form-label required" htmlFor="productUnit">Unidade de Medida</label>
                  <select id="productUnit" className="form-select" required>
                    <option value="">Selecione</option>
                    <option value="un">Unidade (UN)</option>
                    <option value="kg">Quilograma (KG)</option>
                    <option value="g">Grama (G)</option>
                    <option value="l">Litro (L)</option>
                    <option value="ml">Mililitro (ML)</option>
                    <option value="cx">Caixa (CX)</option>
                    <option value="pc">Pacote (PC)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="productBarcode">Código de Barras</label>
                  <input type="text" id="productBarcode" className="form-input" placeholder="Ex: 7891234567890" />
                </div>
              </div>
            </div>

            
            <div className="form-section">
              <h2 className="form-section-title">Informações Adicionais</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" htmlFor="productSupplier">Fornecedor</label>
                  <select id="productSupplier" className="form-select">
                    <option value="">Selecione um fornecedor</option>
                    <option value="fornecedor1">Distribuidora ABC</option>
                    <option value="fornecedor2">Atacado XYZ</option>
                    <option value="fornecedor3">Fornecedor Central</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="productValidity">Data de Validade</label>
                  <input type="date" id="productValidity" className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="productWeight">Peso (g)</label>
                  <input type="number" id="productWeight" className="form-input" placeholder="0" min="0" />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="productLocation">Localização no Estoque</label>
                  <input type="text" id="productLocation" className="form-input" placeholder="Ex: Corredor 3, Prateleira A" />
                </div>
              </div>
            </div>

            
            <div className="form-section">
              <h2 className="form-section-title">Imagem do Produto</h2>
              <div className="image-upload" id="imageUpload" data-legacy-action="document.getElementById('productImage').click()">
                <svg className="upload-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"></path>
                </svg>
                <p className="upload-text">
                  Clique para selecionar ou arraste a imagem aqui
                </p>
                <p className="upload-hint">PNG, JPG ou WEBP (máx. 5MB)</p>
                <input type="file" id="productImage" accept="image/*" style={{display: "none"}} />
              </div>
              <div className={`image-preview${props.images?.length ? ' active' : ''}`} id="imagePreview">
                {props.images?.map((image, index) => (
                  <div className="preview-item" key={`${image.slice(-24)}-${index}`}>
                    <img src={image} alt={`Pré-visualização ${index + 1}`} />
                    <button type="button" className="preview-remove" aria-label="Remover imagem" onClick={() => props.onRemoveImage(index)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" data-legacy-action="window.location.href = '../produtos/index.html'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
                </svg>
                Cancelar
              </button>
              <button type="submit" className="btn btn-success" disabled={props.registering}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
                </svg>
                {props.registering ? 'Salvando...' : 'Salvar Produto'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>

    
    <div id="notification" hidden={!props.notification} className={`notification ${props.notification?.type || ""} ${props.notification ? 'show' : ''}`} role="status">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
      </svg>
      <span id="notificationText">{props.notification?.text || ""}</span>
    </div>

    
    
      
      


</div></>;
}
