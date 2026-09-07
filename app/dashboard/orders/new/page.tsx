import { createClient } from "@/lib/supabase/server";
import AddOrderForm from "./AddOrderForm";

export default async function NewOrderPage() {
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

  const [{ data: products }, { data: couriers }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, selling_price, cost_price, stock_quantity")
      .eq("business_id", businessId)
      .eq("active", true)
      .order("name"),
    supabase.from("couriers").select("id, name").eq("business_id", businessId).order("name"),
  ]);

  return <AddOrderForm products={products || []} couriers={couriers || []} currencyCode={currencyCode} />;
}
