"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createProduct(formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  const businessId = membership?.business_id as string;
  if (!businessId) return;

  await supabase.from("products").insert({
    business_id: businessId,
    name: String(formData.get("name") || "").trim(),
    selling_price: Number(formData.get("sellingPrice") || 0),
    cost_price: Number(formData.get("costPrice") || 0),
    stock_quantity: Number(formData.get("stockQuantity") || 0),
    low_stock_threshold: Number(formData.get("lowStockThreshold") || 5),
  });

  revalidatePath("/dashboard/products");
}
