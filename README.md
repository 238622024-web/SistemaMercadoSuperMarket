# SistemaMercadoSuperMarket

## Desenvolvimento

Instale as dependências com `npm install` e execute `npm run dev`. Esse comando
inicia a API Express e o frontend React com Vite. O Vite fica disponível em
`http://localhost:5173` e encaminha as chamadas `/api` para o Express em
`http://localhost:3000`.

## Execução de produção

Execute `npm start`. O comando compila o frontend com Vite e inicia o Express,
que serve os arquivos gerados em `dist` e mantém as rotas `/api` existentes.
Se iniciar o servidor diretamente com `node server.js`, execute `npm run build`
antes para gerar o frontend.
As credenciais do Supabase continuam sendo lidas pelo backend a partir do
arquivo `.env`; nunca configure a chave secreta no frontend.

## Fornecedores e pedidos de compra

Antes de usar **Fornecedores**, execute [`suppliers-purchase-orders.sql`](./supabase/suppliers-purchase-orders.sql)
no SQL Editor do Supabase. A API exige uma `SUPABASE_SERVICE_ROLE_KEY` válida no
servidor e permite a gestão somente a usuários administradores.

Para enviar pedidos por e-mail, configure `SMTP_HOST`, `SMTP_PORT`,
`SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD` e `SMTP_FROM` no `.env`. Se o SMTP
não estiver configurado ou o envio falhar, o pedido permanece salvo e pode ser
reenviado em **Pedidos de Compra** depois de corrigir a configuração.

## Controle de estoque

Depois de executar `suppliers-purchase-orders.sql` e de já existir a tabela
`public.produtos`, execute [`stock-management.sql`](./supabase/stock-management.sql)
no SQL Editor do Supabase. A tela de estoque usa os produtos cadastrados e
registra cada ajuste no histórico. Ajustes e recebimentos são feitos no banco
em uma única transação e exigem `SUPABASE_SERVICE_ROLE_KEY` configurada somente
no servidor.

Novos pedidos de compra exigem selecionar produtos cadastrados. Ao marcar um
pedido como recebido, as quantidades dos itens são adicionadas ao estoque e
registradas no histórico antes de o pedido mudar de status. Pedidos antigos
sem vínculo por ID ainda podem ser recebidos quando o código do item coincide
exatamente com o código ou código de barras de um produto. Se não houver
correspondência, o recebimento é bloqueado sem alterar o pedido nem o estoque;
vincule o item ao produto correto antes de tentar novamente.

## Imagens de produtos

Para permitir imagens no cadastro de produtos, execute
[`product-images.sql`](./supabase/product-images.sql) no SQL Editor do Supabase
e configure `SUPABASE_SERVICE_ROLE_KEY` somente no backend. O formulário aceita
uma imagem PNG, JPG ou WEBP de até 5 MB; ela é armazenada no bucket público
`product-images` e a URL fica registrada em `public.produtos.imagem_url`.
