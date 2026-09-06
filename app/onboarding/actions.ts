"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(_prevState: { error?: string }, formData: FormData) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = String(formData.get("businessName") || "").trim();
  const category = String(formData.get("category") || "Other");
  const country = String(formData.get("country") || "Sri Lanka");
  const currency = String(formData.get("currency") || "LKR");
  const monthlyOrderVolume = String(formData.get("monthlyOrderVolume") || "1-30");

  if (!name) return { error: "Business name is required." };

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      owner_id: user!.id,
      name,
      category,
      country,
      currency,
      timezone: "Asia/Colombo",
      monthly_order_volume: monthlyOrderVolume,
    })
    .select()
    .single();

  if (businessError || !business) {
    return { error: businessError?.message || "Could not create business." };
  }

  const { error: memberError } = await supabase.from("business_members").insert({
    business_id: business.id,
    user_id: user!.id,
    role: "owner",
  });
  if (memberError) return { error: memberError.message };

  const { error: subError } = await supabase.from("subscriptions").insert({
    business_id: business.id,
    plan: "FREE",
    status: "active",
  });
  if (subError) return { error: subError.message };

  redirect("/dashboard");
}
