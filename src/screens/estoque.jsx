import { useCallback, useEffect, useMemo, useState } from 'react';
import pageCss from '../../ProjetoSuperMarket/estoque/style.css?inline';
import sidebarCss from '../../ProjetoSuperMarket/sidebar.css?inline';
import Sidebar from '../Sidebar.jsx';
import { supplierApi } from '../supplierApi.js';

const units = { un: 'UN', kg: 'KG', g: 'G', l: 'L', ml: 'ML', cx: 'CX', pc: 'PC' };
const categoryLabels = {
  alimentos: 'Alimentos',
  bebidas: 'Bebidas',
  higiene: 'Higiene e Limpeza',
  frios: 'Frios e Laticínios',
  hortifruti: 'Hortifrúti',
  padaria: 'Padaria',
  acougue: 'Açougue',
  outros: 'Outros'
};
const movementLabels = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' };
const reasonLabels = {
  compra: 'Compra de fornecedor',
  devolucao: 'Devolução de cliente',
  perda: 'Perda/Quebra',
  vencimento: 'Produto vencido',
  inventario: 'Inventário/Contagem',
  outro: 'Outro'
};
const unit = (value) => units[value] || value || 'UN';
const category = (value) => categoryLabels[value] || value || 'Sem categoria';
const quantity = (value) => Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 });
const date = (value) => {
  if (!value) return '—';
  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('pt-BR');
};
const stockStatus = (product) => {
  const current = Number(product.estoque_atual || 0);
  const minimum = Number(product.estoque_minimo || 0);
  if (current <= 0) return 'out';
  if (minimum > 0 && current < minimum * 0.3) return 'critical';
  if (current < minimum) return 'low';
  return 'ok';
};

export default function EstoqueScreen() {
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [adjusting, setAdjusting] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const result = await supplierApi('/products');
      setProducts(result.data || []);
    } catch (error) {
      setLoadError(error.message || 'Não foi possível carregar o estoque.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => {
    let active = true;
    supplierApi('/categories')
      .then((result) => { if (active) setCategoryOptions(result.data || []); })
      .catch((error) => {
        if (active) setNotice({ type: 'error', text: error.message || 'Não foi possível carregar as categorias.' });
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const modalOpen = Boolean(adjusting || historyProduct);
    document.body.classList.toggle('modal-open', modalOpen);
    return () => document.body.classList.remove('modal-open');
  }, [adjusting, historyProduct]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !saving) {
        setAdjusting(null);
        setHistoryProduct(null);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [saving]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return products.filter((product) => {
      const matchesSearch = !term || [product.nome, product.codigo, product.codigo_barras]
        .some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term));
      return matchesSearch
        && (!categoryFilter || product.categoria === categoryFilter)
        && (!statusFilter || stockStatus(product) === statusFilter);
    });
  }, [products, search, categoryFilter, statusFilter]);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.categoria).filter(Boolean))].sort(),
    [products]
  );
  const categoryName = (value) => categoryOptions.find((item) => item.slug === value)?.nome || category(value);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiringCount = products.filter((product) => {
    if (!product.data_validade) return false;
    const expiry = new Date(`${product.data_validade}T00:00:00`);
    const days = Math.ceil((expiry - today) / 86400000);
    return days >= 0 && days <= 30;
  }).length;

  const openAdjustment = (product = null) => {
    setFormError('');
    setAdjusting(product || products[0] || null);
  };

  const openHistory = async (product) => {
    setHistoryProduct(product);
    setHistory([]);
    setHistoryLoading(true);
    try {
      const result = await supplierApi(`/stock/movements?product_id=${product.id}`);
      setHistory(result.data || []);
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível carregar o histórico.' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const saveAdjustment = async (event) => {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const type = String(form.get('type') || '');
    const amount = Number(String(form.get('quantity') || '').replace(',', '.'));
    const productId = Number(form.get('product_id'));
    if (!Number.isFinite(amount) || amount < 0 || (type !== 'set' && amount <= 0)) {
      setFormError('Informe uma quantidade válida. Entradas e saídas devem ser maiores que zero.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      await supplierApi('/stock/movements', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          type,
          quantity: amount,
          reason: form.get('reason'),
          notes: form.get('notes')
        })
      });
      setAdjusting(null);
      setNotice({ type: 'success', text: 'Movimentação registrada e estoque atualizado.' });
      await loadProducts();
    } catch (error) {
      setFormError(error.message || 'Não foi possível registrar a movimentação.');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const columns = ['Produto', 'Código', 'Categoria', 'Estoque atual', 'Estoque mínimo', 'Status', 'Validade'];
    const rows = filteredProducts.map((product) => [
      product.nome,
      product.codigo,
      categoryName(product.categoria),
      quantity(product.estoque_atual),
      quantity(product.estoque_minimo),
      { ok: 'Estoque OK', low: 'Estoque baixo', critical: 'Crítico', out: 'Sem estoque' }[stockStatus(product)],
      product.data_validade || ''
    ]);
    const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'estoque-supermarket.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setStatusFilter('');
  };

  return (
    <>
      <style>{pageCss}</style><style>{sidebarCss}</style>
      <div className="legacy-screen">
        <div className="app-container">
          <Sidebar />
          <div className="sidebar-overlay" id="sidebarOverlay" />
          <main className="main-content" id="mainContent">
            <div className="page-container">
              <header className="page-header">
                <div className="header-left">
                  <button className="menu-toggle" type="button" data-legacy-action="toggleSidebar()" aria-label="Abrir menu">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
                  </button>
                  <div><div className="breadcrumb"><a href="/dashboard">Dashboard</a><span>›</span><span>Produtos</span><span>›</span><span>Controle de Estoque</span></div><h1>📦 Controle de Estoque</h1></div>
                </div>
                <div className="header-actions">
                  <button className="btn btn-secondary" type="button" onClick={() => window.print()}>Imprimir</button>
                  <button className="btn btn-primary" type="button" onClick={() => openAdjustment()} disabled={!products.length}>＋ Ajustar Estoque</button>
                </div>
              </header>

              {notice && <div className={`alert ${notice.type === 'error' ? 'danger' : 'info'}`} role="status">{notice.text}<button type="button" className="stock-notice-close" onClick={() => setNotice(null)} aria-label="Fechar aviso">×</button></div>}

              <section className="summary-cards">
                <article className="summary-card total"><h3>Total de Produtos</h3><div className="summary-value">{products.length}</div><div className="summary-label">itens cadastrados</div></article>
                <article className="summary-card low"><h3>Estoque Baixo</h3><div className="summary-value">{products.filter((product) => stockStatus(product) === 'low').length}</div><div className="summary-label">⚠️ requer atenção</div></article>
                <article className="summary-card critical"><h3>Estoque Crítico</h3><div className="summary-value">{products.filter((product) => ['critical', 'out'].includes(stockStatus(product))).length}</div><div className="summary-label">🚨 repor urgente</div></article>
                <article className="summary-card expiring"><h3>Próximo ao Vencimento</h3><div className="summary-value">{expiringCount}</div><div className="summary-label">📅 vence em 30 dias</div></article>
              </section>

              <section className="filters-section">
                <div className="filters-grid">
                  <div className="filter-group"><label htmlFor="searchInput">Buscar Produto</label><input className="filter-input" id="searchInput" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou código..." /></div>
                  <div className="filter-group"><label htmlFor="categoryFilter">Categoria</label><select className="filter-select" id="categoryFilter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">Todas as categorias</option>{categories.map((value) => <option key={value} value={value}>{categoryName(value)}</option>)}</select></div>
                  <div className="filter-group"><label htmlFor="statusFilter">Status do Estoque</label><select className="filter-select" id="statusFilter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Todos os status</option><option value="ok">Estoque OK</option><option value="low">Estoque Baixo</option><option value="critical">Estoque Crítico</option><option value="out">Sem Estoque</option></select></div>
                  <div className="filter-group"><button className="btn btn-secondary" type="button" onClick={clearFilters}>Limpar Filtros</button></div>
                </div>
              </section>

              <section className="stock-table-section">
                <div className="table-header"><h2>Produtos em Estoque</h2><div className="table-actions"><button className="icon-btn" type="button" title="Exportar CSV" aria-label="Exportar CSV" onClick={exportCsv}>⇩</button><button className="icon-btn" type="button" title="Atualizar" aria-label="Atualizar" onClick={loadProducts}>⟳</button></div></div>
                <div className="table-wrapper"><table className="stock-table">
                  <thead><tr><th>Produto</th><th>Categoria</th><th>Estoque Atual</th><th>Estoque Mínimo</th><th>Status</th><th>Validade</th><th>Ações</th></tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan="7" className="stock-empty">Carregando estoque...</td></tr>
                      : loadError ? <tr><td colSpan="7" className="stock-empty" role="alert">{loadError}<br /><button type="button" className="btn btn-secondary" onClick={loadProducts}>Tentar novamente</button></td></tr>
                        : filteredProducts.length === 0 ? <tr><td colSpan="7" className="stock-empty">{products.length ? 'Nenhum produto corresponde aos filtros.' : <>Nenhum produto cadastrado. <a href="/adicionar-produto">Cadastrar produtos</a></>}</td></tr>
                          : filteredProducts.map((product) => {
                            const status = stockStatus(product);
                            const labels = { ok: 'Estoque OK', low: 'Estoque baixo', critical: 'Crítico', out: 'Sem estoque' };
                            return <tr key={product.id}>
                              <td><div className="product-info"><div className="product-image">📦</div><div className="product-details"><span className="product-name">{product.nome}</span><span className="product-code">{product.codigo || product.codigo_barras || 'Sem código'}</span></div></div></td>
                              <td>{categoryName(product.categoria)}</td>
                              <td><span className={`quantity-display ${status}`}>{quantity(product.estoque_atual)} {unit(product.unidade)}</span></td>
                              <td>{quantity(product.estoque_minimo)} {unit(product.unidade)}</td>
                              <td><span className={`stock-badge ${status}`}>{labels[status]}</span></td>
                              <td>{date(product.data_validade)}</td>
                              <td><div className="actions-cell"><button className="action-icon-btn" type="button" title="Ajustar estoque" aria-label={`Ajustar ${product.nome}`} onClick={() => openAdjustment(product)}>✎</button><button className="action-icon-btn" type="button" title="Histórico" aria-label={`Histórico de ${product.nome}`} onClick={() => openHistory(product)}>◷</button></div></td>
                            </tr>;
                          })}
                  </tbody>
                </table></div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {adjusting && <div className="modal active" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setAdjusting(null); }}>
        <section className="modal-content" role="dialog" aria-modal="true" aria-labelledby="adjustTitle">
          <header className="modal-header"><h2 id="adjustTitle">Ajustar Estoque</h2><button className="close-modal" type="button" onClick={() => setAdjusting(null)} disabled={saving} aria-label="Fechar">×</button></header>
          <form onSubmit={saveAdjustment}>
            <div className="form-group"><label htmlFor="adjustProduct">Produto</label><select className="form-input" id="adjustProduct" name="product_id" value={adjusting.id} onChange={(event) => setAdjusting(products.find((product) => String(product.id) === event.target.value) || null)} required>{products.map((product) => <option key={product.id} value={product.id}>{product.nome} — {quantity(product.estoque_atual)} {unit(product.unidade)}</option>)}</select></div>
            <div className="form-group"><label htmlFor="adjustType">Tipo de movimentação</label><select className="form-input" id="adjustType" name="type" required><option value="in">Entrada (Adicionar)</option><option value="out">Saída (Remover)</option><option value="set">Ajuste Manual (Definir saldo)</option></select></div>
            <div className="form-group"><label htmlFor="adjustQuantity">Quantidade</label><input className="form-input" id="adjustQuantity" name="quantity" type="number" min="0" step="0.001" required /></div>
            <div className="form-group"><label htmlFor="adjustReason">Motivo do Ajuste</label><select className="form-input" id="adjustReason" name="reason" required><option value="">Selecione...</option>{Object.entries(reasonLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div>
            <div className="form-group"><label htmlFor="adjustNotes">Observações (opcional)</label><input className="form-input" id="adjustNotes" name="notes" maxLength="500" placeholder="Detalhes adicionais..." /></div>
            {formError && <p className="stock-form-error" role="alert">{formError}</p>}
            <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={() => setAdjusting(null)} disabled={saving}>Cancelar</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Confirmar Ajuste'}</button></div>
          </form>
        </section>
      </div>}

      {historyProduct && <div className="modal active" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setHistoryProduct(null); }}>
        <section className="modal-content stock-history-modal" role="dialog" aria-modal="true" aria-labelledby="historyTitle">
          <header className="modal-header"><h2 id="historyTitle">Histórico de Estoque</h2><button className="close-modal" type="button" onClick={() => setHistoryProduct(null)} aria-label="Fechar">×</button></header>
          <p><strong>{historyProduct.nome}</strong> · Saldo atual: {quantity(historyProduct.estoque_atual)} {unit(historyProduct.unidade)}</p>
          {historyLoading ? <p className="stock-empty">Carregando movimentações...</p> : history.length === 0 ? <p className="stock-empty">Nenhuma movimentação registrada.</p> : <div className="stock-history-list">{history.map((movement) => <article key={movement.id}><div><strong>{movementLabels[movement.tipo] || movement.tipo} · {reasonLabels[movement.motivo] || movement.motivo}</strong><small>{new Date(movement.created_at).toLocaleString('pt-BR')}{movement.referencia ? ` · ${movement.referencia}` : ''}</small>{movement.observacoes && <small>{movement.observacoes}</small>}</div><span>{quantity(movement.estoque_anterior)} → {quantity(movement.estoque_posterior)} {unit(historyProduct.unidade)}</span></article>)}</div>}
        </section>
      </div>}
    </>
  );
}
