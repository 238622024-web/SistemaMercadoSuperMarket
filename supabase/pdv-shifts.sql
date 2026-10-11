create table if not exists public.pdv_shifts (
    id uuid primary key default gen_random_uuid(),
    register_number smallint not null check (register_number in (1, 2)),
    operator_id uuid not null references auth.users(id),
    operator_name text not null,
    operator_role text not null check (operator_role in ('admin', 'cashier', 'cashier_product')),
    opened_at timestamptz not null default now(),
    closed_at timestamptz,
    opening_cash numeric(12, 2) not null check (opening_cash >= 0),
    closing_cash numeric(12, 2) check (closing_cash is null or closing_cash >= 0),
    check ((closed_at is null and closing_cash is null) or (closed_at is not null and closing_cash is not null))
);

create unique index if not exists pdv_shifts_one_open_per_register
    on public.pdv_shifts (register_number)
    where closed_at is null;

create unique index if not exists pdv_shifts_one_open_per_operator
    on public.pdv_shifts (operator_id)
    where closed_at is null;

alter table public.pdv_shifts enable row level security;
