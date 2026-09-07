import { createClient } from "@/lib/supabase/server";

export default async function ReportsPage() {
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

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: orders } = await supabase
    .from("orders")
    .select("status, subtotal, profit, created_at")
    .eq("business_id", businessId)
    .gte("created_at", thirtyDaysAgo.toISOString());

  const totalSales = (orders || []).reduce((s, o) => s + Number(o.subtotal), 0);
  const totalProfit = (orders || []).reduce((s, o) => s + Number(o.profit), 0);
  const delivered = (orders || []).filter((o) => o.status === "DELIVERED").length;
  const returned = (orders || []).filter((o) => o.status === "RETURNED").length;
  const avgOrderValue = orders?.length ? totalSales / orders.length : 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Reports</h1>
      <p className="text-sm text-neutral-500">Last 30 days. Custom date ranges and charts land in Phase 3.</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="card"><p className="text-xs text-neutral-500">Total Sales</p><p className="text-lg font-bold">{currencyCode} {totalSales.toLocaleString()}</p></div>
        <div className="card"><p className="text-xs text-neutral-500">Net Profit</p><p className="text-lg font-bold text-green-600">{currencyCode} {totalProfit.toLocaleString()}</p></div>
        <div className="card"><p className="text-xs text-neutral-500">Avg Order Value</p><p className="text-lg font-bold">{currencyCode} {avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
        <div className="card"><p className="text-xs text-neutral-500">Delivered / Returned</p><p className="text-lg font-bold">{delivered} / {returned}</p></div>
      </div>
    </div>
  );
}
