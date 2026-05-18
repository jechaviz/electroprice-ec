import React from "react";
import type { Order, PurchaseOrderStatus, SubshoppingTrackingEvent } from "../../types";

interface SubshoppingWorkflowPanelProps {
  order: Order;
  formatPrice: (price: number) => string;
}

const statusTone = (status: PurchaseOrderStatus) => {
  if (["Paid", "Provider Accepted", "Shipped", "Delivered"].includes(status)) return "badge-success";
  if (["Provider Gate", "Backordered"].includes(status)) return "badge-warning";
  if (["Failed", "Cancelled"].includes(status)) return "badge-error";
  return "badge-primary";
};

const eventTone = (event: SubshoppingTrackingEvent) => {
  if (event.status === "ok") return "bg-success";
  if (event.status === "warn") return "bg-warning";
  if (event.status === "error") return "bg-error";
  return "bg-primary";
};

const SubshoppingWorkflowPanel: React.FC<SubshoppingWorkflowPanelProps> = ({ order, formatPrice }) => {
  const purchaseOrders = order.purchaseOrders ?? [];
  const timeline = order.fulfillmentTimeline ?? [];

  if (!purchaseOrders.length && !timeline.length) {
    return (
      <section className="rounded-3xl border border-base-content/10 bg-base-300/30 p-6">
        <div className="flex items-center gap-3 text-base-content/50">
          <i className="fa-solid fa-diagram-project" />
          <span className="text-sm font-bold">Subshopping pendiente de sincronizar.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-primary/20 bg-base-300/30 p-6 shadow-inner">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">vimport + vhub</p>
          <h2 className="text-xl font-black tracking-tight">Subshopping mayorista</h2>
        </div>
        <span className="badge badge-primary badge-lg font-black uppercase">{order.subshoppingStatus ?? "Planning"}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          {purchaseOrders.map(po => (
            <article key={po.id} className="rounded-2xl border border-base-content/10 bg-base-100/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black">{po.providerName}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-base-content/40">{po.id}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <span className={`badge ${statusTone(po.status)} font-black`}>{po.status}</span>
                  <span className="badge badge-ghost font-bold">{po.runtime}/{po.channel}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-3 text-xs md:grid-cols-4">
                <div>
                  <p className="font-black text-base-content/35 uppercase">Lineas</p>
                  <p className="font-bold">{po.items.length}</p>
                </div>
                <div>
                  <p className="font-black text-base-content/35 uppercase">Costo</p>
                  <p className="font-bold">{formatPrice(po.subtotalCost)}</p>
                </div>
                <div>
                  <p className="font-black text-base-content/35 uppercase">Pago</p>
                  <p className="font-bold">{po.paymentStatus}</p>
                </div>
                <div>
                  <p className="font-black text-base-content/35 uppercase">Orden proveedor</p>
                  <p className="truncate font-mono">{po.providerOrderId ?? "pendiente"}</p>
                </div>
              </div>
              {po.nextAction && (
                <div className="mt-4 rounded-xl bg-base-200 px-3 py-2 text-xs font-semibold text-base-content/60">
                  <i className="fa-solid fa-route mr-2 text-primary" />
                  {po.nextAction}
                </div>
              )}
            </article>
          ))}
        </div>

        <div className="rounded-2xl border border-base-content/10 bg-base-100/70 p-4">
          <p className="mb-4 text-[10px] font-black uppercase tracking-[0.25em] text-base-content/40">Bitacora</p>
          <div className="max-h-80 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {timeline.map(event => (
              <div key={event.id} className="flex gap-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full ${eventTone(event)}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-black">{event.title}</p>
                    <span className="font-mono text-[10px] text-base-content/35">{new Date(event.at).toLocaleTimeString()}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-base-content/55">{event.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubshoppingWorkflowPanel;
