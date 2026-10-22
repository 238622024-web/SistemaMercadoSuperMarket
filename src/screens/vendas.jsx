import { useCallback, useEffect, useMemo, useState } from 'react';
import pageCss from '../../ProjetoSuperMarket/vendas/style.css?inline';
import salesCss from './vendas.css?inline';
import sidebarCss from "../../ProjetoSuperMarket/sidebar.css?inline";
import Sidebar from "../Sidebar.jsx";
import { authorizedFetch } from '../auth.js';

const paymentLabels = {
  money: 'Dinheiro',
  debit: 'Cartão de débito',
  credit: 'Cartão de crédito',
  pix: 'PIX',
  elo_meal: 'Elo Refeição',
  elo_food: 'Elo Alimentação'
};
const currency = (value) => Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatSaleDate = (value) => new Date(value).toLocaleString('pt-BR');

export default function vendasScreen() {
  const [sales, setSales] = useState([]);
  const [search, setSearch] = useState('');
  const [payment, setPayment] = useState('');
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSales = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await authorizedFetch('/api/pdv/sales');
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar o histórico de vendas.');
      setSales(Array.isArray(result.data) ? result.data : []);
    } catch (failure) {
      setError(failure.message || 'Não foi possível carregar o histórico de vendas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const filteredSales = useMemo(() => {
    const now = new Date();
    let startDate = null;
    if (period === 'today') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === '7d') startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (period === '30d') startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    if (period === 'month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const term = search.trim().toLocaleLowerCase('pt-BR');

    return sales.filter((sale) => {
      const matchesPeriod = !startDate || new Date(sale.created_at) >= startDate;
      const matchesPayment = !payment || sale.payment_method === payment;
      const matchesSearch = !term || `${sale.sale_number} ${sale.operator_name} ${paymentLabels[sale.payment_method] || sale.payment_method}`
        .toLocaleLowerCase('pt-BR').includes(term);
      return matchesPeriod && matchesPayment && matchesSearch;
    });
  }, [payment, period, sales, search]);

  const total = filteredSales.reduce((sum, sale) => sum + Number(sale.total || 0), 0);
  const average = filteredSales.length ? total / filteredSales.length : 0;
  const soldUnits = filteredSales.reduce((sum, sale) =>
    sum + (sale.pdv_sale_items || []).reduce((itemSum, item) => itemSum + Number(item.quantity || 0), 0), 0);

  return <><style>{pageCss}</style><style>{salesCss}</style><style>{sidebarCss}</style><div className="legacy-screen">
    <div className="app">
      <Sidebar />
      <div className="mobile-overlay" id="overlay"></div>
      <main className="main" id="main">
        <header className="header">
          <div className="header-left">
            <button className="menu-toggle" data-legacy-action="toggleSidebar()" aria-label="Abrir menu">
              <svg viewBox="0 0 24 24">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
              </svg>
            </button>
            <h1 className="header-title">Histórico de Vendas</h1>
          </div>
        </header>
        <section className="page-content">
          <div className="breadcrumb">
            <a href="/dashboard">Início</a><span>/</span><a href="/pdv">Vendas</a><span>/</span><span>Histórico</span>
          </div>
          <div className="page-intro">
            <h2>Histórico de vendas</h2>
            <p>
              Consulte, filtre e acompanhe todas as vendas realizadas no
              sistema.
            </p>
          </div>
          <div className="toolbar">
            <div className="field">
              <label htmlFor="period">Período</label><select id="period" value={period} onChange={(event) => setPeriod(event.target.value)}>
                <option value="today">Hoje</option>
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="month">Este mês</option>
                <option value="all">Todo o período</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="search">Buscar venda</label><input id="search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Código ou operador" />
            </div>
            <div className="field">
              <label htmlFor="payment">Pagamento</label><select id="payment" value={payment} onChange={(event) => setPayment(event.target.value)}>
                <option value="">Todos</option>
                {Object.entries(paymentLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </div>
            <button className="button" type="button" onClick={() => void loadSales()} disabled={loading}>
              <svg viewBox="0 0 24 24">
                <path d="M9.5 3a6.5 6.5 0 0 0 0 13c1.61 0 3.09-.59 4.23-1.57L19.29 20 20.7 18.59l-5.98-5.98A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 0 0 9.5 3zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9z"></path></svg>Atualizar</button><button className="button secondary" type="button" data-legacy-action="window.print()">
              Exportar
            </button>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-label">Vendas no período</div>
              <div className="stat-value" id="salesCount">{loading ? '—' : filteredSales.length}</div>
              <div className="stat-meta">Vendas registradas no período</div>
            </div>
            <div className="stat">
              <div className="stat-label">Faturamento</div>
              <div className="stat-value">{loading ? '—' : currency(total)}</div>
              <div className="stat-meta">Soma das vendas encontradas</div>
            </div>
            <div className="stat">
              <div className="stat-label">Ticket médio</div>
              <div className="stat-value">{loading ? '—' : currency(average)}</div>
              <div className="stat-meta neutral">Média por venda</div>
            </div>
            <div className="stat">
              <div className="stat-label">Itens vendidos</div>
              <div className="stat-value">{loading ? '—' : soldUnits.toLocaleString('pt-BR', { maximumFractionDigits: 3 })}</div>
              <div className="stat-meta neutral">Quantidade total no período</div>
            </div>
          </div>
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Vendas realizadas</div>
                <div className="panel-caption">
                  {loading ? 'Carregando vendas...' : `${filteredSales.length} registros encontrados`}
                </div>
              </div>
              <button className="button secondary" type="button" onClick={() => void loadSales()} disabled={loading}>Atualizar lista</button>
            </div>
            {error && <p className="sales-load-error" role="alert">{error}</p>}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Venda</th>
                    <th>Data e hora</th>
                    <th>Operador / Caixa</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="salesTable">
                  {loading ? <tr><td colSpan="7" role="status">Carregando vendas...</td></tr> :
                    filteredSales.length ? filteredSales.map((sale) => (
                      <tr key={sale.id}>
                        <td><strong>#{sale.sale_number}</strong></td>
                        <td>{formatSaleDate(sale.created_at)}</td>
                        <td>{sale.operator_name} · Caixa {sale.register_number}</td>
                        <td className="payment">{paymentLabels[sale.payment_method] || sale.payment_method}</td>
                        <td><strong>{currency(sale.total)}</strong></td>
                        <td><span className="status">Concluída</span></td>
                        <td>
                          <details className="sale-items-details">
                            <summary aria-label={`Ver itens da venda ${sale.sale_number}`}>›</summary>
                            <ul>{(sale.pdv_sale_items || []).map((item) => <li key={item.id}>{item.product_name} — {Number(item.quantity).toLocaleString('pt-BR', { maximumFractionDigits: 3 })} × {currency(item.unit_price)}</li>)}</ul>
                          </details>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="7">Nenhuma venda registrada para os filtros selecionados.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
    
      
      


</div></>;
}
