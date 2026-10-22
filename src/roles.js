export const ROLE_LABELS = {
  admin: 'Administrador',
  cashier: 'Operador de Caixa',
  product_clerk: 'Cadastro de Produtos',
  cashier_product: 'Caixa e Produtos'
};

export const ROLE_ROUTES = {
  admin: null,
  cashier: ['pdv', 'vendas', 'etiqueta-gondola', 'perfil', 'ajuda'],
  product_clerk: ['adicionar-produto', 'estoque', 'etiqueta-gondola', 'perfil', 'ajuda'],
  cashier_product: ['pdv', 'vendas', 'adicionar-produto', 'estoque', 'etiqueta-gondola', 'perfil', 'ajuda']
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || 'Usuário';
}
