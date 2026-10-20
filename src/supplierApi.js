import { authorizedFetch } from './auth.js';

export async function supplierApi(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.body !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await authorizedFetch(`/api${path}`, { ...options, headers });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || 'Não foi possível concluir a operação.');
    error.status = response.status;
    error.data = result;
    throw error;
  }
  return result;
}
