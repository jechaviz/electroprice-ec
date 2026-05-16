import React from 'react';
import { OrderStatus } from '../../types';

export const ORDER_FLOW: OrderStatus[] = [
  'Processing',
  'Awaiting Shipment from Wholesaler',
  'Shipped to Hub',
  'Shipped to You',
  'Delivered',
];

export const getProgressIndex = (status: OrderStatus) => {
  if (status === 'Delivered') return ORDER_FLOW.length - 1;
  if (status === 'Cancelled' || status === 'Returned') return 0;
  if (status === 'Return Requested') return Math.max(0, ORDER_FLOW.indexOf('Shipped to You'));
  return Math.max(0, ORDER_FLOW.indexOf(status));
};

export const getOrderTone = (status: OrderStatus) => {
  if (status === 'Delivered') return 'bg-success/15 text-success';
  if (status === 'Cancelled' || status === 'Returned') return 'bg-error/15 text-error';
  if (status === 'Return Requested') return 'bg-warning/15 text-warning';
  return 'bg-primary/15 text-primary';
};

export const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const EmptyState: React.FC<{ icon: string; title: string; text: string }> = ({ icon, title, text }) => (
  <div className="rounded-lg border border-dashed border-base-content/10 bg-base-200/40 px-5 py-12 text-center">
    <i className={`fa-solid ${icon} mb-4 block text-3xl text-base-content/20`} />
    <h3 className="text-lg font-black">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-base-content/50">{text}</p>
  </div>
);

export const SectionShell: React.FC<{ title: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, action, children }) => (
  <section className="rounded-lg border border-base-content/10 bg-base-200/55">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-base-content/10 px-5 py-4">
      <h2 className="text-xl font-black">{title}</h2>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);
