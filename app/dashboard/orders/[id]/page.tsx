import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import { updateOrderStatus } from "./actions";

const TIMELINE_STEPS = ["NEW", "CONFIRMED", "PACKING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
const STEP_LABELS: Record<string, string> = {
  NEW: "Order created",
  CONFIRMED: "Confirmed",
  PACKING: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
};

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, status, subtotal, delivery_fee, cod_amount, product_cost, packaging_cost, advertising_cost, other_cost, profit, profit_margin, waybill, created_at, updated_at, customers(name, phone, address), couriers(name), order_items(product_name, quantity, selling_price)"
    )
    .eq("id", params.id)
    .maybeSingle();

  if (!order) notFound();

  const customer = order.customers as unknown as { name: string; phone: string; address: string };
  const courier = order.couriers as unknown as { name: string } | null;
  const items = (order.order_items || []) as { product_name: string; quantity: number; selling_price: number }[];
  const currentStepIndex = TIMELINE_STEPS.indexOf(order.status);
  const isTerminatedAbnormally = order.status === "CANCELLED" || order.status === "RETURNED";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Order #{order.id.slice(0, 8)}</h1>
          <p className="text-sm text-neutral-500">{new Date(order.created_at).toLocaleString()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="card">
        <h2 className="mb-2 text-sm font-semibold text-neutral-500">Customer</h2>
        <p className="font-medium">{customer?.name}</p>
        <p className="text-sm text-neutral-500">{customer?.phone}</p>
        {customer?.address && <p className="text-sm text-neutral-500">{customer.address}</p>}
      </div>

      <div className="card">
        <h2 className="mb-2 text-sm font-semibold text-neutral-500">Items</h2>
        {items.map((item, i) => (
          <div key={i} className="flex justify-between py-1 text-sm">
            <span>
              {item.product_name} × {item.quantity}
            </span>
            <span>{Number(item.selling_price).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {!isTerminatedAbnormally && (
        <div className="card">
          <h2 className="mb-3 text-sm font-semibold text-neutral-500">Delivery Progress</h2>
          <div className="space-y-3">
            {TIMELINE_STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    i < currentStepIndex
                      ? "bg-green-500"
                      : i === currentStepIndex
                      ? "bg-brand-blue"
                      : "border border-neutral-300"
                  }`}
                />
                <span className={`text-sm ${i <= currentStepIndex ? "font-medium" : "text-neutral-400"}`}>
                  {STEP_LABELS[step]}
                </span>
              </div>
            ))}
          </div>
          {courier?.name && <p className="mt-3 text-xs text-neutral-500">Courier: {courier.name}</p>}
          {order.waybill && <p className="text-xs text-neutral-500">Waybill: {order.waybill}</p>}
        </div>
      )}

      <div className="card">
        <h2 className="mb-2 text-sm font-semibold text-neutral-500">Financials</h2>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Revenue</span><span>{Number(order.subtotal).toLocaleString()}</span></div>
          <div className="flex justify-between text-neutral-500"><span>Product cost</span><span>-{Number(order.product_cost).toLocaleString()}</span></div>
          <div className="flex justify-between text-neutral-500"><span>Courier cost</span><span>-{Number(order.delivery_fee).toLocaleString()}</span></div>
          <div className="flex justify-between text-neutral-500"><span>Packaging</span><span>-{Number(order.packaging_cost).toLocaleString()}</span></div>
          <div className="flex justify-between text-neutral-500"><span>Advertising</span><span>-{Number(order.advertising_cost).toLocaleString()}</span></div>
          <div className="flex justify-between text-neutral-500"><span>Other</span><span>-{Number(order.other_cost).toLocaleString()}</span></div>
          <div className="mt-2 flex justify-between border-t border-neutral-100 pt-2 font-bold">
            <span>Net profit</span>
            <span className={Number(order.profit) >= 0 ? "text-green-600" : "text-red-600"}>
              {Number(order.profit).toLocaleString()} ({Number(order.profit_margin).toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      <form action={updateOrderStatus} className="card space-y-2">
        <input type="hidden" name="orderId" value={order.id} />
        <label className="mb-1 block text-sm font-semibold text-neutral-500">Update status</label>
        <select name="status" defaultValue={order.status} className="input-field">
          {[...TIMELINE_STEPS, "CANCELLED", "RETURNED"].map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary w-full">
          Save Status
        </button>
      </form>
    </div>
  );
}
