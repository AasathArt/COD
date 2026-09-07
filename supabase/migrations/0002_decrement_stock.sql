-- Atomic stock decrement, called when an order transitions to DELIVERED.
-- Kept server-side so concurrent order updates can't race each other into a
-- negative-stock bug.
create or replace function decrement_stock(p_product_id uuid, p_quantity integer)
returns void as $$
begin
  update products
  set stock_quantity = greatest(stock_quantity - p_quantity, 0)
  where id = p_product_id
    and is_business_member((select business_id from products where id = p_product_id));
end;
$$ language plpgsql security definer;
