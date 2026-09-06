"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/orders/new", label: "Add", isAction: true },
  { href: "/dashboard/customers", label: "Customers" },
  { href: "/dashboard/more", label: "More" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-neutral-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
      {LINKS.map((link) => {
        const active = pathname === link.href;

        if (link.isAction) {
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex -translate-y-3 flex-col items-center justify-center rounded-full bg-brand-blue px-4 py-3 text-white shadow-lg"
            >
              <span className="text-lg leading-none">+</span>
            </Link>
          );
        }

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 text-xs font-medium ${
              active ? "text-brand-blue" : "text-neutral-500"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
