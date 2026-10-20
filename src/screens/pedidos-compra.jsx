import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pageCss from '../../ProjetoSuperMarket/pedidos-compra/style.css?inline';
import sidebarCss from '../../ProjetoSuperMarket/sidebar.css?inline';
import Sidebar from '../Sidebar.jsx';
import { supplierApi } from '../supplierApi.js';
import './pedidos-compra.css';

const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (value) => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR') : '—';
const statuses = { ordered: 'Em aberto', received: 'Recebido', cancelled: 'Cancelado' };

export default function PedidosCompraScreen() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await supplierApi('/purchase-orders');
      setOrders(result.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar os pedidos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return orders.filter((order) => {
      const matchesTerm = !term || [order.numero, order.fornecedor?.nome]
        .some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term));
      return matchesTerm && (!status || order.status === status);
    });
  }, [orders, search, status]);

  const openOrders = orders.filter((order) => order.status === 'ordered');
  const failedEmails = orders.filter((order) => order.email_status !== 'sent');
  const showNotice = (text, type = 'success') => {
    setNotice({ text, type });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const showOrder = async (order) => {
    setSelected(order);
    try {
      const result = await supplierApi(`/purchase-orders/${order.id}`);
      setSelected(result.data);
    } catch (detailError) {
      showNotice(detailError.message || 'Não foi possível carregar o pedido.', 'error');
    }
  };

  const resend = async (order) => {
    setBusy(true);
    try {
      const result = await supplierApi(`/purchase-orders/${order.id}/send`, { method: 'POST' });
      await loadOrders();
      setSelected((current) => current ? { ...current, ...result.data } : current);
      showNotice(result.warning || 'Pedido enviado ao fornecedor.');
    } catch (sendError) {
      await loadOrders();
      showNotice(sendError.message || 'Não foi possível enviar o pedido.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const changeStatus = async (order, nextStatus) => {
    setBusy(true);
    try {
      const result = await supplierApi(`/purchase-orders/${order.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      setSelected((current) => current ? { ...current, ...result.data } : current);
      await loadOrders();
      showNotice(nextStatus === 'received' ? 'Pedido marcado como recebido.' : 'Pedido cancelado.');
    } catch (statusError) {
      showNotice(statusError.message || 'Não foi possível atualizar o pedido.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{pageCss}</style><style>{sidebarCss}</style>
      <div className="legacy-screen purchase-screen">
        <Sidebar />
        <div className="mobile-overlay" id="overlay" />
        <main className="main" id="main">
          <header className="header"><div className="header-left">
            <button className="menu-toggle" data-legacy-action="toggleSidebar()" aria-label="Abrir menu"><svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg></button>
            <h1 className="header-title">Pedidos de Compra</h1>
          </div></header>
          <section className="page-content">
            <div className="breadcrumb"><a href="/dashboard">Início</a><span>/</span><a href="/fornecedores">Fornecedores</a><span>/</span><span>Pedidos de compra</span></div>
            <div className="purchase-intro"><div><span className="supplier-eyebrow">COMPRAS E ABASTECIMENTO</span><h2>Pedidos de compra</h2><p>Acompanhe solicitações, entregas e o envio de cada pedido ao fornecedor.</p></div><button type="button" className="button" onClick={() => navigate('/fornecedores')}>＋ Novo pedido</button></div>
            {notice && <div className={`purchase-alert ${notice.type}`} role="status"><span>{notice.text}</span><button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso">×</button></div>}
            {error && <div className="purchase-alert error" role="alert"><span>{error}</span><button type="button" onClick={loadOrders}>Tentar novamente</button></div>}
            <div className="purchase-stats">
              <article><span className="purchase-stat-icon indigo">▤</span><div><span>Pedidos registrados</span><strong>{orders.length}</strong></div></article>
              <article><span className="purchase-stat-icon amber">◷</span><div><span>Em aberto</span><strong>{openOrders.length}</strong></div></article>
              <article><span className="purchase-stat-icon green">✓</span><div><span>Recebidos</span><strong>{orders.filter((order) => order.status === 'received').length}</strong></div></article>
              <article><span className="purchase-stat-icon rose">✉</span><div><span>Aguardando envio</span><strong>{failedEmails.length}</strong></div></article>
            </div>
            <section className="panel purchase-panel">
              <div className="purchase-toolbar">
                <label className="purchase-search"><span>⌕</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por pedido ou fornecedor" aria-label="Buscar pedido" /></label>
                <select aria-label="Filtrar por status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos os status</option><option value="ordered">Em aberto</option><option value="received">Recebidos</option><option value="cancelled">Cancelados</option></select>
                <span>{filtered.length} pedido{filtered.length === 1 ? '' : 's'}</span>
              </div>
              <div className="table-wrap">
                <table className="purchase-table">
                  <thead><tr><th>Pedido</th><th>Fornecedor</th><th>Emissão</th><th>Previsão</th><th>Itens</th><th>Total</th><th>Status</th><th>E-mail</th><th><span className="sr-only">Ações</span></th></tr></thead>
                  <tbody>{filtered.map((order) => <tr key={order.id}>
                    <td><strong>{order.numero}</strong></td>
                    <td><strong>{order.fornecedor?.nome || 'Fornecedor removido'}</strong><small>{order.fornecedor?.email || 'E-mail não cadastrado'}</small></td>
                    <td>{date(order.created_at)}</td>
                    <td>{date(order.data_entrega)}</td>
                    <td>{order.itens?.length || 0}</td>
                    <td><strong>{currency(order.total)}</strong></td>
                    <td><span className={`purchase-status ${order.status}`}>{statuses[order.status] || order.status}</span></td>
                    <td><span className={`purchase-mail-status ${order.email_status}`}>{order.email_status === 'sent' ? 'Enviado' : order.email_status === 'failed' ? 'Falhou' : 'Pendente'}</span></td>
                    <td><button type="button" className="purchase-view-button" onClick={() => showOrder(order)} aria-label={`Ver pedido ${order.numero}`}>↗</button></td>
                  </tr>)}</tbody>
                </table>
                {!loading && !filtered.length && <div className="purchase-empty"><strong>{orders.length ? 'Nenhum pedido encontrado' : 'Ainda não há pedidos de compra'}</strong><p>{orders.length ? 'Altere os filtros e tente novamente.' : 'Crie um pedido na tela de Fornecedores para começar.'}</p>{!orders.length && <button type="button" className="button" onClick={() => navigate('/fornecedores')}>Ir para fornecedores</button>}</div>}
                {loading && <div className="purchase-empty" role="status">Carregando pedidos…</div>}
              </div>
            </section>
          </section>
        </main>
      </div>

      {selected && <div className="purchase-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) setSelected(null); }}>
        <section className="purchase-modal" role="dialog" aria-modal="true" aria-labelledby="purchaseDetailTitle">
          <header className="purchase-modal-head"><div><span className="supplier-eyebrow">DETALHES DO PEDIDO</span><h2 id="purchaseDetailTitle">{selected.numero}</h2></div><button type="button" className="purchase-close" onClick={() => setSelected(null)} aria-label="Fechar">×</button></header>
          <div className="purchase-detail-meta">
            <div><span>Fornecedor</span><strong>{selected.fornecedor?.nome || '—'}</strong><small>{selected.fornecedor?.email || 'E-mail não cadastrado'}</small></div>
            <div><span>Emissão</span><strong>{date(selected.created_at)}</strong></div>
            <div><span>Previsão de entrega</span><strong>{date(selected.data_entrega)}</strong></div>
            <div><span>Status</span><strong><span className={`purchase-status ${selected.status}`}>{statuses[selected.status] || selected.status}</span></strong></div>
          </div>
          <div className="purchase-item-table-wrap"><table className="purchase-item-table"><thead><tr><th>Produto</th><th>Código</th><th>Quantidade</th><th>Unitário</th><th>Subtotal</th></tr></thead><tbody>{(selected.itens || []).map((item, index) => <tr key={`${item.codigo || item.nome}-${index}`}><td><strong>{item.nome}</strong></td><td>{item.codigo || '—'}</td><td>{item.quantidade} {item.unidade || ''}</td><td>{currency(item.preco_unitario)}</td><td><strong>{currency(item.subtotal)}</strong></td></tr>)}</tbody></table></div>
          <div className="purchase-detail-total"><span>Total do pedido</span><strong>{currency(selected.total)}</strong></div>
          {selected.observacoes && <div className="purchase-notes"><span>Observações</span><p>{selected.observacoes}</p></div>}
          <div className={`purchase-mail-note ${selected.email_status}`}><span>{selected.email_status === 'sent' ? '✓' : '!'}</span><div><strong>{selected.email_status === 'sent' ? 'Pedido enviado por e-mail' : selected.email_status === 'failed' ? 'O envio do e-mail falhou' : 'Envio de e-mail pendente'}</strong><small>{selected.email_sent_at ? `Enviado em ${new Date(selected.email_sent_at).toLocaleString('pt-BR')}` : 'Configure o SMTP para enviar ou reenviar este pedido.'}</small></div></div>
          <footer className="purchase-modal-actions">
            {selected.email_status !== 'sent' && selected.status !== 'cancelled' && <button type="button" className="button secondary" disabled={busy || !selected.fornecedor?.email} onClick={() => resend(selected)}>{busy ? 'Enviando…' : 'Reenviar e-mail'}</button>}
            {selected.status === 'ordered' && <><button type="button" className="purchase-cancel-button" disabled={busy} onClick={() => changeStatus(selected, 'cancelled')}>Cancelar pedido</button><button type="button" className="button" disabled={busy} onClick={() => changeStatus(selected, 'received')}>Marcar recebido</button></>}
          </footer>
        </section>
      </div>}
    </>
  );
}
