import React, { useMemo } from 'react';
import ImageWithFallback from '../../common/ImageWithFallback';
import { EmptyState } from '../AdminComponents';
import type { Product, Wholesaler } from '../../../types';

interface WholesalersTabProps {
  wholesalers: Wholesaler[];
  products: Product[];
  formatPrice: (price: number) => string;
  getWholesalerSyncLabel: (sync: string) => string;
  t: (key: string) => string;
}

const statusTone = (status: Wholesaler['status']): string => {
  if (status === 'Approved') return 'bg-success/15 text-success';
  if (status === 'Disabled') return 'bg-error/15 text-error';
  return 'bg-warning/15 text-warning';
};

const syncTone = (sync: Wholesaler['stockSync']): string => {
  if (sync === 'Real-time') return 'bg-success/15 text-success';
  if (sync === 'Daily') return 'bg-primary/15 text-primary';
  return 'bg-base-content/10 text-base-content/60';
};

const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} / 5`}>
    {[1, 2, 3, 4, 5].map(n => (
      <i
        key={n}
        className={`fa-solid fa-star text-[10px] ${n <= Math.round(rating) ? 'text-warning' : 'text-base-content/15'}`}
        aria-hidden="true"
      />
    ))}
    <span className="ml-1 text-xs font-bold text-base-content/50">{rating.toFixed(1)}</span>
  </span>
);

export const WholesalersTab: React.FC<WholesalersTabProps> = ({
  wholesalers,
  products,
  formatPrice,
  getWholesalerSyncLabel,
  t,
}) => {
  // Per-wholesaler supply coverage derived from the catalog: how many SKUs each
  // partner stocks, total units on hand, and their average listed price.
  const coverage = useMemo(() => {
    const byId = new Map<string, { skus: number; units: number; priceSum: number; priceCount: number }>();
    for (const product of products) {
      for (const ws of product.wholesalerStock) {
        const c = byId.get(ws.wholesalerId) ?? { skus: 0, units: 0, priceSum: 0, priceCount: 0 };
        c.skus += 1;
        c.units += ws.stock;
        if (ws.price > 0) {
          c.priceSum += ws.price;
          c.priceCount += 1;
        }
        byId.set(ws.wholesalerId, c);
      }
    }
    return byId;
  }, [products]);

  const stats = useMemo(() => {
    const approved = wholesalers.filter(w => w.status === 'Approved').length;
    const realtime = wholesalers.filter(w => w.stockSync === 'Real-time').length;
    const avgRating = wholesalers.length
      ? wholesalers.reduce((s, w) => s + w.rating, 0) / wholesalers.length
      : 0;
    return { total: wholesalers.length, approved, realtime, avgRating };
  }, [wholesalers]);

  const metrics = [
    { label: t('adminDashboard.tabs.wholesalers'), value: stats.total, icon: 'fa-truck-fast', tone: 'text-primary' },
    { label: t('adminDashboard.wholesalers.statuses.approved'), value: stats.approved, icon: 'fa-circle-check', tone: 'text-success' },
    { label: t('adminDashboard.wholesalers.sync.realtime'), value: stats.realtime, icon: 'fa-bolt', tone: 'text-accent' },
    { label: t('adminDashboard.wholesalers.rating'), value: stats.avgRating.toFixed(1), icon: 'fa-star', tone: 'text-warning' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(m => (
          <div key={m.label} className="rounded-lg border border-base-content/10 bg-base-200/70 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-base-content/45">{m.label}</p>
                <p className="mt-2 text-2xl font-black tracking-tight">{m.value}</p>
              </div>
              <i className={`fa-solid ${m.icon} text-xl ${m.tone}`} aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-base-content/10 bg-base-200/60">
        <div className="border-b border-base-content/10 px-5 py-4">
          <h2 className="text-xl font-black">{t('adminDashboard.tabs.wholesalers')}</h2>
          <p className="text-sm text-base-content/50">{t('adminDashboard.sections.channelHealth')}</p>
        </div>
        <div className="table-responsive">
          {wholesalers.length > 0 ? (
            <table className="table w-full">
              <thead className="bg-base-300/45 text-xs uppercase tracking-wider text-base-content/50">
                <tr>
                  <th className="pl-4">{t('adminDashboard.wholesalers.name')}</th>
                  <th>{t('adminDashboard.wholesalers.contact')}</th>
                  <th>{t('adminDashboard.wholesalers.rating')}</th>
                  <th>{t('adminDashboard.wholesalers.stockSync')}</th>
                  <th>{t('adminDashboard.wholesalers.status')}</th>
                  <th className="pr-4 text-right">SKUs</th>
                </tr>
              </thead>
              <tbody>
                {wholesalers.map(w => {
                  const c = coverage.get(w.id);
                  const avgPrice = c && c.priceCount ? c.priceSum / c.priceCount : 0;
                  return (
                    <tr key={w.id} className="border-b border-base-content/5 last:border-0 hover:bg-base-300/25">
                      <td className="pl-4">
                        <div className="flex items-center gap-3">
                          <ImageWithFallback src={w.logoUrl} alt="" className="h-8 w-8 rounded-lg object-cover bg-base-300" />
                          <span className="font-bold">{w.name}</span>
                        </div>
                      </td>
                      <td className="text-base-content/60">{w.contact}</td>
                      <td><Stars rating={w.rating} /></td>
                      <td>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${syncTone(w.stockSync)}`}>
                          {getWholesalerSyncLabel(w.stockSync)}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(w.status)}`}>
                          {t(`adminDashboard.wholesalers.statuses.${w.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="pr-4 text-right">
                        <span className="font-black">{c?.skus ?? 0}</span>
                        {avgPrice > 0 && (
                          <span className="ml-2 text-[11px] font-medium text-base-content/40">{formatPrice(avgPrice)}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="p-5"><EmptyState icon="fa-truck-fast" text={t('adminDashboard.empty.wholesalers')} /></div>
          )}
        </div>
      </section>
    </div>
  );
};
