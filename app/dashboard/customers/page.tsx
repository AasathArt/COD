import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CustomersPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  const businessId = membership?.business_id as string;

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone, orders(status, cod_amount, profit)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Customers</h1>

      {!customers?.length ? (
        <div className="card py-10 text-center">
          <p className="text-sm text-neutral-500">No customers yet.</p>
          <p className="mb-4 text-sm text-neutral-500">Customers are added automatically when you create an order.</p>
          <Link href="/dashboard/orders/new" className="btn-primary inline-flex">
            + Add Order
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map((c) => {
            const orders = (c.orders || []) as { status: string; cod_amount: number; profit: number }[];
            const delivered = orders.filter((o) => o.status === "DELIVERED").length;
            const returned = orders.filter((o) => o.status === "RETURNED").length;
            const totalSpent = orders.reduce((s, o) => s + Number(o.cod_amount || 0), 0);
            const returnRate = orders.length ? ((returned / orders.length) * 100).toFixed(0) : "0";

            return (
              <div key={c.id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-neutral-500">{c.phone}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{orders.length} orders</p>
                    <p className="text-neutral-500">{delivered} delivered</p>
                  </div>
                </div>
                <div className="mt-2 flex justify-between text-xs text-neutral-500">
                  <span>Total spent: {totalSpent.toLocaleString()}</span>
                  <span className={Number(returnRate) >= 30 ? "font-semibold text-red-600" : ""}>
                    Return rate: {returnRate}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
