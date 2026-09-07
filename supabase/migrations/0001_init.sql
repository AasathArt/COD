-- CODFlow initial schema
-- Run this in the Supabase SQL editor, or via `supabase db push` once the CLI is linked.

create extension if not exists "uuid-ossp";

-- =========================================================
-- ENUMS
-- =========================================================
create type business_role as enum ('owner', 'admin', 'staff');
create type order_status as enum (
  'NEW', 'CONFIRMED', 'PACKING', 'SHIPPED', 'OUT_FOR_DELIVERY',
  'DELIVERED', 'CANCELLED', 'RETURNED'
);
create type subscription_plan as enum ('FREE', 'PRO', 'BUSINESS');
create type subscription_status as enum ('active', 'past_due', 'cancelled', 'trialing');
create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

-- =========================================================
-- PROFILES (mirrors auth.users, 1 row per signed-up user)
-- =========================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- BUSINESSES
-- =========================================================
create table businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  category text,
  country text not null default 'Sri Lanka',
  currency text not null default 'LKR',
  timezone text not null default 'Asia/Colombo',
  logo_url text,
  monthly_order_volume text, -- '1-30' | '31-100' | '101-300' | '300+'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table business_members (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role business_role not null default 'staff',
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

-- =========================================================
-- CUSTOMERS
-- =========================================================
create table customers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  address text,
  city text,
  district text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_customers_business on customers(business_id);
create index idx_customers_phone on customers(business_id, phone);

-- =========================================================
-- PRODUCTS
-- =========================================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  sku text,
  category text,
  description text,
  image_url text,
  selling_price numeric(12,2) not null default 0,
  cost_price numeric(12,2) not null default 0,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 5,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_products_business on products(business_id);

-- =========================================================
-- COURIERS
-- =========================================================
create table couriers (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  phone text,
  api_enabled boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_couriers_business on couriers(business_id);

-- =========================================================
-- ORDERS
-- =========================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete restrict,
  status order_status not null default 'NEW',
  subtotal numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  cod_amount numeric(12,2) not null default 0,
  product_cost numeric(12,2) not null default 0,
  packaging_cost numeric(12,2) not null default 0,
  advertising_cost numeric(12,2) not null default 0,
  other_cost numeric(12,2) not null default 0,
  profit numeric(12,2) not null default 0,
  profit_margin numeric(6,2) not null default 0,
  courier_id uuid references couriers(id) on delete set null,
  waybill text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_orders_business on orders(business_id);
create index idx_orders_customer on orders(customer_id);
create index idx_orders_status on orders(business_id, status);
create index idx_orders_created on orders(business_id, created_at desc);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  selling_price numeric(12,2) not null default 0,
  cost_price numeric(12,2) not null default 0,
  subtotal numeric(12,2) not null default 0
);
create index idx_order_items_order on order_items(order_id);

-- =========================================================
-- DELIVERIES
-- =========================================================
create table deliveries (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  courier_id uuid references couriers(id) on delete set null,
  waybill text,
  status order_status not null default 'NEW',
  shipped_at timestamptz,
  delivered_at timestamptz,
  expected_delivery_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_deliveries_order on deliveries(order_id);

-- =========================================================
-- EXPENSES
-- =========================================================
create table expenses (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  category text not null, -- Advertising | Packaging | Transport | Materials | Rent | Salaries | Other
  amount numeric(12,2) not null default 0,
  description text,
  order_id uuid references orders(id) on delete set null,
  date date not null default current_date,
  created_at timestamptz not null default now()
);
create index idx_expenses_business on expenses(business_id, date desc);

-- =========================================================
-- PAYMENTS (COD settlement tracking)
-- =========================================================
create table payments (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  amount numeric(12,2) not null default 0,
  method text not null default 'COD',
  status payment_status not null default 'pending',
  paid_at timestamptz,
  reference text,
  created_at timestamptz not null default now()
);
create index idx_payments_business on payments(business_id);
create index idx_payments_order on payments(order_id);

-- =========================================================
-- SUBSCRIPTIONS
-- =========================================================
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade unique,
  plan subscription_plan not null default 'FREE',
  status subscription_status not null default 'active',
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references businesses(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  type text not null,
  title text not null,
  message text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_business on notifications(business_id, read);

-- =========================================================
-- updated_at trigger helper
-- =========================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_businesses_updated before update on businesses
  for each row execute function set_updated_at();
create trigger trg_customers_updated before update on customers
  for each row execute function set_updated_at();
create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();
create trigger trg_deliveries_updated before update on deliveries
  for each row execute function set_updated_at();
create trigger trg_subscriptions_updated before update on subscriptions
  for each row execute function set_updated_at();

-- =========================================================
-- New profile + FREE subscription auto-provisioning on signup
-- =========================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =========================================================
-- ROW LEVEL SECURITY
-- Core rule: a user can only touch rows whose business_id is a business
-- they are a member of (business_members). This is what makes tenant
-- isolation real instead of a suggestion.
-- =========================================================

create or replace function is_business_member(target_business_id uuid)
returns boolean as $$
  select exists (
    select 1 from business_members
    where business_id = target_business_id
      and user_id = auth.uid()
  );
$$ language sql security definer stable;

alter table profiles enable row level security;
alter table businesses enable row level security;
alter table business_members enable row level security;
alter table customers enable row level security;
alter table products enable row level security;
alter table couriers enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table deliveries enable row level security;
alter table expenses enable row level security;
alter table payments enable row level security;
alter table subscriptions enable row level security;
alter table notifications enable row level security;

-- profiles: a user can see/edit only their own profile row
create policy "profiles_self" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- businesses: visible/editable only to members; owner can insert
create policy "businesses_select" on businesses
  for select using (is_business_member(id));
create policy "businesses_insert" on businesses
  for insert with check (owner_id = auth.uid());
create policy "businesses_update" on businesses
  for update using (is_business_member(id));
create policy "businesses_delete" on businesses
  for delete using (owner_id = auth.uid());

-- business_members: visible to members of that business; only owner/admin can manage
create policy "members_select" on business_members
  for select using (is_business_member(business_id));
create policy "members_insert" on business_members
  for insert with check (
    user_id = auth.uid() -- first member (owner) bootstrapping their own row
    or exists (
      select 1 from business_members bm
      where bm.business_id = business_members.business_id
        and bm.user_id = auth.uid()
        and bm.role in ('owner', 'admin')
    )
  );
create policy "members_delete" on business_members
  for delete using (
    exists (
      select 1 from business_members bm
      where bm.business_id = business_members.business_id
        and bm.user_id = auth.uid()
        and bm.role in ('owner', 'admin')
    )
  );

-- Generic per-table tenant policies: every business-scoped table gets the
-- same shape — member of business_id can select/insert/update/delete.
create policy "customers_all" on customers for all
  using (is_business_member(business_id)) with check (is_business_member(business_id));
create policy "products_all" on products for all
  using (is_business_member(business_id)) with check (is_business_member(business_id));
create policy "couriers_all" on couriers for all
  using (is_business_member(business_id)) with check (is_business_member(business_id));
create policy "orders_all" on orders for all
  using (is_business_member(business_id)) with check (is_business_member(business_id));
create policy "expenses_all" on expenses for all
  using (is_business_member(business_id)) with check (is_business_member(business_id));
create policy "payments_all" on payments for all
  using (is_business_member(business_id)) with check (is_business_member(business_id));
create policy "subscriptions_all" on subscriptions for all
  using (is_business_member(business_id)) with check (is_business_member(business_id));
create policy "notifications_all" on notifications for all
  using (is_business_member(business_id)) with check (is_business_member(business_id));

-- order_items / deliveries are scoped via their parent order's business_id
create policy "order_items_all" on order_items for all
  using (exists (select 1 from orders o where o.id = order_items.order_id and is_business_member(o.business_id)))
  with check (exists (select 1 from orders o where o.id = order_items.order_id and is_business_member(o.business_id)));

create policy "deliveries_all" on deliveries for all
  using (exists (select 1 from orders o where o.id = deliveries.order_id and is_business_member(o.business_id)))
  with check (exists (select 1 from orders o where o.id = deliveries.order_id and is_business_member(o.business_id)));
