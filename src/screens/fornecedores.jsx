import { useCallback, useEffect, useMemo, useState } from 'react';
import pageCss from '../../ProjetoSuperMarket/fornecedores/style.css?inline';
import sidebarCss from '../../ProjetoSuperMarket/sidebar.css?inline';
import Sidebar from '../Sidebar.jsx';
import { supplierApi } from '../supplierApi.js';
import './fornecedores.css';

const emptySupplier = {
  nome: '',
  razao_social: '',
  cnpj: '',
  categoria: '',
  contato: '',
  telefone: '',
  email: '',
  endereco: '',
  cidade: '',
  estado: '',
  cep: '',
  prazo_pagamento: 0,
  observacoes: '',
  ativo: true
};

const emptyItem = { produto_id: '', nome: '', codigo: '', unidade: 'un', quantidade: '1', preco_unitario: '' };

const currency = (value) => Number(value || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const date = (value) => value
  ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR')
  : '—';

function errorMessage(error) {
  return error?.message || 'Não foi possível concluir a operação.';
}

export default function FornecedoresScreen() {
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [supplierModal, setSupplierModal] = useState(null);
  const [supplierForm, setSupplierForm] = useState(emptySupplier);
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orderSupplier, setOrderSupplier] = useState(null);
  const [orderItems, setOrderItems] = useState([emptyItem]);
  const [orderForm, setOrderForm] = useState({ data_entrega: '', observacoes: '' });
  const [savingOrder, setSavingOrder] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [supplierResult, orderResult, productResult] = await Promise.all([
        supplierApi('/suppliers'),
        supplierApi('/purchase-orders'),
        supplierApi('/products')
      ]);
      setSuppliers(supplierResult.data || []);
      setOrders(orderResult.data || []);
      setProducts(productResult.data || []);
    } catch (loadError) {
      setError(errorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const categories = useMemo(
    () => [...new Set(suppliers.map((supplier) => supplier.categoria).filter(Boolean))].sort(),
    [suppliers]
  );

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return suppliers.filter((supplier) => {
      const matchesTerm = !term || [
        supplier.nome, supplier.razao_social, supplier.cnpj,
        supplier.contato, supplier.email, supplier.telefone
      ].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term));
      return matchesTerm &&
        (!category || supplier.categoria === category) &&
        (activeFilter === '' || supplier.ativo === (activeFilter === 'true'));
    });
  }, [suppliers, search, category, activeFilter]);

  const activeCount = suppliers.filter((supplier) => supplier.ativo).length;
  const openOrders = orders.filter((order) => order.status === 'ordered');
  const openTotal = openOrders.reduce((total, order) => total + Number(order.total || 0), 0);
  const showNotice = (text, type = 'success') => {
    setNotice({ text, type });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const openCreateSupplier = () => {
    setSupplierForm(emptySupplier);
    setSupplierModal({ mode: 'create', id: null });
  };

  const openEditSupplier = (supplier) => {
    setSupplierForm({ ...emptySupplier, ...supplier, prazo_pagamento: supplier.prazo_pagamento ?? 0 });
    setSupplierModal({ mode: 'edit', id: supplier.id });
    setDetail(null);
  };

  const showSupplier = async (supplier) => {
    setDetailLoading(true);
    setDetail({ ...supplier, pedidos: [] });
    try {
      const result = await supplierApi(`/suppliers/${supplier.id}`);
      setDetail(result.data);
    } catch (detailError) {
      showNotice(errorMessage(detailError), 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const saveSupplier = async (event) => {
    event.preventDefault();
    setSavingSupplier(true);
    try {
      const editing = supplierModal.mode === 'edit';
      const result = await supplierApi(
        editing ? `/suppliers/${supplierModal.id}` : '/suppliers',
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify({
            ...supplierForm,
            prazo_pagamento: Number(supplierForm.prazo_pagamento || 0)
          })
        }
      );
      setSupplierModal(null);
      await loadData();
      showNotice(editing ? 'Fornecedor atualizado.' : 'Fornecedor cadastrado.');
      if (result.data) setDetail(result.data);
    } catch (saveError) {
      showNotice(errorMessage(saveError), 'error');
    } finally {
      setSavingSupplier(false);
    }
  };

  const toggleSupplier = async (supplier) => {
    try {
      await supplierApi(`/suppliers/${supplier.id}/active`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: !supplier.ativo })
      });
      setDetail((current) => current ? { ...current, ativo: !supplier.ativo } : current);
      await loadData();
      showNotice(supplier.ativo ? 'Fornecedor desativado.' : 'Fornecedor reativado.');
    } catch (toggleError) {
      showNotice(errorMessage(toggleError), 'error');
    }
  };

  const startOrder = (supplier) => {
    setDetail(null);
    setOrderSupplier(supplier);
    setOrderItems([{ ...emptyItem }]);
    setOrderForm({ data_entrega: '', observacoes: '' });
  };

  const setItemField = (index, field, value) => {
    setOrderItems((items) => items.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [field]: value } : item
    ));
  };

  const selectOrderProduct = (index, productId) => {
    const product = products.find((item) => String(item.id) === productId);
    setOrderItems((items) => items.map((item, itemIndex) => (
      itemIndex === index
        ? product
          ? {
            ...item,
            produto_id: product.id,
            nome: product.nome,
            codigo: product.codigo || product.codigo_barras || '',
            unidade: product.unidade || 'un',
            preco_unitario: item.preco_unitario || String(product.preco_custo ?? '')
          }
          : { ...item, produto_id: '', nome: '', codigo: '', unidade: 'un', preco_unitario: '' }
        : item
    )));
  };

  const orderTotal = orderItems.reduce((total, item) => (
    total + (Number(String(item.quantidade).replace(',', '.')) || 0) *
      (Number(String(item.preco_unitario).replace(',', '.')) || 0)
  ), 0);

  const createOrder = async (event) => {
    event.preventDefault();
    setSavingOrder(true);
    try {
      await supplierApi('/purchase-orders', {
        method: 'POST',
        body: JSON.stringify({
          supplier_id: orderSupplier.id,
          data_entrega: orderForm.data_entrega || null,
          observacoes: orderForm.observacoes,
          itens: orderItems.map((item) => ({
            ...item,
            produto_id: Number(item.produto_id),
            quantidade: Number(String(item.quantidade).replace(',', '.')),
            preco_unitario: Number(String(item.preco_unitario).replace(',', '.'))
          }))
        })
      });
      setOrderSupplier(null);
      await loadData();
      showNotice('Pedido criado e enviado ao e-mail do fornecedor.');
    } catch (orderError) {
      await loadData();
      showNotice(errorMessage(orderError), 'error');
    } finally {
      setSavingOrder(false);
    }
  };

  const setSupplierField = (event) => {
    const { name, value, type, checked } = event.target;
    setSupplierForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const setOrderField = (event) => {
    const { name, value } = event.target;
    setOrderForm((current) => ({ ...current, [name]: value }));
  };

  const orderDialog = orderSupplier && (
    <div className="supplier-modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !savingOrder) setOrderSupplier(null);
    }}>
      <section className="supplier-modal supplier-order-modal" role="dialog" aria-modal="true" aria-labelledby="supplierOrderTitle">
        <header className="supplier-modal-head">
          <div><span className="supplier-eyebrow">PEDIDO DE COMPRA</span><h2 id="supplierOrderTitle">Novo pedido</h2></div>
          <button type="button" className="supplier-close" onClick={() => setOrderSupplier(null)} aria-label="Fechar">×</button>
        </header>
        <form onSubmit={createOrder} className="supplier-form">
          <div className="supplier-recipient">
            <span className="supplier-avatar">{orderSupplier.nome?.slice(0, 1).toUpperCase()}</span>
            <div><strong>{orderSupplier.nome}</strong><small>{orderSupplier.email || 'Cadastre o e-mail para enviar pedidos'}</small></div>
          </div>
          <div className="supplier-form-grid">
            <label className="supplier-field"><span>Previsão de entrega</span><input type="date" name="data_entrega" value={orderForm.data_entrega} onChange={setOrderField} /></label>
          </div>
          <div className="supplier-items-title"><strong>Itens do pedido</strong><button type="button" className="supplier-text-button" onClick={() => setOrderItems((items) => [...items, { ...emptyItem }])}>+ Adicionar item</button></div>
          {orderItems.map((item, index) => (
            <div className="supplier-order-line" key={index}>
              <label className="supplier-field supplier-item-name"><span>Produto</span><select required value={item.produto_id} onChange={(event) => selectOrderProduct(index, event.target.value)}><option value="">Selecione um produto cadastrado</option>{products.map((product) => <option key={product.id} value={product.id}>{product.nome} · {product.codigo || product.codigo_barras || 'sem código'}</option>)}</select></label>
              <label className="supplier-field"><span>Código</span><input value={item.codigo} readOnly aria-label="Código do produto selecionado" /></label>
              <label className="supplier-field"><span>Unid.</span><input value={item.unidade.toUpperCase()} readOnly aria-label="Unidade do produto" /></label>
              <label className="supplier-field"><span>Qtd.</span><input required type="number" min="0.01" step="0.01" value={item.quantidade} onChange={(event) => setItemField(index, 'quantidade', event.target.value)} /></label>
              <label className="supplier-field"><span>Unitário (R$)</span><input required type="number" min="0" step="0.01" value={item.preco_unitario} onChange={(event) => setItemField(index, 'preco_unitario', event.target.value)} /></label>
              <button type="button" className="supplier-remove-line" onClick={() => setOrderItems((items) => items.filter((_, itemIndex) => itemIndex !== index))} disabled={orderItems.length === 1} aria-label={`Remover item ${index + 1}`}>×</button>
            </div>
          ))}
          <label className="supplier-field"><span>Observações para o fornecedor</span><textarea name="observacoes" rows="3" maxLength="2000" value={orderForm.observacoes} onChange={setOrderField} placeholder="Instruções de entrega, condições ou informações adicionais" /></label>
          <div className="supplier-order-total"><span>Total do pedido</span><strong>{currency(orderTotal)}</strong></div>
          <p className="supplier-form-hint">Selecione produtos cadastrados. Ao receber o pedido, as quantidades serão adicionadas automaticamente ao estoque.</p>
          <footer className="supplier-modal-actions"><button type="button" className="button secondary" onClick={() => setOrderSupplier(null)} disabled={savingOrder}>Cancelar</button><button type="submit" className="button" disabled={savingOrder || !orderSupplier.email || !products.length || orderItems.some((item) => !item.produto_id)}>{savingOrder ? 'Enviando...' : 'Criar e enviar pedido'}</button></footer>
        </form>
      </section>
    </div>
  );

  return (
    <>
      <style>{pageCss}</style><style>{sidebarCss}</style>
      <div className="legacy-screen supplier-screen">
        <Sidebar />
        <div className="mobile-overlay" id="overlay" />
        <main className="main" id="main">
          <header className="header"><div className="header-left">
            <button className="menu-toggle" data-legacy-action="toggleSidebar()" aria-label="Abrir menu"><svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg></button>
            <h1 className="header-title">Fornecedores</h1>
          </div></header>
          <section className="page-content">
            <div className="breadcrumb"><a href="/dashboard">Início</a><span>/</span><span>Fornecedores</span><span>/</span><span>Lista</span></div>
            <div className="supplier-page-intro"><div><span className="supplier-eyebrow">GESTÃO DE PARCEIROS</span><h2>Fornecedores</h2><p>Gerencie seus parceiros comerciais e envie pedidos de compra em poucos passos.</p></div>
              <button type="button" className="button supplier-primary-action" onClick={openCreateSupplier}>＋ Novo fornecedor</button>
            </div>
            {notice && <div className={`supplier-alert ${notice.type}`} role="status">{notice.text}<button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso">×</button></div>}
            {error && <div className="supplier-alert error" role="alert">{error}<button type="button" onClick={loadData}>Tentar novamente</button></div>}
            <div className="supplier-stats">
              <article className="supplier-stat-card"><span className="supplier-stat-icon blue">◎</span><div><span>Fornecedores cadastrados</span><strong>{suppliers.length}</strong></div></article>
              <article className="supplier-stat-card"><span className="supplier-stat-icon green">✓</span><div><span>Fornecedores ativos</span><strong>{activeCount}</strong></div></article>
              <article className="supplier-stat-card"><span className="supplier-stat-icon amber">▤</span><div><span>Pedidos em aberto</span><strong>{openOrders.length}</strong></div><small>{currency(openTotal)}</small></article>
            </div>
            <section className="panel supplier-panel">
              <div className="supplier-toolbar">
                <label className="supplier-search"><span aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, CNPJ, contato ou e-mail" aria-label="Buscar fornecedor" /></label>
                <select aria-label="Filtrar por categoria" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">Todas as categorias</option>{categories.map((item) => <option key={item}>{item}</option>)}</select>
                <select aria-label="Filtrar por situação" value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Inativos</option></select>
                <span className="supplier-result-count">{filteredSuppliers.length} resultado{filteredSuppliers.length === 1 ? '' : 's'}</span>
              </div>
              <div className="table-wrap supplier-table-wrap">
                <table className="supplier-table">
                  <thead><tr><th>Fornecedor</th><th>Categoria</th><th>Contato</th><th>Pagamento</th><th>Último pedido</th><th>Status</th><th><span className="sr-only">Ações</span></th></tr></thead>
                  <tbody>
                    {filteredSuppliers.map((supplier) => {
                      const lastOrder = orders.find((order) => order.supplier_id === supplier.id);
                      return <tr key={supplier.id}>
                        <td><strong>{supplier.nome}</strong><small>{supplier.cnpj ? `CNPJ ${supplier.cnpj}` : supplier.razao_social || 'Pessoa jurídica'}</small></td>
                        <td>{supplier.categoria || '—'}</td>
                        <td className="supplier-contact"><span>{supplier.contato || '—'}</span><small>{supplier.telefone || supplier.email || 'Sem contato informado'}</small></td>
                        <td>{supplier.prazo_pagamento ? `${supplier.prazo_pagamento} dias` : 'À vista'}</td>
                        <td>{lastOrder ? date(lastOrder.created_at) : '—'}</td>
                        <td><span className={`supplier-status ${supplier.ativo ? 'active' : 'inactive'}`}>{supplier.ativo ? 'Ativo' : 'Inativo'}</span></td>
                        <td><button type="button" className="supplier-view-button" onClick={() => showSupplier(supplier)} aria-label={`Ver informações de ${supplier.nome}`} title="Ver informações">↗</button></td>
                      </tr>;
                    })}
                  </tbody>
                </table>
                {!loading && !filteredSuppliers.length && <div className="supplier-empty"><span>⌕</span><strong>{suppliers.length ? 'Nenhum fornecedor encontrado' : 'Sua lista de fornecedores está vazia'}</strong><p>{suppliers.length ? 'Ajuste a busca ou os filtros e tente novamente.' : 'Cadastre seu primeiro parceiro para começar a organizar as compras.'}</p>{!suppliers.length && <button type="button" className="button" onClick={openCreateSupplier}>Cadastrar fornecedor</button>}</div>}
                {loading && <div className="supplier-loading" role="status">Carregando fornecedores…</div>}
              </div>
            </section>
          </section>
        </main>
      </div>

      {supplierModal && <div className="supplier-modal-backdrop" onMouseDown={(event) => {
        if (event.target === event.currentTarget && !savingSupplier) setSupplierModal(null);
      }}>
        <section className="supplier-modal" role="dialog" aria-modal="true" aria-labelledby="supplierFormTitle">
          <header className="supplier-modal-head"><div><span className="supplier-eyebrow">{supplierModal.mode === 'edit' ? 'CADASTRO' : 'NOVO PARCEIRO'}</span><h2 id="supplierFormTitle">{supplierModal.mode === 'edit' ? 'Editar fornecedor' : 'Cadastrar fornecedor'}</h2></div><button type="button" className="supplier-close" onClick={() => setSupplierModal(null)} aria-label="Fechar">×</button></header>
          <form onSubmit={saveSupplier} className="supplier-form">
            <div className="supplier-form-section"><strong>Informações gerais</strong><span>Dados de identificação e contato do parceiro.</span></div>
            <div className="supplier-form-grid">
              <label className="supplier-field"><span>Nome fantasia *</span><input name="nome" required minLength="2" maxLength="160" value={supplierForm.nome} onChange={setSupplierField} /></label>
              <label className="supplier-field"><span>Razão social</span><input name="razao_social" maxLength="180" value={supplierForm.razao_social || ''} onChange={setSupplierField} /></label>
              <label className="supplier-field"><span>CNPJ</span><input name="cnpj" inputMode="numeric" maxLength="18" value={supplierForm.cnpj || ''} onChange={setSupplierField} placeholder="00.000.000/0000-00" /></label>
              <label className="supplier-field"><span>Categoria</span><input name="categoria" maxLength="80" value={supplierForm.categoria || ''} onChange={setSupplierField} placeholder="Ex.: Bebidas" /></label>
              <label className="supplier-field"><span>Contato</span><input name="contato" maxLength="120" value={supplierForm.contato || ''} onChange={setSupplierField} /></label>
              <label className="supplier-field"><span>Telefone</span><input name="telefone" type="tel" maxLength="30" value={supplierForm.telefone || ''} onChange={setSupplierField} /></label>
              <label className="supplier-field"><span>E-mail</span><input name="email" type="email" maxLength="254" value={supplierForm.email || ''} onChange={setSupplierField} /></label>
              <label className="supplier-field"><span>Prazo de pagamento (dias)</span><input name="prazo_pagamento" type="number" min="0" max="365" step="1" value={supplierForm.prazo_pagamento} onChange={setSupplierField} /></label>
            </div>
            <div className="supplier-form-section"><strong>Endereço e observações</strong><span>Informações úteis para recebimento e contato.</span></div>
            <div className="supplier-form-grid">
              <label className="supplier-field supplier-field-wide"><span>Endereço</span><input name="endereco" maxLength="220" value={supplierForm.endereco || ''} onChange={setSupplierField} /></label>
              <label className="supplier-field"><span>Cidade</span><input name="cidade" maxLength="100" value={supplierForm.cidade || ''} onChange={setSupplierField} /></label>
              <label className="supplier-field"><span>UF</span><input name="estado" maxLength="2" value={supplierForm.estado || ''} onChange={setSupplierField} placeholder="SP" /></label>
              <label className="supplier-field"><span>CEP</span><input name="cep" maxLength="12" value={supplierForm.cep || ''} onChange={setSupplierField} /></label>
              <label className="supplier-field supplier-field-wide"><span>Observações</span><textarea name="observacoes" rows="3" maxLength="2000" value={supplierForm.observacoes || ''} onChange={setSupplierField} /></label>
            </div>
            <label className="supplier-checkbox"><input name="ativo" type="checkbox" checked={Boolean(supplierForm.ativo)} onChange={setSupplierField} /><span>Fornecedor ativo</span></label>
            <footer className="supplier-modal-actions"><button type="button" className="button secondary" onClick={() => setSupplierModal(null)} disabled={savingSupplier}>Cancelar</button><button type="submit" className="button" disabled={savingSupplier}>{savingSupplier ? 'Salvando…' : 'Salvar fornecedor'}</button></footer>
          </form>
        </section>
      </div>}

      {detail && <div className="supplier-modal-backdrop" onMouseDown={(event) => {
        if (event.target === event.currentTarget) setDetail(null);
      }}>
        <section className="supplier-modal supplier-detail-modal" role="dialog" aria-modal="true" aria-labelledby="supplierDetailTitle">
          <header className="supplier-modal-head"><div><span className="supplier-eyebrow">PERFIL DO PARCEIRO</span><h2 id="supplierDetailTitle">{detail.nome}</h2></div><button type="button" className="supplier-close" onClick={() => setDetail(null)} aria-label="Fechar">×</button></header>
          {detailLoading ? <div className="supplier-loading">Carregando informações…</div> : <>
            <div className="supplier-detail-summary"><span className="supplier-avatar large">{detail.nome?.slice(0, 1).toUpperCase()}</span><div><strong>{detail.razao_social || detail.nome}</strong><span>{detail.cnpj ? `CNPJ ${detail.cnpj}` : 'CNPJ não informado'}</span><span className={`supplier-status ${detail.ativo ? 'active' : 'inactive'}`}>{detail.ativo ? 'Ativo' : 'Inativo'}</span></div></div>
            <div className="supplier-detail-grid">
              <div><span>Categoria</span><strong>{detail.categoria || '—'}</strong></div>
              <div><span>Contato</span><strong>{detail.contato || '—'}</strong></div>
              <div><span>Telefone</span><strong>{detail.telefone || '—'}</strong></div>
              <div><span>E-mail</span><strong>{detail.email || '—'}</strong></div>
              <div><span>Prazo de pagamento</span><strong>{detail.prazo_pagamento ? `${detail.prazo_pagamento} dias` : 'À vista'}</strong></div>
              <div><span>Endereço</span><strong>{[detail.endereco, detail.cidade, detail.estado, detail.cep].filter(Boolean).join(', ') || '—'}</strong></div>
              <div><span>Cadastrado em</span><strong>{date(detail.created_at)}</strong></div>
              {detail.observacoes && <div className="supplier-detail-wide"><span>Observações</span><strong>{detail.observacoes}</strong></div>}
            </div>
            <div className="supplier-history-head"><div><strong>Histórico de pedidos</strong><span>{detail.pedidos?.length || 0} pedidos registrados</span></div></div>
            {detail.pedidos?.length ? <div className="supplier-history">{detail.pedidos.slice(0, 8).map((order) => <div className="supplier-history-row" key={order.id}><div><strong>{order.numero}</strong><span>{date(order.created_at)} · {order.itens?.length || 0} itens</span></div><div><strong>{currency(order.total)}</strong><span className={`supplier-status ${order.email_status === 'sent' ? 'active' : 'pending'}`}>{order.email_status === 'sent' ? 'E-mail enviado' : order.email_status === 'failed' ? 'Falha no envio' : 'Pendente'}</span></div></div>)}</div> : <p className="supplier-history-empty">Ainda não há pedidos para este fornecedor.</p>}
            <footer className="supplier-modal-actions supplier-detail-actions"><button type="button" className="button danger-outline" onClick={() => toggleSupplier(detail)}>{detail.ativo ? 'Desativar' : 'Reativar'}</button><button type="button" className="button secondary" onClick={() => openEditSupplier(detail)}>Editar dados</button><button type="button" className="button" onClick={() => startOrder(detail)} disabled={!detail.ativo}>＋ Criar pedido</button></footer>
          </>}
        </section>
      </div>}
      {orderDialog}
    </>
  );
}
