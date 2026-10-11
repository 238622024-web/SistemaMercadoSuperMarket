const SESSION_KEY = 'supermarket-auth-session';
const listeners = new Set();
let activeSession = null;
let refreshPromise = null;

function readSession() {
  if (activeSession) return activeSession;
  try {
    const stored = window.sessionStorage.getItem(SESSION_KEY);
    activeSession = stored ? JSON.parse(stored) : null;
    return activeSession;
  } catch (error) {
    console.error('Não foi possível recuperar a sessão do navegador.', error);
    throw new Error('Não foi possível recuperar a sessão. Habilite o armazenamento do navegador e tente novamente.');
  }
}

function saveSession(session) {
  activeSession = session;
  try {
    if (session) window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else window.sessionStorage.removeItem(SESSION_KEY);
  } catch (error) {
    activeSession = null;
    console.error('Não foi possível armazenar a sessão do navegador.', error);
    throw new Error('Não foi possível salvar a sessão neste navegador.');
  }
  listeners.forEach((listener) => listener('SIGNED_IN', session));
}

async function refreshSession(session) {
  if (!refreshPromise) {
    refreshPromise = fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refresh_token })
    }).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Sua sessão expirou. Entre novamente.');
      saveSession(result.session);
      return result.session;
    }).catch((error) => {
      saveSession(null);
      throw error;
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export const authClient = {
  auth: {
    async getSession() {
      return { data: { session: readSession() }, error: null };
    },
    onAuthStateChange(callback) {
      listeners.add(callback);
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } };
    },
    async signInWithPassword({ email, password }) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        if (!response.ok) return { data: { session: null }, error: new Error(result.error || 'Não foi possível entrar.') };
        saveSession(result.session);
        return { data: { session: result.session }, error: null };
      } catch (error) {
        return { data: { session: null }, error };
      }
    },
    async signOut() {
      saveSession(null);
      return { error: null };
    }
  }
};

export async function authorizedFetch(url, options = {}) {
  let session = readSession();
  if (!session) throw new Error('Sua sessão expirou. Entre novamente.');
  if (session.expires_at && session.expires_at <= Math.floor(Date.now() / 1000) + 60) {
    session = await refreshSession(session);
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${session.access_token}`);
  return fetch(url, { ...options, headers });
}
