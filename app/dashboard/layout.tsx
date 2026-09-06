import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, businesses(name)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/onboarding");

  const businessName = (membership.businesses as unknown as { name: string })?.name || "My Business";

  return (
    <div className="flex min-h-screen">
      <Sidebar businessName={businessName} />
      <main className="flex-1 pb-24 lg:pb-0">
        <div className="mx-auto max-w-5xl p-4 lg:p-8">{children}</div>
      </main>
      <BottomNav />
    </div>
  );
}
