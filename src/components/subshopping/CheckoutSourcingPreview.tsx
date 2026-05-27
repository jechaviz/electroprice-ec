import React from "react";
import { services } from "../../services/ServiceContainer";
import { getCartItemKey, selectedOptionsLabel } from "../../utils/cartLine";
import type { CartItem, Product, Wholesaler } from "../../types";

interface CheckoutSourcingPreviewProps {
  cartItems: Array<CartItem & { product?: Product }>;
  wholesalers: Wholesaler[];
  formatPrice: (price: number) => string;
}

const CheckoutSourcingPreview: React.FC<CheckoutSourcingPreviewProps> = ({ cartItems, wholesalers, formatPrice }) => {
  const rows = cartItems.flatMap(item => {
    const stock = item.product?.wholesalerStock
      .filter(candidate => candidate.stock >= item.quantity)
      .sort((a, b) => a.price - b.price)[0];

    if (!stock) return [];
    const wholesaler = wholesalers.find(candidate => candidate.id === stock.wholesalerId);
    const profile = services.providerRuntime.getProfile(stock.wholesalerId, wholesaler?.name);

    return [{
      cartItemId: getCartItemKey(item),
      productName: item.product?.name ?? item.productId,
      quantity: item.quantity,
      optionsLabel: selectedOptionsLabel(item.selectedOptions),
      providerName: profile.providerName,
      runtime: profile.runtime,
      channel: profile.channel,
      unitCost: stock.price,
      nextAction: profile.nextAction,
    }];
  });

  if (!rows.length) return null;

  return (
    <section className="rounded-2xl border border-primary/10 bg-base-200 p-5 shadow-inner">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">Subshopping preview</p>
          <h3 className="text-lg font-black">Compra mayorista preparada</h3>
        </div>
        <span className="badge badge-primary font-black">{rows.length} PO lineas</span>
      </div>
      <div className="space-y-3">
        {rows.map(row => (
          <div key={`${row.cartItemId}-${row.providerName}`} className="rounded-xl border border-base-content/10 bg-base-100 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-black">{row.productName}</p>
                {row.optionsLabel && <p className="mt-1 truncate text-[10px] font-semibold text-base-content/45">{row.optionsLabel}</p>}
                <p className="text-[10px] font-bold uppercase tracking-widest text-base-content/40">
                  x{row.quantity} via {row.providerName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="badge badge-ghost font-bold">{row.runtime}</span>
                <span className="font-mono text-sm font-black">{formatPrice(row.unitCost)}</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] font-semibold text-base-content/50">
              <i className="fa-solid fa-plug-circle-bolt mr-2 text-primary" />
              {row.channel}: {row.nextAction}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CheckoutSourcingPreview;
