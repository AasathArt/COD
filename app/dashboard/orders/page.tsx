import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";

export default async function OrdersPage() {
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

  const { data: orders } = await supabase
    .from("orders")
    .select("id, status, cod_amount, profit, waybill, created_at, customers(name, phone)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Orders</h1>
        <Link href="/dashboard/orders/new" className="btn-primary hidden lg:inline-flex">
          + Add Order
        </Link>
      </div>

      {!orders?.length ? (
        <div className="card py-10 text-center">
          <p className="mb-1 text-sm text-neutral-500">No orders yet.</p>
          <p className="mb-4 text-sm text-neutral-500">Create your first COD order to start tracking your business.</p>
          <Link href="/dashboard/orders/new" className="btn-primary inline-flex">
            + Add Order
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => {
            const customer = o.customers as unknown as { name: string; phone: string };
            return (
              <Link
                href={`/dashboard/orders/${o.id}`}
                key={o.id}
                className="card flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">{customer?.name}</p>
                  <p className="text-xs text-neutral-500">{customer?.phone}</p>
                  {o.waybill && <p className="text-xs text-neutral-400">Waybill: {o.waybill}</p>}
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    {currencyCode} {Number(o.cod_amount).toLocaleString()}
                  </p>
                  <StatusBadge status={o.status} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
