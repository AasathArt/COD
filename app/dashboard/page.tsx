import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";

function currency(amount: number, code: string) {
  return `${code} ${amount.toLocaleString("en-LK", { minimumFractionDigits: 0 })}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, businesses(name, currency)")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  const businessId = membership?.business_id as string;
  const business = membership?.businesses as unknown as { name: string; currency: string };
  const currencyCode = business?.currency || "LKR";

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [{ data: todayOrders }, { data: pendingOrders }, { data: recentOrders }, { data: lowStock }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("cod_amount, profit, status")
        .eq("business_id", businessId)
        .gte("created_at", startOfToday.toISOString()),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId)
        .in("status", ["NEW", "CONFIRMED", "PACKING", "SHIPPED", "OUT_FOR_DELIVERY"]),
      supabase
        .from("orders")
        .select("id, status, cod_amount, profit, customers(name)")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(8),
      supabase
        .from("products")
        .select("id, name, stock_quantity, low_stock_threshold")
        .eq("business_id", businessId)
        .filter("stock_quantity", "lte", "low_stock_threshold")
        .limit(5),
    ]);

  const todaySales = (todayOrders || []).reduce((sum, o) => sum + Number(o.cod_amount || 0), 0);
  const todayProfit = (todayOrders || []).reduce((sum, o) => sum + Number(o.profit || 0), 0);
  const returned = (todayOrders || []).filter((o) => o.status === "RETURNED").length;
  const returnRate = todayOrders?.length ? ((returned / todayOrders.length) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold">
          {greeting()}, {user?.user_metadata?.full_name?.split(" ")[0] || "there"} 👋
        </h1>
        <p className="text-sm text-neutral-500">Here&apos;s how {business?.name || "your business"} is doing.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card">
          <p className="text-xs font-medium text-neutral-500">Today&apos;s Sales</p>
          <p className="mt-1 text-xl font-bold">{currency(todaySales, currencyCode)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-neutral-500">Today&apos;s Profit</p>
          <p className="mt-1 text-xl font-bold text-green-600">{currency(todayProfit, currencyCode)}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-neutral-500">Pending Orders</p>
          <p className="mt-1 text-xl font-bold">{pendingOrders?.length ?? 0}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium text-neutral-500">Return Rate</p>
          <p className="mt-1 text-xl font-bold text-brand-yellow-dark">{returnRate}%</p>
        </div>
      </div>

      <div className="card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm font-medium text-brand-blue">
            View all
          </Link>
        </div>

        {!recentOrders?.length ? (
          <div className="py-8 text-center">
            <p className="text-sm text-neutral-500">No orders yet.</p>
            <p className="mb-3 text-sm text-neutral-500">Create your first COD order to start tracking your business.</p>
            <Link href="/dashboard/orders/new" className="btn-primary inline-flex">
              + Add Order
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{(o.customers as unknown as { name: string })?.name || "—"}</p>
                  <p className="text-xs text-neutral-500">{currency(Number(o.cod_amount), currencyCode)} COD</p>
                </div>
                <StatusBadge status={o.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {!!lowStock?.length && (
        <div className="card border-brand-yellow/40 bg-yellow-50/40">
          <h2 className="mb-2 font-semibold">⚠ Low Stock</h2>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span>{p.name}</span>
                <span className="font-semibold text-brand-yellow-dark">{p.stock_quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
