const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_PATH = path.join(__dirname, 'ProjetoSuperMarket');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    message: 'API do mercado online',
    supabaseConnected: Boolean(supabase),
    mode: supabase ? 'supabase' : 'local'
  });
});

app.get('/api/products', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({
      error: 'Configure SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env'
    });
  }

  const { data, error } = await supabase.from('products').select('*').limit(20);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json(data || []);
});

app.use(express.static(FRONTEND_PATH));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Rota não encontrada' });
  }

  return res.sendFile(path.join(FRONTEND_PATH, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Frontend em ${FRONTEND_PATH}`);
  if (!supabase) {
    console.log('⚠️  Supabase não configurado. Copie o .env.example para .env e informe suas credenciais.');
  }
});
