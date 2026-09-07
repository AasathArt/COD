import Link from "next/link";

const LINKS = [
  { href: "/dashboard/products", label: "Products" },
  { href: "/dashboard/reports", label: "Reports" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function MorePage() {
  return (
    <div className="space-y-2">
      <h1 className="mb-2 text-xl font-bold">More</h1>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className="card block font-medium">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
