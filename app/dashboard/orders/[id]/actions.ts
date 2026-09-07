"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateOrderStatus(formData: FormData) {
  const orderId = String(formData.get("orderId") || "");
  const status = String(formData.get("status") || "");
  if (!orderId || !status) return;

  const supabase = createClient();
  await supabase.from("orders").update({ status }).eq("id", orderId);

  // Spec: stock decrements automatically when an order is marked DELIVERED.
  if (status === "DELIVERED") {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderId);

    for (const item of items || []) {
      if (!item.product_id) continue;
      await supabase.rpc("decrement_stock", { p_product_id: item.product_id, p_quantity: item.quantity });
    }
  }

  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");
}
