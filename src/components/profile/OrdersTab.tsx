import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Order, OrderStatus } from '../../types';
import { getOrderItemKey, selectedOptionsLabel } from '../../utils/cartLine';
import { EmptyState, SectionShell, ORDER_FLOW, getProgressIndex, getOrderTone, formatDate } from './ProfileUI';
import ImageWithFallback from '../common/ImageWithFallback';

export const OrderCard: React.FC<{ order: Order; onViewDetails: (id: string) => void }> = ({ order, onViewDetails }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const getOrderStatusLabel = (status: OrderStatus) => t(`order.statuses.${status}` as any);

  const renderOrderProgress = () => {
    const progressIndex = getProgressIndex(order.status);
    return (
      <div className="mt-5">
        <div className="grid grid-cols-5 gap-2">
          {ORDER_FLOW.map((status, index) => (
            <div key={status} className="min-w-0">
              <div className={`h-2 rounded-full ${index <= progressIndex ? 'bg-primary' : 'bg-base-300'}`} />
              <p className={`mt-2 truncate text-[10px] font-bold uppercase tracking-wider ${index <= progressIndex ? 'text-primary' : 'text-base-content/35'}`}>
                {getOrderStatusLabel(status)}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-lg border border-base-content/10 bg-base-100 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs font-bold text-primary">{order.id}</p>
          <p className="mt-1 text-sm text-base-content/50">{formatDate(order.date)}</p>
        </div>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${getOrderTone(order.status)}`}>
          {getOrderStatusLabel(order.status)}
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {order.items.slice(0, 3).map(item => (
          <div key={`${order.id}-${getOrderItemKey(item)}`} className="flex items-center gap-3 text-sm">
            <ImageWithFallback src={item.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{item.name}</span>
              {selectedOptionsLabel(item.selectedOptions) && (
                <span className="block truncate text-[10px] text-base-content/40">{selectedOptionsLabel(item.selectedOptions)}</span>
              )}
            </span>
            <span className="text-base-content/45">x{item.quantity}</span>
          </div>
        ))}
      </div>
      {renderOrderProgress()}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-black">{formatPrice(order.total)}</p>
        <button type="button" onClick={() => onViewDetails(order.id)} className="btn btn-primary btn-sm rounded-md text-white">
          {t('profile.orders.viewDetails')}
          <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </div>
  );
};

export const OrdersTab: React.FC<{ userOrders: Order[] }> = ({ userOrders }) => {
  const { loading, navigateToOrder } = useContext(AppContext);
  const { t } = useTranslation();

  const handleViewOrder = (orderId: string) => {
    navigateToOrder(orderId);
  };

  if (loading && userOrders.length === 0) {
    return (
      <SectionShell title={t('profile.tabs.orders')}>
        <div className="flex justify-center py-16">
          <div className="loading loading-spinner loading-lg text-primary" aria-label="Loading orders" />
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell title={t('profile.tabs.orders')}>
      {userOrders.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {userOrders.map(order => (
            <OrderCard key={order.id} order={order} onViewDetails={handleViewOrder} />
          ))}
        </div>
      ) : (
        <EmptyState icon="fa-receipt" title={t('profile.orders.emptyTitle')} text={t('profile.orders.empty')} />
      )}
    </SectionShell>
  );
};
