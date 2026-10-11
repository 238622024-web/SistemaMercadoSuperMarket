export const ROLE_LABELS = {
  admin: 'Administrador',
  cashier: 'Operador de Caixa',
  product_clerk: 'Cadastro de Produtos',
  cashier_product: 'Caixa e Produtos'
};

export const ROLE_ROUTES = {
  admin: null,
  cashier: ['pdv', 'etiqueta-gondola', 'perfil'],
  product_clerk: ['adicionar-produto', 'etiqueta-gondola', 'perfil'],
  cashier_product: ['pdv', 'adicionar-produto', 'etiqueta-gondola', 'perfil']
};

export function roleLabel(role) {
  return ROLE_LABELS[role] || 'Usuário';
}
