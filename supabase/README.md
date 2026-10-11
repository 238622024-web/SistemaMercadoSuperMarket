# Acesso e colaboradores

## Criar o primeiro administrador

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e entre na conta proprietária do projeto.
2. Abra o projeto que corresponde à URL em `SUPABASE_URL` no arquivo `.env`.
3. Vá a **Authentication > Users > Add user > Create new user**.
4. Cadastre `keila@supermarket.com.br`, escolha uma senha e confirme a criação.
5. Abra **SQL Editor > New query** e execute o comando abaixo para conceder o papel de administradora:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object(
    'role', 'admin',
    'is_active', true,
    'must_change_password', false
  )
where lower(email) = lower('keila@supermarket.com.br')
returning id, email, raw_app_meta_data;
```

Confirme que a consulta retornou o e-mail e o papel `admin`. Volte à tela de login do sistema e use esse e-mail e a senha escolhida. Se já estava tentando entrar, atualize a página para iniciar uma sessão nova.

## Chaves do `.env`

- `SUPABASE_URL`: URL do projeto Supabase.
- `SUPABASE_ANON_KEY`: chave pública `publishable`/`anon`, usada para login e validação de sessão.
- `SUPABASE_SERVICE_ROLE_KEY`: chave privada `sb_secret_...` (ou legacy `service_role`), usada apenas pelo servidor para criar e administrar colaboradores.

Não coloque a chave privada em código de navegador, em uma variável `VITE_*`, nem no chat. Se o projeto ainda não tiver uma chave secreta configurada, o login de administrador pode funcionar, mas o gerenciamento de colaboradores ficará indisponível até o servidor receber essa chave.

## Colaboradores

Depois de entrar como administradora, abra **Sistema > Colaboradores** e selecione o cargo adequado:

- `admin` (Administrador): acesso completo;
- `cashier` (Operador de Caixa): PDV, consulta de produtos, etiquetas e perfil;
- `product_clerk` (Cadastro de Produtos): cadastrar produtos novos, consultar produtos, etiquetas e perfil;
- `cashier_product` (Caixa e Produtos): PDV, cadastro e consulta de produtos, etiquetas e perfil.

Nenhum cargo operacional pode editar ou desativar produtos já existentes. Contas novas começam com uma senha temporária e precisam trocá-la no primeiro acesso. O backend verifica as permissões e impede desativar o último administrador ativo.

Em **Meu Perfil**, qualquer usuário ativo pode salvar o nome, pedir a alteração do e-mail e alterar a senha informando a senha atual. A alteração de e-mail segue as opções de confirmação habilitadas em **Authentication > Settings** no Supabase; quando houver confirmação pendente, o endereço anterior continua válido até a confirmação.

## Turnos dos caixas do PDV

Para controlar os dois caixas, entre em **SQL Editor > New query** no Supabase e execute o conteúdo de [`pdv-shifts.sql`](./pdv-shifts.sql). A tabela guarda o operador, o cargo, os horários e os valores de abertura e fechamento. O banco impede que o mesmo operador ou caixa tenha mais de um turno aberto ao mesmo tempo.

Mantenha `SUPABASE_SERVICE_ROLE_KEY` configurada apenas no backend: a API usa essa chave para registrar os turnos com segurança. No PDV, cada operador abre o Caixa 1 ou 2 informando o fundo inicial; ao terminar, informa o valor contado para fechar o turno.

Em produção, publique o sistema somente por HTTPS.
