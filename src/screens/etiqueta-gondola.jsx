import { useState } from 'react';
import pageCss from '../../ProjetoSuperMarket/etiqueta-gondola/style.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";

function normalizeEan13(value) {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  const base = digits.length >= 12 ? digits.slice(0, 12) : '789000000001';
  let sum = 0;
  for (let index = 0; index < base.length; index += 1) {
    sum += Number(base[index]) * (index % 2 === 0 ? 1 : 3);
  }
  return `${base}${(10 - (sum % 10)) % 10}`;
}

export default function etiqueta_gondolaScreen(props) {
  const [product, setProduct] = useState('Arroz Tipo 1 5kg');
  const [price, setPrice] = useState('24,90');
  const [quantity, setQuantity] = useState('6');
  const [code, setCode] = useState('7890000000012');
  const [offer, setOffer] = useState('Preço normal');
  const [preview, setPreview] = useState({
    product: 'Arroz Tipo 1 5kg',
    price: '24,90',
    quantity: 6,
    code: '7890000000012'
  });
  const total = Math.max(1, Math.min(30, Number(preview.quantity) || 1));
  const barcode = normalizeEan13(preview.code);
  const updateLabels = () => setPreview({
    product: product.trim() || 'Produto sem nome',
    price: price.trim() || '0,00',
    quantity: Math.max(1, Math.min(30, Number(quantity) || 1)),
    code
  });

  return <><style>{pageCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app">
      <Sidebar />
      <main className="main">
        <header>
          <div className="header-left">
            <button className="menu" id="menuButton" aria-label="Abrir menu">
              <svg viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1>Etiqueta de Gôndola</h1>
          </div>
          <span className="counter">Impressão para prateleiras</span>
        </header>
        <section className="content">
          <div className="breadcrumb">
            Gerenciamento / Produtos /
            <strong style={{color: "#667eea"}}>Etiqueta de Gôndola</strong>
          </div>
          <p className="subtitle">
            Monte etiquetas de preço para identificar os produtos nas
            prateleiras.
          </p>
          <div className="layout">
            <div className="panel form-panel">
              <h2>Dados da etiqueta</h2>
              <label htmlFor="product">Produto</label>
              <input id="product" value={product} onChange={(event) => setProduct(event.target.value)} placeholder="Nome do produto" />
              <div className="row">
                <div>
                  <label htmlFor="price">Preço</label><input id="price" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0,00" />
                </div>
                <div>
                  <label htmlFor="quantity">Quantidade</label><input id="quantity" type="number" min="1" max="30" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
                </div>
              </div>
              <label htmlFor="code">Código</label>
              <input id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Código de barras ou SKU" />
              <label htmlFor="offer">Tipo de preço</label>
              <select id="offer" value={offer} onChange={(event) => setOffer(event.target.value)}>
                <option>Preço normal</option>
                <option>Oferta</option>
                <option>Leve mais, pague menos</option>
              </select>
              <div className="actions">
                <button type="button" className="primary" id="generate" onClick={updateLabels}>
                  Atualizar etiquetas                  </button><button type="button" className="secondary" id="print" onClick={() => {
                    updateLabels();
                    window.setTimeout(() => window.print(), 0);
                  }}>
                  Imprimir etiquetas
                </button>
              </div>
              <div className="hint">
                A prévia abaixo mostra o formato das etiquetas. Ajuste os dados
                e clique em “Atualizar etiquetas” antes de imprimir.
              </div>
            </div>
            <div className="panel label-panel">
              <div className="preview-head">
                <h2>Pré-visualização</h2>
                <span className="counter" id="labelCount">{`${total} etiqueta${total === 1 ? '' : 's'}`}</span>
              </div>
              <div className="labels" id="labels">
                {Array.from({ length: total }, (_, index) => (
                  <article className="label" key={index}>
                    <div className="label-brand">Mercado SuperMarket</div>
                    <div className="label-name">{preview.product}</div>
                    <div className="price">R$ {preview.price}</div>
                    <div className="code"><svg className="barcode" data-code={barcode}></svg><span>CÓD. {barcode}</span></div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    
    
      
      


</div></>;
}
