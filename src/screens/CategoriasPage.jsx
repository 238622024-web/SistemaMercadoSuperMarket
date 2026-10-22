import { useCallback, useEffect, useMemo, useState } from 'react';
import pageCss from '../../ProjetoSuperMarket/categorias/style.css?inline';
import sidebarCss from '../../ProjetoSuperMarket/sidebar.css?inline';
import Sidebar from '../Sidebar.jsx';
import { supplierApi } from '../supplierApi.js';

const quantity = (value) => Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 3 });

const categoryArtwork = [
  { match: /alimento|mercearia/, image: '🛒', tone: 'grocery' },
  { match: /bebida/, image: '🥤', tone: 'drinks' },
  { match: /higiene|limpeza/, image: '🧴', tone: 'cleaning' },
  { match: /frios|latic[ií]nio/, image: '🧀', tone: 'dairy' },
  { match: /hortifr[uú]ti|fruta|verdura/, image: '🥑', tone: 'produce' },
  { match: /padaria|p[aã]o/, image: '🥖', tone: 'bakery' },
  { match: /a[cç]ougue|carne/, image: '🥩', tone: 'meat' },
  { match: /outro/, image: '🛍️', tone: 'other' }
];

function CategoryArtwork({ category }) {
  const searchText = `${category.slug} ${category.nome}`.toLocaleLowerCase('pt-BR');
  const artwork = categoryArtwork.find((item) => item.match.test(searchText)) || {
    image: '📦',
    tone: 'default'
  };
  return (
    <span className={`category-icon category-artwork ${artwork.tone}`} aria-hidden="true">
      <span>{artwork.image}</span>
    </span>
  );
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const result = await supplierApi('/categories');
      setCategories(result.data || []);
    } catch (error) {
      setLoadError(error.message || 'Não foi possível carregar as categorias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadCategories(); }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR');
    return categories.filter((category) => {
      const matchesSearch = !term || [category.nome, category.descricao]
        .some((value) => String(value || '').toLocaleLowerCase('pt-BR').includes(term));
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' ? category.ativo : !category.ativo);
      return matchesSearch && matchesStatus;
    });
  }, [categories, search, statusFilter]);

  const saveCategory = async (event) => {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      nome: String(form.get('nome') || '').trim(),
      descricao: String(form.get('descricao') || '').trim()
    };
    setSaving(true);
    setNotice(null);
    try {
      const isEditing = Boolean(editing?.slug);
      const result = await supplierApi(
        isEditing ? `/categories/${encodeURIComponent(editing.slug)}` : '/categories',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify(payload)
        }
      );
      if (isEditing) {
        setCategories((current) => current.map((item) => item.slug === result.data.slug
          ? { ...item, ...result.data }
          : item));
      } else {
        setCategories((current) => [...current, result.data].sort((left, right) => left.nome.localeCompare(right.nome, 'pt-BR')));
      }
      setEditing(null);
      setNotice({ type: 'success', text: isEditing ? 'Categoria atualizada com sucesso.' : 'Categoria criada com sucesso.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível salvar a categoria.' });
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = async (category) => {
    setNotice(null);
    try {
      const result = await supplierApi(`/categories/${encodeURIComponent(category.slug)}`, {
        method: 'PATCH',
        body: JSON.stringify({ ativo: !category.ativo })
      });
      setCategories((current) => current.map((item) => item.slug === category.slug
        ? { ...item, ...result.data }
        : item));
      setNotice({ type: 'success', text: `Categoria ${result.data.ativo ? 'ativada' : 'desativada'} com sucesso.` });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível atualizar o status da categoria.' });
    }
  };

  const deleteCategory = async (category) => {
    if (category.produtos > 0 || !window.confirm(`Excluir a categoria "${category.nome}"?`)) return;
    setNotice(null);
    try {
      await supplierApi(`/categories/${encodeURIComponent(category.slug)}`, { method: 'DELETE' });
      setCategories((current) => current.filter((item) => item.slug !== category.slug));
      setNotice({ type: 'success', text: 'Categoria excluída com sucesso.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message || 'Não foi possível excluir a categoria.' });
    }
  };

  const exportCategories = () => {
    const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = [
      ['Categoria', 'Descrição', 'Produtos', 'Estoque', 'Status'],
      ...filteredCategories.map((category) => [
        category.nome,
        category.descricao,
        category.produtos,
        category.estoque,
        category.ativo ? 'Ativa' : 'Inativa'
      ])
    ].map((line) => line.map(escapeCsv).join(';'));
    const file = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'categorias.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const activeCount = categories.filter((category) => category.ativo).length;
  const productCount = categories.reduce((total, category) => total + Number(category.produtos || 0), 0);
  const stockTotal = categories.reduce((total, category) => total + Number(category.estoque || 0), 0);

  return (
    <>
      <style>{pageCss}</style>
      <style>{sidebarCss}</style>
      <div className="legacy-screen">
        <div className="app-container">
          <Sidebar />
          <div className="sidebar-overlay" id="sidebarOverlay" />
          <main className="main-content" id="mainContent">
            <header className="header">
              <div className="header-left">
                <button className="menu-toggle" id="menuToggle" aria-label="Abrir menu">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" /></svg>
                </button>
                <h1 className="header-title">Categorias</h1>
              </div>
            </header>

            <div className="page-content">
              <div className="page-header">
                <div className="page-breadcrumb">
                  <span>Gerenciamento</span><span className="breadcrumb-separator">/</span>
                  <span>Produtos</span><span className="breadcrumb-separator">/</span>
                  <span style={{ color: '#667eea' }}>Categorias</span>
                </div>
                <p className="page-subtitle">Organize os produtos do seu supermercado por tipo e segmento.</p>
              </div>

              <div className="stats-grid">
                <div className="stat-card"><div className="stat-header"><div className="stat-icon blue" aria-hidden="true">#</div><div className="stat-info"><h3>{categories.length}</h3><p>Total de categorias</p></div></div></div>
                <div className="stat-card"><div className="stat-header"><div className="stat-icon green" aria-hidden="true">✓</div><div className="stat-info"><h3>{activeCount}</h3><p>Categorias ativas</p></div></div></div>
                <div className="stat-card"><div className="stat-header"><div className="stat-icon orange" aria-hidden="true">▣</div><div className="stat-info"><h3>{productCount}</h3><p>Produtos categorizados</p></div></div></div>
                <div className="stat-card"><div className="stat-header"><div className="stat-icon red" aria-hidden="true">↗</div><div className="stat-info"><h3>{quantity(stockTotal)}</h3><p>Unidades em estoque</p></div></div></div>
              </div>

              <section className="content-section" aria-label="Gerenciamento de categorias">
                <div className="section-toolbar">
                  <div className="toolbar-left">
                    <label className="search-box">
                      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                      <input value={search} onChange={(event) => setSearch(event.target.value)} type="search" placeholder="Buscar categoria..." aria-label="Buscar categoria" />
                    </label>
                    <select className="filter-btn" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por status">
                      <option value="all">Todos os status</option>
                      <option value="active">Ativas</option>
                      <option value="inactive">Inativas</option>
                    </select>
                  </div>
                  <div className="toolbar-right">
                    <button type="button" className="btn-secondary" onClick={exportCategories} disabled={!filteredCategories.length}>Exportar CSV</button>
                    <button type="button" className="btn-primary" onClick={() => { setNotice(null); setEditing({ nome: '', descricao: '' }); }}>+ Nova categoria</button>
                  </div>
                </div>

                {notice && <div className={`category-notice ${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}</div>}
                {loadError ? (
                  <div className="category-empty category-error" role="alert">
                    <p>{loadError}</p>
                    <button type="button" className="btn-secondary" onClick={() => void loadCategories()}>Tentar novamente</button>
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Categoria</th><th>Produtos</th><th>Estoque</th><th>Status</th><th>Ações</th></tr></thead>
                      <tbody>
                        {loading ? (
                          <tr><td colSpan="5" className="category-empty">Carregando categorias...</td></tr>
                        ) : filteredCategories.length === 0 ? (
                          <tr><td colSpan="5" className="category-empty">{categories.length ? 'Nenhuma categoria corresponde aos filtros.' : 'Nenhuma categoria cadastrada.'}</td></tr>
                        ) : filteredCategories.map((category) => (
                          <tr key={category.slug}>
                            <td><div className="category-meta"><CategoryArtwork category={category} /><div className="category-name"><strong>{category.nome}</strong><span>{category.descricao || 'Sem descrição'}</span></div></div></td>
                            <td>{quantity(category.produtos)}</td>
                            <td>{quantity(category.estoque)}</td>
                            <td><span className={`category-badge ${category.ativo ? 'badge-green' : 'badge-orange'}`}>{category.ativo ? 'Ativa' : 'Inativa'}</span></td>
                            <td><div className="actions">
                              <button type="button" className="action-btn" aria-label={`Editar ${category.nome}`} title="Editar categoria" onClick={() => { setNotice(null); setEditing(category); }}>✎</button>
                              <button type="button" className="category-action-text" onClick={() => void toggleCategory(category)}>{category.ativo ? 'Desativar' : 'Ativar'}</button>
                              <button type="button" className="category-action-text danger" disabled={category.produtos > 0} title={category.produtos ? 'Reclassifique os produtos antes de excluir.' : 'Excluir categoria'} onClick={() => void deleteCategory(category)}>Excluir</button>
                            </div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="pagination">
                  <div className="pagination-info">Exibindo <strong>{filteredCategories.length}</strong> de <strong>{categories.length}</strong> categorias</div>
                </div>
              </section>
            </div>
          </main>
        </div>

        {editing && (
          <div className="category-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setEditing(null); }}>
            <section className="category-modal" role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
              <div className="category-modal-heading">
                <div><h2 id="category-modal-title">{editing.slug ? 'Editar categoria' : 'Nova categoria'}</h2><p>Os produtos vinculados usam esta categoria no cadastro e na consulta.</p></div>
                <button type="button" className="action-btn" aria-label="Fechar" disabled={saving} onClick={() => setEditing(null)}>×</button>
              </div>
              <form className="category-form" onSubmit={saveCategory}>
                <label>Nome da categoria<input name="nome" defaultValue={editing.nome} required minLength="2" maxLength="80" autoFocus /></label>
                <label>Descrição <span>(opcional)</span><textarea name="descricao" defaultValue={editing.descricao || ''} maxLength="240" rows="3" /></label>
                {notice?.type === 'error' && <p className="category-form-error" role="alert">{notice.text}</p>}
                <div className="category-form-actions">
                  <button type="button" className="btn-secondary" disabled={saving} onClick={() => setEditing(null)}>Cancelar</button>
                  <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar categoria'}</button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </>
  );
}
