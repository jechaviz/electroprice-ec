import React, { useMemo } from 'react';
import MetricCard from '../../common/MetricCard';
import FunnelChart from '../FunnelChart';
import { services } from '../../../services/ServiceContainer';
import { conversionRateSignal } from '../../../signals/analytics.signals';
import { totalOnlineUsersSignal } from '../../../signals/inventory.signals';
import type { Order, OrderStatus } from '../../../types';

interface AnalyticsTabProps {
  totalRevenue: number;
  orders: Order[];
  formatPrice: (price: number) => string;
  getStatusTone: (status: OrderStatus) => string;
  getOrderStatusLabel: (status: OrderStatus) => string;
  t: (key: string) => string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  totalRevenue,
  orders,
  formatPrice,
  getStatusTone,
  getOrderStatusLabel,
  t,
}) => {
  const aov = useMemo(
    () => (orders.length ? orders.reduce((s, o) => s + o.total, 0) / orders.length : 0),
    [orders],
  );

  // Real order-status distribution (replaces the previous hardcoded "security
  // risk" mock). Sorted by frequency so the busiest states surface first.
  const statusBreakdown = useMemo(() => {
    const counts = new Map<OrderStatus, number>();
    for (const o of orders) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
    const max = Math.max(1, ...counts.values());
    return [...counts.entries()]
      .map(([status, count]) => ({ status, count, pct: Math.round((count / max) * 100) }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-8 lg:col-span-2">
        <section className="rounded-3xl border border-base-content/10 bg-base-200/60 p-8 shadow-xl backdrop-blur-md">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">{t('adminDashboard.analytics.funnelTitle')}</h2>
              <p className="text-sm font-medium text-base-content/40">{t('adminDashboard.analytics.funnelSubhead')}</p>
            </div>
            <div className="badge badge-primary px-3 py-3 text-[10px] font-black uppercase tracking-widest">
              {t('adminDashboard.analytics.live')}
            </div>
          </div>
          <FunnelChart data={services.analytics.getConversionFunnel()} />
        </section>

        <section className="rounded-3xl border border-base-content/10 bg-base-200/60 p-8 shadow-xl backdrop-blur-md">
          <h3 className="mb-6 text-xs font-black uppercase tracking-widest text-base-content/60">
            {t('adminDashboard.analytics.statusBreakdown')}
          </h3>
          {statusBreakdown.length > 0 ? (
            <div className="space-y-4">
              {statusBreakdown.map(({ status, count, pct }) => (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 font-bold ${getStatusTone(status)}`}>
                      {getOrderStatusLabel(status)}
                    </span>
                    <span className="font-black text-base-content/60">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-base-300">
                    <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-xs font-bold uppercase tracking-widest text-base-content/30">
              {t('adminDashboard.empty.orders')}
            </p>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <MetricCard title={t('adminDashboard.stats.revenue')} value={formatPrice(totalRevenue)} icon="fa-sack-dollar" color="success" />
        <MetricCard title={t('adminDashboard.analytics.aov')} value={formatPrice(aov)} icon="fa-receipt" color="primary" />
        <MetricCard title={t('adminDashboard.analytics.orders')} value={orders.length.toLocaleString()} icon="fa-box" color="accent" />
        <MetricCard title={t('adminDashboard.analytics.visitors')} value={totalOnlineUsersSignal.value.toLocaleString()} icon="fa-users" color="primary" />
        <MetricCard title={t('adminDashboard.analytics.conversion')} value={`${conversionRateSignal.value.toFixed(2)}%`} icon="fa-percent" color="accent" />
      </div>
    </div>
  );
};
