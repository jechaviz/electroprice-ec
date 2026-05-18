import React, { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../contexts/CurrencyContext';
import Spinner from '../components/common/Spinner';
import type { OrderStatus } from '../types';
import { useParams } from 'react-router-dom';
import { services } from '../services/ServiceContainer';
import SubshoppingWorkflowPanel from '../components/subshopping/SubshoppingWorkflowPanel';

const OrderDetailPage: React.FC = () => {
  const { orderId, orders, loading, setView, cancelOrder, requestReturn } = useContext(AppContext);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { id: routeOrderId } = useParams<{ id: string }>();
  const requestedOrderId = routeOrderId ?? orderId;

  const order = useMemo(() => {
    return orders.find(o => o.id === requestedOrderId);
  }, [requestedOrderId, orders]);

  const statusTimeline: OrderStatus[] = [
    'Processing', 'Awaiting Shipment from Wholesaler', 'Shipped to Hub', 'Shipped to You', 'Delivered'
  ];
  const currentStatusIndex = order ? statusTimeline.indexOf(order.status) : -1;
  const milestones = useMemo(() => order ? services.logistics.getMilestones(order) : [], [order]);
  const eta = useMemo(() => order ? services.logistics.calculateETA(order.date) : '', [order]);

  if (!order && loading) {
    return <Spinner />;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button onClick={() => setView('profile')} className="btn btn-ghost mb-6">
          <i className="fa-solid fa-arrow-left"></i> {t('profile.orders.title')}
        </button>
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body text-center py-12">
            <h1 className="card-title justify-center text-2xl mb-3">{t('order.details')}</h1>
            <p className="text-base-content/60">We could not find that order.</p>
          </div>
        </div>
      </div>
    );
  }

  const canCancel = order.status === 'Processing' || order.status === 'Awaiting Shipment from Wholesaler';
  const canReturn = order.status === 'Delivered';

  return (
    <div className="container mx-auto px-4 py-8">
      <button onClick={() => setView('profile')} className="btn btn-ghost mb-6">
        <i className="fa-solid fa-arrow-left"></i> {t('profile.orders.title')}
      </button>

      <div className="card bg-base-200 shadow-xl overflow-hidden border border-base-content/5">
        <div className="card-body p-0 md:p-8">
          <div className="p-6 md:p-0 flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10">
            <div>
              <h1 className="text-4xl font-black tracking-tighter">{t('order.details')}</h1>
              <p className="font-mono text-base-content/40 mt-1">#{order.id}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm font-bold text-base-content/60">{t('order.placedOn')}: {new Date(order.date).toLocaleString()}</p>
              <p className="text-2xl font-black text-primary">{t('order.total')}: {formatPrice(order.total)}</p>
            </div>
          </div>

          {/* Order Tracking Timeline */}
          <div className="px-6 md:px-0 mb-12">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black uppercase tracking-tight">{t('order.tracking')}</h2>
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl border border-primary/20">
                        <i className="fa-solid fa-truck-clock animate-bounce text-sm"></i>
                        <span className="text-xs font-black uppercase tracking-widest">ETA: {eta}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Steps */}
                <div className="bg-base-300/50 rounded-3xl p-8 border border-base-content/5 shadow-inner">
                    <ul className="space-y-10">
                        {statusTimeline.map((status, index) => (
                            <li key={status} className="flex gap-6 relative">
                                {index < statusTimeline.length - 1 && (
                                    <div className={`absolute left-[17px] top-10 w-0.5 h-[calc(100%-10px)] ${index < currentStatusIndex ? 'bg-primary' : 'bg-base-content/10'}`}></div>
                                )}
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 font-black text-sm border-2 transition-all duration-500 ${index <= currentStatusIndex ? 'bg-primary border-primary text-primary-content shadow-lg shadow-primary/30' : 'bg-base-200 border-base-content/10 text-base-content/20'}`}>
                                    {index <= currentStatusIndex ? <i className="fa-solid fa-check"></i> : index + 1}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-black uppercase tracking-tight transition-colors ${index <= currentStatusIndex ? 'text-base-content' : 'text-base-content/30'}`}>
                                        {t(`order.statuses.${status}` as any)}
                                    </span>
                                    {index === currentStatusIndex && (
                                        <span className="text-[10px] font-bold text-primary animate-pulse uppercase tracking-widest mt-1">Active Status</span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Detailed Logs */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 mb-2 ml-1">Detailed Logistics Logs</p>
                    <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {milestones.map((m, idx) => (
                            <div key={idx} className="bg-base-200/50 p-5 rounded-2xl border border-base-content/5 flex gap-4 transition-all hover:bg-base-200 hover:border-base-content/10 group">
                                <div className="flex flex-col items-center">
                                    <div className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? 'bg-primary shadow-lg shadow-primary/50' : 'bg-base-content/20'} mb-1 group-hover:scale-125 transition-transform`}></div>
                                    <div className="flex-1 w-px bg-base-content/10"></div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-xs font-black text-base-content group-hover:text-primary transition-colors">{m.location}</p>
                                        <p className="text-[10px] font-bold text-base-content/30">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    <p className="text-xs text-base-content/50 font-medium leading-relaxed">{m.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          <div className="px-6 md:px-0 mb-12">
            <SubshoppingWorkflowPanel order={order} formatPrice={formatPrice} />
          </div>
          
          <div className="p-6 md:p-0 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-base-300/30 p-6 rounded-3xl border border-base-content/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-4">{t('order.shippingTo')}</h3>
              <p className="text-sm font-bold text-base-content/80 leading-relaxed">{order.shippingAddress}</p>
              
              {(order.wholesalerTrackingNumber || order.trackingNumber) && (
                <div className="mt-6 flex flex-col gap-2">
                  {order.wholesalerTrackingNumber && <div className="flex justify-between items-center text-xs"><span className="font-bold text-base-content/40">Wholesaler Tracking</span><span className="font-mono bg-base-200 px-2 py-1 rounded">{order.wholesalerTrackingNumber}</span></div>}
                  {order.trackingNumber && <div className="flex justify-between items-center text-xs"><span className="font-bold text-base-content/40">Final Tracking</span><span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded">{order.trackingNumber}</span></div>}
                </div>
              )}
            </div>
            
            <div className="bg-base-300/30 p-6 rounded-3xl border border-base-content/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-base-content/40 mb-4">{t('order.actions')}</h3>
              <div className="flex flex-wrap gap-3">
                {canCancel && <button onClick={() => cancelOrder(order.id)} className="btn btn-warning btn-md rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-warning/20 flex-1">{t('order.cancel')}</button>}
                {canReturn && <button onClick={() => requestReturn(order.id)} className="btn btn-secondary btn-md rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20 flex-1">{t('order.return')}</button>}
                {!canCancel && !canReturn && (
                    <div className="flex items-center gap-2 text-xs font-bold text-base-content/40 bg-base-200 px-4 py-3 rounded-xl w-full italic">
                        <i className="fa-solid fa-info-circle"></i>
                        No actions available at this stage.
                    </div>
                )}
              </div>
            </div>
          </div>

          <div className="divider opacity-5 my-10"></div>

          {/* Items List */}
          <div className="px-6 md:p-0 pb-10">
            <h2 className="text-xl font-black uppercase tracking-tight mb-6">{t('order.items')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {order.items.map(item => (
                <div key={item.productId} className="flex items-center gap-4 bg-base-300/50 p-4 rounded-3xl border border-base-content/5 transition-all hover:bg-base-300 group">
                  <div className="relative">
                      <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-2xl shadow-md"/>
                      <span className="absolute -top-2 -right-2 h-6 w-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-[10px] font-black">{item.quantity}</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-black text-sm truncate">{item.name}</p>
                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest mt-1">Unit Price: {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-black text-primary">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
