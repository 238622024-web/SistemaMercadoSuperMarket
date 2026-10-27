import { useCallback, useEffect, useMemo, useState } from 'react';
import pageCss from '../../ProjetoSuperMarket/contas/style.css?inline';
import sidebarCss from '../../ProjetoSuperMarket/sidebar.css?inline';
import Sidebar from '../Sidebar.jsx';
import { supplierApi } from '../supplierApi.js';

const currency = (value) => Number(value || 0).toLocaleString('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

const date = (value) => value
  ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString('pt-BR')
  : '—';

const today = () => {
  const current = new Date();
  return new Date(current.getTime() - current.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
};

const emptyExpense = {
  descricao: '',
  fornecedor: '',
  categoria: '',
  valor: '',
  data_vencimento: ''
};

function isOverdue(expense) {
  return expense.status !== 'paid' && expense.data_vencimento < today();
}

export default function ContasScreen() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState('all');
  const [tab, setTab] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyExpense);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const loadExpenses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await supplierApi('/financial-expenses');
      setExpenses(result.data || []);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar as despesas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadExpenses(); }, [loadExpenses]);

  const showNotice = (text, type = 'success') => {
    setNotice({ text, type });
    window.setTimeout(() => setNotice(null), 5000);
  };

  const filteredExpenses = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    const now = new Date();
    const firstOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const firstOfFollowingMonth = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    const nextSevenDays = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

    return expenses.filter((expense) => {
      const dueDate = new Date(`${expense.data_vencimento}T00:00:00`);
      const matchesSearch = !term || [
        expense.descricao,
        expense.fornecedor,
        expense.categoria
      ].some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term));
      const matchesTab = tab === 'all' ||
        (tab === 'pending' && expense.status !== 'paid') ||
        (tab === 'paid' && expense.status === 'paid');
      const matchesPeriod = period === 'all' ||
        (period === 'next7' && dueDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate()) && dueDate <= nextSevenDays) ||
        (period === 'currentMonth' && dueDate >= firstOfThisMonth && dueDate < firstOfNextMonth) ||
        (period === 'nextMonth' && dueDate >= firstOfNextMonth && dueDate < firstOfFollowingMonth);
      return matchesSearch && matchesTab && matchesPeriod;
    });
  }, [expenses, search, period, tab]);

  const pendingExpenses = expenses.filter((expense) => expense.status !== 'paid');
  const paidExpenses = expenses.filter((expense) => expense.status === 'paid');
  const overdueExpenses = pendingExpenses.filter(isOverdue);
  const pendingTotal = pendingExpenses.reduce((total, expense) => total + Number(expense.valor || 0), 0);
  const paidTotal = paidExpenses.reduce((total, expense) => total + Number(expense.valor || 0), 0);
  const overdueTotal = overdueExpenses.reduce((total, expense) => total + Number(expense.valor || 0), 0);

  const createExpense = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await supplierApi('/financial-expenses', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          valor: Number(String(form.valor).replace(',', '.'))
        })
      });
      setForm(emptyExpense);
      setFormOpen(false);
      await loadExpenses();
      showNotice('Despesa cadastrada.');
    } catch (saveError) {
      showNotice(saveError.message || 'Não foi possível cadastrar a despesa.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const markAsPaid = async (expense) => {
    setUpdatingId(expense.id);
    try {
      await supplierApi(`/financial-expenses/${expense.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'paid' })
      });
      await loadExpenses();
      showNotice('Despesa marcada como paga.');
    } catch (updateError) {
      showNotice(updateError.message || 'Não foi possível atualizar o pagamento.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setForm(emptyExpense);
  };

  return (
    <>
      <style>{pageCss}</style><style>{sidebarCss}</style>
      <div className="legacy-screen">
        <Sidebar />
        <div className="overlay" id="overlay" />
        <main className="main" id="main">
          <header className="header"><div className="header-left">
            <button className="menu" data-legacy-action="toggleSidebar()" aria-label="Abrir menu">
              <svg viewBox="0 0 24 24"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
            </button>
            <h1>Contas a Pagar</h1>
          </div></header>
          <section className="content">
            <div className="crumb"><a href="/dashboard">Início</a><span>/</span><span>Financeiro</span><span>/</span><span>Contas a pagar</span></div>
            <div className="intro">
              <h2>Contas a pagar</h2>
              <p>Cadastre despesas, acompanhe vencimentos e registre pagamentos.</p>
            </div>
            {notice && <div className={`account-notice ${notice.type}`} role="status">
              <span>{notice.text}</span><button type="button" onClick={() => setNotice(null)} aria-label="Fechar aviso">×</button>
            </div>}
            {error && <div className="account-notice error" role="alert">
              <span>{error}</span><button type="button" onClick={() => void loadExpenses()}>Tentar novamente</button>
            </div>}
            <div className="toolbar">
              <div className="field">
                <label htmlFor="accountSearch">Buscar despesa</label>
                <input id="accountSearch" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Descrição, fornecedor ou categoria" />
              </div>
              <div className="field">
                <label htmlFor="accountPeriod">Vencimento</label>
                <select id="accountPeriod" value={period} onChange={(event) => setPeriod(event.target.value)}>
                  <option value="all">Todos os períodos</option>
                  <option value="next7">Próximos 7 dias</option>
                  <option value="currentMonth">Este mês</option>
                  <option value="nextMonth">Próximo mês</option>
                </select>
              </div>
              <button type="button" className="button secondary" onClick={() => setFormOpen(true)}>+ Nova despesa</button>
            </div>
            <div className="tabs" role="tablist" aria-label="Filtrar despesas por status">
              {[['all', 'Todas'], ['pending', 'Em aberto'], ['paid', 'Pagas']].map(([value, label]) => (
                <button key={value} type="button" role="tab" aria-selected={tab === value} className={`tab${tab === value ? ' active' : ''}`} onClick={() => setTab(value)}>{label}</button>
              ))}
            </div>
            <div className="stats">
              <div className="stat"><div className="label">Total em aberto</div><div className="value">{currency(pendingTotal)}</div><div className="meta red">{pendingExpenses.length} despesa{pendingExpenses.length === 1 ? '' : 's'} pendente{pendingExpenses.length === 1 ? '' : 's'}</div></div>
              <div className="stat"><div className="label">Total pago</div><div className="value">{currency(paidTotal)}</div><div className="meta">{paidExpenses.length} despesa{paidExpenses.length === 1 ? '' : 's'} quitada{paidExpenses.length === 1 ? '' : 's'}</div></div>
              <div className="stat"><div className="label">Vencidas</div><div className="value">{currency(overdueTotal)}</div><div className="meta red">{overdueExpenses.length} despesa{overdueExpenses.length === 1 ? '' : 's'} em atraso</div></div>
              <div className="stat"><div className="label">Despesas cadastradas</div><div className="value">{expenses.length}</div><div className="meta">Inclui pedidos de compra</div></div>
            </div>
            <div className="panel">
              <div className="panel-head"><div><h3>Despesas cadastradas</h3><div className="caption">{filteredExpenses.length} de {expenses.length} despesa{expenses.length === 1 ? '' : 's'}</div></div></div>
              <div className="table-wrap">
                <table className="account-table">
                  <thead><tr><th>Descrição</th><th>Vencimento</th><th>Categoria</th><th>Valor</th><th>Status</th><th>Pagamento</th></tr></thead>
                  <tbody>
                    {filteredExpenses.map((expense) => {
                      const overdue = isOverdue(expense);
                      return <tr key={expense.id}>
                        <td><strong>{expense.descricao}</strong><br /><small>{expense.fornecedor || (expense.purchase_order_id ? 'Pedido de compra' : 'Sem fornecedor')}</small></td>
                        <td>{date(expense.data_vencimento)}</td>
                        <td>{expense.categoria}</td>
                        <td className="expense">{currency(expense.valor)}</td>
                        <td><span className={`status ${expense.status === 'paid' ? 'paid' : overdue ? 'overdue' : 'pending'}`}>{expense.status === 'paid' ? 'Paga' : overdue ? 'Vencida' : 'Pendente'}</span></td>
                        <td>{expense.status === 'paid'
                          ? <span className="account-paid-date">Paga em {date(expense.paid_at)}</span>
                          : <button type="button" className="account-pay-button" disabled={updatingId === expense.id} onClick={() => void markAsPaid(expense)}>{updatingId === expense.id ? 'Salvando…' : 'Marcar paga'}</button>}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
                {loading && <div className="account-empty" role="status">Carregando despesas…</div>}
                {!loading && !filteredExpenses.length && <div className="account-empty">
                  <strong>{expenses.length ? 'Nenhuma despesa encontrada' : 'Ainda não há despesas cadastradas'}</strong>
                  <p>{expenses.length ? 'Altere os filtros ou cadastre uma nova despesa.' : 'Pedidos de compra e despesas manuais aparecerão aqui.'}</p>
                  {!expenses.length && <button type="button" className="button" onClick={() => setFormOpen(true)}>Cadastrar despesa</button>}
                </div>}
              </div>
            </div>
          </section>
        </main>
      </div>

      {formOpen && <div className="account-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
        <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="accountFormTitle">
          <header className="account-modal-head"><div><span className="account-eyebrow">FINANCEIRO</span><h2 id="accountFormTitle">Nova despesa</h2></div><button type="button" className="account-close" onClick={closeForm} disabled={saving} aria-label="Fechar">×</button></header>
          <form onSubmit={createExpense}>
            <div className="account-form">
              <label className="account-form-field account-form-full"><span>Descrição</span><input required maxLength="160" value={form.descricao} onChange={(event) => setForm({ ...form, descricao: event.target.value })} placeholder="Ex.: Conta de energia" /></label>
              <label className="account-form-field"><span>Fornecedor (opcional)</span><input maxLength="160" value={form.fornecedor} onChange={(event) => setForm({ ...form, fornecedor: event.target.value })} placeholder="Nome do fornecedor" /></label>
              <label className="account-form-field"><span>Categoria</span><input required maxLength="80" value={form.categoria} onChange={(event) => setForm({ ...form, categoria: event.target.value })} placeholder="Ex.: Operacional" /></label>
              <label className="account-form-field"><span>Valor (R$)</span><input required type="number" min="0.01" step="0.01" value={form.valor} onChange={(event) => setForm({ ...form, valor: event.target.value })} placeholder="0,00" /></label>
              <label className="account-form-field"><span>Data de vencimento</span><input required type="date" value={form.data_vencimento} onChange={(event) => setForm({ ...form, data_vencimento: event.target.value })} /></label>
            </div>
            <footer className="account-modal-actions"><button type="button" className="button secondary" disabled={saving} onClick={closeForm}>Cancelar</button><button type="submit" className="button" disabled={saving}>{saving ? 'Salvando…' : 'Salvar despesa'}</button></footer>
          </form>
        </section>
      </div>}
    </>
  );
}
