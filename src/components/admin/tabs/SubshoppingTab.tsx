import React, { useMemo } from "react";
import { services } from "../../../services/ServiceContainer";
import type { Order } from "../../../types";

interface SubshoppingTabProps {
  orders: Order[];
  formatPrice: (price: number) => string;
}

const statusClass = (status: string) => {
  if (status === "ready") return "badge-success";
  if (status === "degraded") return "badge-warning";
  return "badge-error";
};

export const SubshoppingTab: React.FC<SubshoppingTabProps> = ({ orders, formatPrice }) => {
  const summary = useMemo(() => services.subshopping.getOpsSummary(orders), [orders]);
  const profiles = useMemo(() => services.providerRuntime.listProfiles(), []);
  const purchaseOrders = useMemo(() => orders.flatMap(order => order.purchaseOrders ?? []), [orders]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          { label: "POs B2B", value: summary.purchaseOrderCount, icon: "fa-file-invoice" },
          { label: "Pagadas", value: summary.paid, icon: "fa-credit-card" },
          { label: "Compuertas", value: summary.openGates, icon: "fa-user-lock" },
          { label: "Costo mayorista", value: formatPrice(summary.totalCost), icon: "fa-sack-dollar" },
        ].map(metric => (
          <div key={metric.label} className="rounded-lg border border-base-content/10 bg-base-200/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-base-content/45">{metric.label}</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{metric.value}</p>
              </div>
              <i className={`fa-solid ${metric.icon} text-xl text-primary`} />
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-base-content/10 bg-base-200/60">
        <div className="border-b border-base-content/10 px-5 py-4">
          <h2 className="text-xl font-black">Runtime de proveedores</h2>
          <p className="text-sm text-base-content/50">vhub ejecuta APIs; vimport cubre portales con autorizacion del usuario.</p>
        </div>
        <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
          {profiles.slice(0, 12).map(profile => (
            <article key={profile.providerId} className="rounded-xl border border-base-content/10 bg-base-100 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-black">{profile.providerName}</p>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-base-content/35">{profile.providerId}</p>
                </div>
                <span className={`badge ${statusClass(profile.status)} font-black`}>{profile.status}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="badge badge-ghost">{profile.runtime}</span>
                <span className="badge badge-ghost">{profile.channel}</span>
                {profile.supportsPurchaseOrder && <span className="badge badge-primary">orders</span>}
                {profile.supportsTracking && <span className="badge badge-secondary">tracking</span>}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-base-content/55">{profile.nextAction}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-base-content/10 bg-base-200/60">
        <div className="border-b border-base-content/10 px-5 py-4">
          <h2 className="text-xl font-black">Ordenes de compra recientes</h2>
          <p className="text-sm text-base-content/50">Cada checkout retail se convierte en una o varias compras mayoristas.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead className="bg-base-300/45 text-xs uppercase tracking-wider text-base-content/50">
              <tr><th>PO</th><th>Proveedor</th><th>Runtime</th><th>Costo</th><th>Pago</th><th>Estado</th><th>Accion</th></tr>
            </thead>
            <tbody>
              {purchaseOrders.map(po => (
                <tr key={po.id} className="border-b border-base-content/5">
                  <td className="font-mono text-xs">{po.id.slice(0, 18)}</td>
                  <td className="font-bold">{po.providerName}</td>
                  <td>{po.runtime}/{po.channel}</td>
                  <td className="font-mono">{formatPrice(po.subtotalCost)}</td>
                  <td>{po.paymentStatus}</td>
                  <td><span className="badge badge-ghost font-bold">{po.status}</span></td>
                  <td className="max-w-sm truncate text-xs text-base-content/50">{po.nextAction}</td>
                </tr>
              ))}
              {!purchaseOrders.length && (
                <tr><td colSpan={7} className="py-10 text-center text-base-content/45">Aun no hay ordenes de compra B2B.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
