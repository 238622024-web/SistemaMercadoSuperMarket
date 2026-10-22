create table if not exists public.categorias (
    slug text primary key,
    nome text not null check (char_length(trim(nome)) between 2 and 80),
    descricao text check (descricao is null or char_length(descricao) <= 240),
    ativo boolean not null default true,
    created_at timestamptz not null default now()
);

create unique index if not exists categorias_nome_lower_unique
    on public.categorias (lower(nome));

insert into public.categorias (slug, nome)
values
    ('alimentos', 'Alimentos'),
    ('bebidas', 'Bebidas'),
    ('higiene', 'Higiene e Limpeza'),
    ('frios', 'Frios e Laticínios'),
    ('hortifruti', 'Hortifrúti'),
    ('padaria', 'Padaria'),
    ('acougue', 'Açougue'),
    ('outros', 'Outros')
on conflict (slug) do nothing;

update public.produtos as produto
set categoria = categoria_cadastrada.slug
from public.categorias as categoria_cadastrada
where lower(trim(produto.categoria)) = lower(categoria_cadastrada.nome)
  and produto.categoria <> categoria_cadastrada.slug;

insert into public.categorias (slug, nome)
select distinct on (lower(trim(produto.categoria)))
    trim(produto.categoria),
    trim(produto.categoria)
from public.produtos as produto
where produto.categoria is not null
  and trim(produto.categoria) <> ''
  and not exists (
      select 1
      from public.categorias as categoria_cadastrada
      where categoria_cadastrada.slug = trim(produto.categoria)
         or lower(categoria_cadastrada.nome) = lower(trim(produto.categoria))
  )
order by lower(trim(produto.categoria)), trim(produto.categoria)
on conflict (slug) do nothing;

update public.produtos as produto
set categoria = categoria_cadastrada.slug
from public.categorias as categoria_cadastrada
where lower(trim(produto.categoria)) = lower(categoria_cadastrada.nome)
  and produto.categoria <> categoria_cadastrada.slug;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'produtos_categoria_fkey'
          and conrelid = 'public.produtos'::regclass
    ) then
        alter table public.produtos
            add constraint produtos_categoria_fkey
            foreign key (categoria)
            references public.categorias (slug)
            on delete restrict;
    end if;
end
$$;

alter table public.categorias enable row level security;

drop policy if exists categorias_read on public.categorias;
create policy categorias_read
    on public.categorias
    for select
    to anon, authenticated
    using (true);

grant select on public.categorias to anon, authenticated;
grant all on public.categorias to service_role;
