-- Sistema POS de Evento — esquema Supabase (Postgres)
-- Todas las escrituras de ventas/movimientos/tiempos son INSERT (nunca UPDATE de
-- acumulados) para evitar conflictos entre los 2 celulares. Los totales
-- (stock, caja, ganancia) se calculan siempre al vuelo, nunca se almacenan.

create table if not exists productos (
  id            bigint generated always as identity primary key,
  nombre        text not null,
  precio_venta  numeric not null,
  costo_compra  numeric not null,
  activo        boolean not null default true,
  creado        timestamptz not null default now()
);

create table if not exists inventario_mov (
  id           bigint generated always as identity primary key,
  producto_id  bigint not null references productos(id),
  sede         smallint not null,
  tipo         text not null check (tipo in ('inicial', 'entrada', 'ajuste')),
  cantidad     int not null, -- puede ser negativo en 'ajuste'
  nota         text,
  ts           timestamptz not null default now()
);

create table if not exists precios_inflable (
  id       bigint generated always as identity primary key,
  minutos  int not null unique,
  precio   numeric,               -- NULL = precio aún no definido por el dueño
  activo   boolean not null default true,
  creado   timestamptz not null default now()
);

insert into precios_inflable (minutos, precio)
values (15, null), (30, null), (45, null), (60, null)
on conflict (minutos) do nothing;

create table if not exists tiempos (
  id           bigint generated always as identity primary key,
  sede         smallint not null,
  nino         text not null,
  responsable  text not null,
  inicio       timestamptz not null,
  minutos      int not null,
  estado       text not null default 'activo' check (estado in ('activo', 'terminado')),
  ts           timestamptz not null default now()
);

create table if not exists ventas (
  id           bigint generated always as identity primary key,
  sede         smallint not null,
  tipo         text not null check (tipo in ('bebida', 'inflable')),
  producto_id  bigint references productos(id),
  cantidad     int not null,
  precio_unit  numeric not null,
  costo_unit   numeric not null,
  total        numeric not null,
  pago_con     numeric,
  cambio       numeric,
  metodo       text not null default 'efectivo',
  tiempo_id    bigint references tiempos(id),
  ts           timestamptz not null default now()
);

create table if not exists caja_mov (
  id     bigint generated always as identity primary key,
  sede   smallint not null,
  tipo   text not null check (tipo in ('fondo', 'retiro')),
  monto  numeric not null,
  nota   text,
  ts     timestamptz not null default now()
);

-- Índices para las consultas de Resumen/Caja (por sede + tiempo)
create index if not exists idx_inventario_mov_producto_sede on inventario_mov(producto_id, sede);
create index if not exists idx_ventas_sede_ts on ventas(sede, ts);
create index if not exists idx_ventas_producto_sede on ventas(producto_id, sede);
create index if not exists idx_caja_mov_sede on caja_mov(sede, ts);
create index if not exists idx_tiempos_sede_estado on tiempos(sede, estado);

-- Sin login (URL no pública protege el acceso): RLS deshabilitado, se usa la
-- anon key directo desde el navegador para leer y escribir.
alter table productos disable row level security;
alter table inventario_mov disable row level security;
alter table ventas disable row level security;
alter table caja_mov disable row level security;
alter table tiempos disable row level security;
alter table precios_inflable disable row level security;
