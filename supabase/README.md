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

Depois de entrar como administradora, abra **Sistema > Colaboradores** para criar contas de caixa. O colaborador recebe o papel `cashier`, começa com uma senha temporária e precisa trocá-la no primeiro acesso. Esse papel permite abrir somente **PDV**, **Etiqueta de Gôndola** e **Meu Perfil**. O backend também verifica as permissões.

Em produção, publique o sistema somente por HTTPS.
