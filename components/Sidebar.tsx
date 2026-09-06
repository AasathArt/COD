"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logOut } from "@/app/(auth)/actions";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function Sidebar({ businessName }: { businessName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-neutral-200 bg-white p-4 lg:flex">
      <div className="mb-6 px-2">
        <p className="text-lg font-bold text-brand-blue">CODFlow</p>
        <p className="truncate text-sm text-neutral-500">{businessName}</p>
      </div>

      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium ${
                active ? "bg-blue-50 text-brand-blue" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <Link href="/dashboard/orders/new" className="btn-primary mb-3 w-full">
        + Add Order
      </Link>

      <form action={logOut}>
        <button type="submit" className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-neutral-500 hover:bg-neutral-50">
          Log out
        </button>
      </form>
    </aside>
  );
}
