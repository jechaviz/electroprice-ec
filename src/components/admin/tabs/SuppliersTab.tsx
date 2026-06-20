import React, { useMemo } from 'react';
import { EmptyState } from '../AdminComponents';
import type { Supplier } from '../../../types';

interface SuppliersTabProps {
  suppliers: Supplier[];
  formatDate: (date: string) => string;
  t: (key: string) => string;
}

const statusTone = (status: Supplier['status']): string =>
  status === 'Active' ? 'bg-success/15 text-success' : 'bg-base-content/10 text-base-content/50';

const typeTone = (type: Supplier['type']): string =>
  type === 'API' ? 'bg-primary/15 text-primary' : 'bg-accent/15 text-accent';

const relativeSync = (iso: string): string => {
  if (!iso) return '—';
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms)) return iso;
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'ahora';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
};

export const SuppliersTab: React.FC<SuppliersTabProps> = ({ suppliers, formatDate, t }) => {
  const stats = useMemo(() => {
    const active = suppliers.filter(s => s.status === 'Active').length;
    const api = suppliers.filter(s => s.type === 'API').length;
    const scraping = suppliers.filter(s => s.type === 'Scraping').length;
    return { total: suppliers.length, active, api, scraping };
  }, [suppliers]);

  const metrics = [
    { label: t('adminDashboard.tabs.suppliers'), value: stats.total, icon: 'fa-boxes-packing', tone: 'text-primary' },
    { label: t('adminDashboard.suppliers.statuses.active'), value: stats.active, icon: 'fa-plug-circle-check', tone: 'text-success' },
    { label: t('adminDashboard.suppliers.types.api'), value: stats.api, icon: 'fa-code', tone: 'text-primary' },
    { label: t('adminDashboard.suppliers.types.scraping'), value: stats.scraping, icon: 'fa-spider', tone: 'text-accent' },
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
          <h2 className="text-xl font-black">{t('adminDashboard.tabs.suppliers')}</h2>
          <p className="text-sm text-base-content/50">{t('adminDashboard.sections.channelHealth')}</p>
        </div>
        <div className="table-responsive">
          {suppliers.length > 0 ? (
            <table className="table w-full">
              <thead className="bg-base-300/45 text-xs uppercase tracking-wider text-base-content/50">
                <tr>
                  <th className="pl-4">{t('adminDashboard.suppliers.name')}</th>
                  <th>{t('adminDashboard.suppliers.type')}</th>
                  <th>{t('adminDashboard.suppliers.status')}</th>
                  <th className="pr-4">{t('adminDashboard.suppliers.lastSync')}</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map(s => (
                  <tr key={s.id} className="border-b border-base-content/5 last:border-0 hover:bg-base-300/25">
                    <td className="pl-4 font-bold">{s.name}</td>
                    <td>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${typeTone(s.type)}`}>
                        {t(`adminDashboard.suppliers.types.${s.type.toLowerCase()}`)}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusTone(s.status)}`}>
                        {t(`adminDashboard.suppliers.statuses.${s.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="pr-4 text-base-content/60" title={s.lastSync ? formatDate(s.lastSync) : ''}>
                      <i className="fa-solid fa-clock-rotate-left mr-1.5 text-[10px] text-base-content/30" aria-hidden="true" />
                      {relativeSync(s.lastSync)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-5"><EmptyState icon="fa-boxes-packing" text={t('adminDashboard.empty.suppliers')} /></div>
          )}
        </div>
      </section>
    </div>
  );
};
