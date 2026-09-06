const LABELS: Record<string, string> = {
  NEW: "New",
  CONFIRMED: "Confirmed",
  PACKING: "Packing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

const STYLES: Record<string, string> = {
  NEW: "bg-neutral-100 text-neutral-600",
  CONFIRMED: "bg-blue-50 text-brand-blue",
  PACKING: "bg-purple-50 text-purple-600",
  SHIPPED: "bg-amber-50 text-amber-600",
  OUT_FOR_DELIVERY: "bg-orange-50 text-orange-600",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-600",
  RETURNED: "bg-red-50 text-red-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status] || STYLES.NEW}`}>
      {LABELS[status] || status}
    </span>
  );
}
