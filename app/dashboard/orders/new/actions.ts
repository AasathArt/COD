"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createOrder(_prevState: { error?: string }, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user!.id)
    .limit(1)
    .maybeSingle();

  const businessId = membership?.business_id as string;
  if (!businessId) return { error: "No business found for this account." };

  const customerName = String(formData.get("customerName") || "").trim();
  const customerPhone = String(formData.get("customerPhone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const city = String(formData.get("city") || "").trim();
  const district = String(formData.get("district") || "").trim();

  const productId = String(formData.get("productId") || "") || null;
  const productName = String(formData.get("productName") || "").trim();
  const quantity = Number(formData.get("quantity") || 1);
  const sellingPrice = Number(formData.get("sellingPrice") || 0);
  const productCost = Number(formData.get("productCost") || 0);

  const courierId = String(formData.get("courierId") || "") || null;
  const deliveryFee = Number(formData.get("deliveryFee") || 0);
  const waybill = String(formData.get("waybill") || "").trim();
  const codAmount = Number(formData.get("codAmount") || 0);

  const packagingCost = Number(formData.get("packagingCost") || 0);
  const advertisingCost = Number(formData.get("advertisingCost") || 0);
  const otherCost = Number(formData.get("otherCost") || 0);

  if (!customerName || !customerPhone) return { error: "Customer name and phone are required." };
  if (!productName || sellingPrice <= 0) return { error: "Select a product with a valid selling price." };

  // Reuse existing customer by phone within this business, otherwise create one.
  let customerId: string;
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("business_id", businessId)
    .eq("phone", customerPhone)
    .maybeSingle();

  if (existingCustomer) {
    customerId = existingCustomer.id;
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({ business_id: businessId, name: customerName, phone: customerPhone, address, city, district })
      .select("id")
      .single();
    if (customerError || !newCustomer) return { error: customerError?.message || "Could not create customer." };
    customerId = newCustomer.id;
  }

  const subtotal = sellingPrice * quantity;
  const totalProductCost = productCost * quantity;
  const profit = subtotal - totalProductCost - deliveryFee - packagingCost - advertisingCost - otherCost;
  const profitMargin = subtotal > 0 ? (profit / subtotal) * 100 : 0;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: businessId,
      customer_id: customerId,
      status: "NEW",
      subtotal,
      delivery_fee: deliveryFee,
      cod_amount: codAmount || subtotal + deliveryFee,
      product_cost: totalProductCost,
      packaging_cost: packagingCost,
      advertising_cost: advertisingCost,
      other_cost: otherCost,
      profit,
      profit_margin: profitMargin,
      courier_id: courierId,
      waybill,
    })
    .select("id")
    .single();

  if (orderError || !order) return { error: orderError?.message || "Could not create order." };

  const { error: itemError } = await supabase.from("order_items").insert({
    order_id: order.id,
    product_id: productId,
    product_name: productName,
    quantity,
    selling_price: sellingPrice,
    cost_price: productCost,
    subtotal,
  });
  if (itemError) return { error: itemError.message };

  redirect(`/dashboard/orders/${order.id}`);
}
