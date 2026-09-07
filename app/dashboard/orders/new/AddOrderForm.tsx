"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createOrder } from "./actions";

type Product = { id: string; name: string; selling_price: number; cost_price: number; stock_quantity: number };
type Courier = { id: string; name: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn-primary sticky bottom-20 w-full lg:static" disabled={pending}>
      {pending ? "Creating order..." : "Create Order"}
    </button>
  );
}

export default function AddOrderForm({
  products,
  couriers,
  currencyCode,
}: {
  products: Product[];
  couriers: Courier[];
  currencyCode: string;
}) {
  const [state, formAction] = useFormState(createOrder, { error: undefined as string | undefined });

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState(selectedProduct?.selling_price || 0);
  const [productCost, setProductCost] = useState(selectedProduct?.cost_price || 0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [codAmount, setCodAmount] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [packagingCost, setPackagingCost] = useState(0);
  const [advertisingCost, setAdvertisingCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);

  function onProductChange(id: string) {
    setSelectedProductId(id);
    const p = products.find((x) => x.id === id);
    if (p) {
      setSellingPrice(p.selling_price);
      setProductCost(p.cost_price);
    }
  }

  const profit = useMemo(() => {
    const subtotal = sellingPrice * quantity;
    return subtotal - productCost * quantity - deliveryFee - packagingCost - advertisingCost - otherCost;
  }, [sellingPrice, quantity, productCost, deliveryFee, packagingCost, advertisingCost, otherCost]);

  const effectiveCod = codAmount || sellingPrice * quantity + deliveryFee;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Add Order</h1>

      <form action={formAction} className="space-y-4">
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
        )}

        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-neutral-500">Customer</h2>
          <input name="customerPhone" required inputMode="tel" placeholder="Phone number" className="input-field" />
          <input name="customerName" required placeholder="Customer name" className="input-field" />
          <input name="address" placeholder="Address (optional)" className="input-field" />
          <div className="grid grid-cols-2 gap-3">
            <input name="city" placeholder="City" className="input-field" />
            <input name="district" placeholder="District" className="input-field" />
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-neutral-500">Product</h2>
          {products.length > 0 ? (
            <select
              value={selectedProductId}
              onChange={(e) => onProductChange(e.target.value)}
              className="input-field"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock: {p.stock_quantity})
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-neutral-500">
              No products yet — enter one below, or add products first for faster future orders.
            </p>
          )}
          <input type="hidden" name="productId" value={selectedProductId} />
          <input
            name="productName"
            required
            defaultValue={selectedProduct?.name}
            placeholder="Product name"
            className="input-field"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Quantity</label>
              <input
                name="quantity"
                type="number"
                min={1}
                inputMode="numeric"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Selling price ({currencyCode})</label>
              <input
                name="sellingPrice"
                type="number"
                min={0}
                inputMode="decimal"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(Number(e.target.value) || 0)}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-neutral-500">Delivery</h2>
          <select name="courierId" className="input-field">
            <option value="">Select courier (optional)</option>
            {couriers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Delivery fee</label>
              <input
                name="deliveryFee"
                type="number"
                min={0}
                inputMode="decimal"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Waybill</label>
              <input name="waybill" placeholder="Optional" className="input-field" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-neutral-500">COD amount to collect</label>
            <input
              name="codAmount"
              type="number"
              min={0}
              inputMode="decimal"
              placeholder={String(effectiveCod)}
              value={codAmount || ""}
              onChange={(e) => setCodAmount(Number(e.target.value) || 0)}
              className="input-field"
            />
            <p className="mt-1 text-xs text-neutral-400">Leave blank to use selling price + delivery fee.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium text-brand-blue"
        >
          {showAdvanced ? "− Hide advanced costs" : "+ Add packaging / advertising / other costs"}
        </button>

        {showAdvanced && (
          <div className="card space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Packaging cost</label>
              <input
                name="packagingCost"
                type="number"
                min={0}
                value={packagingCost}
                onChange={(e) => setPackagingCost(Number(e.target.value) || 0)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Advertising cost</label>
              <input
                name="advertisingCost"
                type="number"
                min={0}
                value={advertisingCost}
                onChange={(e) => setAdvertisingCost(Number(e.target.value) || 0)}
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-500">Other cost</label>
              <input
                name="otherCost"
                type="number"
                min={0}
                value={otherCost}
                onChange={(e) => setOtherCost(Number(e.target.value) || 0)}
                className="input-field"
              />
            </div>
          </div>
        )}
        {!showAdvanced && (
          <>
            <input type="hidden" name="packagingCost" value={packagingCost} />
            <input type="hidden" name="advertisingCost" value={advertisingCost} />
            <input type="hidden" name="otherCost" value={otherCost} />
          </>
        )}
        <input type="hidden" name="productCost" value={productCost} />

        <div className="card flex items-center justify-between bg-blue-50/60">
          <span className="text-sm font-medium">Estimated net profit</span>
          <span className={`text-lg font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {currencyCode} {profit.toLocaleString()}
          </span>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
