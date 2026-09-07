import { createClient } from "@/lib/supabase/server";
import { createProduct } from "./actions";

export default async function ProductsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, businesses(currency)")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  const businessId = membership?.business_id as string;
  const currencyCode = (membership?.businesses as unknown as { currency: string })?.currency || "LKR";

  const { data: products } = await supabase
    .from("products")
    .select("id, name, selling_price, cost_price, stock_quantity, low_stock_threshold, active")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Products</h1>

      <details className="card">
        <summary className="cursor-pointer text-sm font-semibold text-brand-blue">+ Add Product</summary>
        <form action={createProduct} className="mt-3 space-y-3">
          <input name="name" required placeholder="Product name" className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <input name="sellingPrice" type="number" min={0} placeholder="Selling price" className="input-field" required />
            <input name="costPrice" type="number" min={0} placeholder="Cost price" className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input name="stockQuantity" type="number" min={0} placeholder="Stock quantity" className="input-field" />
            <input name="lowStockThreshold" type="number" min={0} placeholder="Low stock alert at" className="input-field" defaultValue={5} />
          </div>
          <button type="submit" className="btn-primary w-full">Save Product</button>
        </form>
      </details>

      {!products?.length ? (
        <div className="card py-10 text-center">
          <p className="text-sm text-neutral-500">No products yet.</p>
          <p className="text-sm text-neutral-500">Add a product to speed up order creation and track stock.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((p) => {
            const low = p.stock_quantity <= p.low_stock_threshold;
            return (
              <div key={p.id} className="card flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-neutral-500">
                    {currencyCode} {Number(p.selling_price).toLocaleString()} · cost {Number(p.cost_price).toLocaleString()}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${low ? "text-brand-yellow-dark" : "text-neutral-600"}`}>
                  {p.stock_quantity} in stock
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
