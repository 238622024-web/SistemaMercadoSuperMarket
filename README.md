# SistemaMercadoSuperMarket

## Desenvolvimento

Instale as dependências com `npm install` e execute `npm run dev`. Esse comando
inicia a API Express e o frontend React com Vite. O Vite fica disponível em
`http://localhost:5173` e encaminha as chamadas `/api` para o Express em
`http://localhost:3000`.

## Execução de produção

Execute `npm start`. O comando compila o frontend com Vite e inicia o Express,
que serve os arquivos gerados em `dist` e mantém as rotas `/api` existentes.
As credenciais do Supabase continuam sendo lidas pelo backend a partir do
arquivo `.env`; nunca configure a chave secreta no frontend.
