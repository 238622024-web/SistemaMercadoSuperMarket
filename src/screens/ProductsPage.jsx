import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ProductMarkup from './produtos.jsx';
import { authorizedFetch } from '../auth.js';
import { supplierApi } from '../supplierApi.js';

const currency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const unit = (value) =>
  ({ un: 'UN', kg: 'KG', g: 'G', l: 'L', ml: 'ML', cx: 'CX', pc: 'PC' })[value] || value || 'UN';
const category = (value) =>
  ({
    alimentos: 'Alimentos',
    bebidas: 'Bebidas',
    higiene: 'Higiene e Limpeza',
    frios: 'Frios e Laticínios',
    hortifruti: 'Hortifrúti',
    padaria: 'Padaria',
    acougue: 'Açougue',
    outros: 'Outros'
  })[value] || value || 'Sem categoria';
const date = (value) => {
  const found = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return found ? `${found[3]}/${found[2]}/${found[1]}` : value || '-';
};

import Sidebar from "../Sidebar.jsx";
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectAll, setSelectAll] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pendingDeactivate, setPendingDeactivate] = useState(null);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [error, setError] = useState('');
  const [loadingError, setLoadingError] = useState('');
  const [checked, setChecked] = useState({});
  const [saving, setSaving] = useState(false);
  const [supplierOptions, setSupplierOptions] = useState([]);
  const [supplierLoadError, setSupplierLoadError] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryLoadError, setCategoryLoadError] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageName, setImageName] = useState('');
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    let active = true;
    supplierApi('/suppliers/options')
      .then((result) => { if (active) setSupplierOptions(result.data || []); })
      .catch((failure) => {
        if (active) setSupplierLoadError(failure.message || 'Não foi possível carregar os fornecedores.');
      });
    supplierApi('/categories')
      .then((result) => { if (active) setCategoryOptions(result.data || []); })
      .catch((failure) => {
        if (active) setCategoryLoadError(failure.message || 'Não foi possível carregar as categorias.');
      });
    return () => { active = false; };
  }, []);

  const loadProducts = useCallback(async (query = search) => {
    setLoadingError('');
    try {
      const params = new URLSearchParams({ active: 'all' });
      if (query.trim()) params.set('search', query.trim());
      const response = await authorizedFetch(`/api/products?${params}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Não foi possível carregar os produtos.');
      const values = Array.isArray(result) ? result : result.data || [];
      setProducts(values);
      setChecked({});
      setSelectAll(false);
    } catch (failure) {
      setLoadingError(failure.message || 'Erro de comunicação ao carregar os produtos.');
    }
  }, [search]);

  useEffect(() => {
    const timer = window.setTimeout(() => loadProducts(search), search ? 250 : 0);
    return () => window.clearTimeout(timer);
  }, [loadProducts, search]);

  useEffect(() => {
    if (!selected && !confirming) document.body.classList.remove('modal-open');
    else document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [selected, confirming]);

  useEffect(() => {
    const escape = (event) => {
      if (event.key === 'Escape') {
        setConfirming(false);
        setSelected(null);
        setEditing(false);
      }
    };
    document.addEventListener('keydown', escape);
    return () => document.removeEventListener('keydown', escape);
  }, []);

  const rows = useMemo(() => {
    if (loadingError) {
      return <tr><td colSpan="8" className="product-load-error">{loadingError}<br /><button type="button" onClick={() => loadProducts(search)}>Tentar novamente</button></td></tr>;
    }
    if (!products.length) {
      return <tr><td colSpan="8" className="product-empty">Nenhum produto encontrado. Cadastre um produto para começar.</td></tr>;
    }
    return products.map((product) => {
      const inactive = product.ativo === false;
      const stock = Number(product.estoque_atual || 0);
      const low = stock <= Number(product.estoque_minimo || 0);
      const status = inactive ? 'Inativo' : low ? 'Estoque baixo' : 'Ativo';
      const statusClass = inactive ? 'inactive' : low ? 'low-stock' : 'active';
      return (
        <tr key={product.id} data-product-id={product.id}>
          <td><input type="checkbox" className="row-checkbox" aria-label={`Selecionar ${product.nome}`} checked={Boolean(checked[product.id])} onChange={(event) => {
            const next = { ...checked, [product.id]: event.target.checked };
            setChecked(next);
            setSelectAll(products.length > 0 && products.every((item) => next[item.id]));
          }} /></td>
          <td><div className="product-details" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {product.imagem_url && <img src={product.imagem_url} alt="" loading="lazy" style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />}
            <div><h4>{product.nome}</h4><small>{product.marca || ''}</small></div>
          </div></td>
          <td>{categoryOptions.find((item) => item.slug === product.categoria)?.nome || category(product.categoria)}</td><td>{currency(product.preco_venda)}</td>
          <td>{stock.toLocaleString('pt-BR')} {unit(product.unidade)}</td>
          <td><span className={`status-badge ${statusClass}`}>{status}</span></td>
          <td><div className="product-actions">
            <button type="button" className="product-action-btn product-action-view" title="Consultar produto" onClick={() => { setSelected(product); setEditing(false); setError(''); setImageDataUrl(''); setImageName(''); setRemoveImage(false); }}>Consultar</button>
            {!inactive && <button type="button" className="product-action-btn product-action-disable" title="Desativar produto" onClick={() => { setPendingDeactivate(product); setConfirmMessage(`Tem certeza de que deseja desativar "${product.nome}"?`); setConfirming(true); }}>Desativar</button>}
          </div></td>
        </tr>
      );
    });
  }, [categoryOptions, checked, loadProducts, loadingError, products, search]);

  const selectedCategoryLabel = categoryOptions.find((item) => item.slug === selected?.categoria)?.nome;

  const details = selected ? [
    ['Nome do produto', selected.nome],
    ['Código/SKU', selected.codigo],
    ['Categoria', selectedCategoryLabel || category(selected.categoria)],
    ['Marca', selected.marca],
    ['Descrição', selected.descricao],
    ['Preço de custo', currency(selected.preco_custo)],
    ['Preço de venda', currency(selected.preco_venda)],
    ['Estoque atual', `${Number(selected.estoque_atual || 0).toLocaleString('pt-BR')} ${unit(selected.unidade)}`],
    ['Estoque mínimo', `${Number(selected.estoque_minimo || 0).toLocaleString('pt-BR')} ${unit(selected.unidade)}`],
    ['Unidade de medida', unit(selected.unidade)],
    ['Código de barras', selected.codigo_barras],
    ['Fornecedor', selected.fornecedor],
    ['Data de validade', date(selected.data_validade)],
    ['Peso', selected.peso_gramas == null ? '-' : `${Number(selected.peso_gramas).toLocaleString('pt-BR')} g`],
    ['Localização', selected.localizacao]
  ].map(([label, value]) => <div className="product-detail-item" key={label}><dt>{label}</dt><dd>{value || '-'}</dd></div>) : null;

  const saveEdit = async (event) => {
    event.preventDefault();
    if (!selected || saving) return;
    const form = new FormData(event.currentTarget);
    const product = Object.fromEntries(form.entries());
    for (const field of ['preco_custo', 'preco_venda', 'estoque_minimo', 'peso_gramas']) {
      product[field] = form.get(field) === '' ? null : Number(form.get(field));
    }
    delete product.estoque_atual;
    if (imageDataUrl) product.imagem_data_url = imageDataUrl;
    if (removeImage) product.remover_imagem = true;
    setSaving(true);
    setError('');
    try {
      const response = await authorizedFetch(`/api/products/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Não foi possível atualizar o produto.');
      const saved = result.data;
      setProducts((current) => current.map((item) => Number(item.id) === Number(saved.id) ? saved : item));
      setSelected(saved);
      setEditing(false);
      setImageDataUrl('');
      setImageName('');
      setRemoveImage(false);
    } catch (failure) {
      setError(failure.message || 'Erro de comunicação ao atualizar o produto.');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async () => {
    const product = pendingDeactivate || selected;
    if (!product) return;
    try {
      const response = await authorizedFetch(`/api/products/${product.id}/deactivate`, { method: 'PATCH' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Não foi possível desativar o produto.');
      setConfirming(false);
      setSelected(null);
      setPendingDeactivate(null);
      await loadProducts(search);
      window.alert('Produto desativado com sucesso.');
    } catch (failure) {
      setConfirming(false);
      setPendingDeactivate(null);
      window.alert(failure.message || 'Erro ao desativar o produto.');
    }
  };

  const openDeactivate = () => {
    if (!selected) return;
    setPendingDeactivate(selected);
    setConfirmMessage(`Tem certeza de que deseja desativar "${selected.nome}"?`);
    setConfirming(true);
  };

  const selectProductImage = (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Selecione uma imagem PNG, JPEG ou WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setError('Não foi possível ler a imagem selecionada.');
        return;
      }
      setImageDataUrl(reader.result);
      setImageName(file.name);
      setRemoveImage(false);
      setError('');
    };
    reader.onerror = () => setError('Não foi possível ler a imagem selecionada.');
    reader.readAsDataURL(file);
  };

  return (
    <ProductMarkup
      rows={rows}
      search={search}
      onSearch={(event) => setSearch(event.target.value)}
      selectAll={selectAll}
      onSelectAll={(event) => {
        const checkedAll = event.target.checked;
        setSelectAll(checkedAll);
        setChecked(Object.fromEntries(products.map((product) => [product.id, checkedAll])));
      }}
      product={selected}
      supplierOptions={supplierOptions}
      supplierLoadError={supplierLoadError}
      categoryOptions={categoryOptions}
      categoryLoadError={categoryLoadError}
      details={details}
      detailHidden={!selected}
      editing={editing}
      onEdit={() => { setError(''); setEditing(true); }}
      onCancelEdit={() => { setEditing(false); setError(''); setImageDataUrl(''); setImageName(''); setRemoveImage(false); }}
      imageDataUrl={imageDataUrl}
      imageName={imageName}
      removeImage={removeImage}
      onImageChange={selectProductImage}
      onRemoveImage={() => {
        if (imageDataUrl) {
          setImageDataUrl('');
          setImageName('');
          return;
        }
        setRemoveImage((current) => !current);
      }}
      onSave={saveEdit}
      saving={saving}
      onClose={() => { setSelected(null); setEditing(false); setImageDataUrl(''); setImageName(''); setRemoveImage(false); }}
      error={error}
      onDeactivate={openDeactivate}
      confirming={confirming}
      confirmMessage={confirmMessage}
      onCancelDeactivate={() => { setConfirming(false); setPendingDeactivate(null); }}
      onConfirmDeactivate={deactivate}
    />
  );
}
