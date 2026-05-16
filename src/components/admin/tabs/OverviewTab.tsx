import React from 'react';
import { OrderRow, ReviewModerationItem, EmptyState } from '../AdminComponents';
import type { Order, Review, Product, User, Wholesaler, OrderStatus } from '../../../types';
import { services } from '../../../services/ServiceContainer';

interface OverviewTabProps {
   totalRevenue: number;
   openOrders: Order[];
   pendingReviews: Review[];
   atRiskProducts: { product: Product; stock: number; price: number }[];
   wholesalers: Wholesaler[];
   users: User[];
   products: Product[];
   formatPrice: (price: number) => string;
   formatDate: (date: string) => string;
   getStatusTone: (status: OrderStatus) => string;
   getOrderStatusLabel: (status: OrderStatus) => string;
   updateOrderStatus: (orderId: string, status: OrderStatus) => void;
   updateReviewStatus: (reviewId: string, status: 'approved' | 'rejected') => void;
   getWholesalerSyncLabel: (sync: string) => string;
   ORDER_STATUSES: OrderStatus[];
   setActiveTab: (tab: any) => void;
   t: (key: string) => string;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
   totalRevenue,
   openOrders,
   pendingReviews,
   atRiskProducts,
   wholesalers,
   users,
   products,
   formatPrice,
   formatDate,
   getStatusTone,
   getOrderStatusLabel,
   updateOrderStatus,
   updateReviewStatus,
   getWholesalerSyncLabel,
   ORDER_STATUSES,
   setActiveTab,
   t
}) => {
   return (
      <div className="space-y-6">
         <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
               { label: t('adminDashboard.stats.revenue'), value: formatPrice(totalRevenue), icon: 'fa-sack-dollar', tone: 'text-success' },
               { label: t('adminDashboard.stats.openOrders'), value: openOrders.length, icon: 'fa-truck-ramp-box', tone: 'text-primary' },
               { label: t('adminDashboard.stats.pendingReviews'), value: pendingReviews.length, icon: 'fa-star-half-stroke', tone: 'text-warning' },
               { label: t('adminDashboard.stats.stockRisk'), value: atRiskProducts.length, icon: 'fa-box-open', tone: 'text-error' },
            ].map(metric => (
               <div key={metric.label} className="rounded-lg border border-base-content/10 bg-base-200/70 p-5">
                  <div className="flex items-center justify-between gap-4">
                     <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-base-content/45">{metric.label}</p>
                        <p className="mt-2 text-2xl font-black tracking-tight">{metric.value}</p>
                     </div>
                     <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-base-100 ${metric.tone}`}>
                        <i className={`fa-solid ${metric.icon} text-lg`} />
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <section className="rounded-lg border border-base-content/10 bg-base-200/60">
               <div className="flex items-center justify-between border-b border-base-content/10 px-5 py-4">
                  <div>
                     <h2 className="text-lg font-black">{t('adminDashboard.sections.fulfillmentQueue')}</h2>
                     <p className="text-sm text-base-content/50">{t('adminDashboard.sections.fulfillmentSubhead')}</p>
                  </div>
                  <button type="button" onClick={() => setActiveTab('orders')} className="btn btn-ghost btn-sm rounded-md text-primary">
                     {t('adminDashboard.actions.viewAll')}
                     <i className="fa-solid fa-arrow-right" />
                  </button>
               </div>
               <div className="overflow-x-auto">
                  {openOrders.length > 0 ? (
                     <table className="table table-sm w-full">
                        <tbody>
                           {openOrders.slice(0, 5).map(order => (
                              <OrderRow 
                                 key={order.id} 
                                 order={order} 
                                 users={users} 
                                 wholesalers={wholesalers} 
                                 formatPrice={formatPrice} 
                                 formatDate={formatDate} 
                                 getStatusTone={getStatusTone} 
                                 getOrderStatusLabel={getOrderStatusLabel} 
                                 updateOrderStatus={updateOrderStatus} 
                                 ORDER_STATUSES={ORDER_STATUSES} 
                                 t={t} 
                                 compact 
                              />
                           ))}
                        </tbody>
                     </table>
                  ) : (
                     <div className="p-5"><EmptyState icon="fa-circle-check" text={t('adminDashboard.empty.orders')} /></div>
                  )}
               </div>
            </section>

            <section className="rounded-lg border border-base-content/10 bg-base-200/60 p-5">
               <div className="mb-4 flex items-center justify-between">
                  <div>
                     <h2 className="text-lg font-black">{t('adminDashboard.sections.moderationQueue')}</h2>
                     <p className="text-sm text-base-content/50">{t('adminDashboard.sections.moderationSubhead')}</p>
                  </div>
                  <button type="button" onClick={() => setActiveTab('reviews')} className="btn btn-ghost btn-sm rounded-md text-primary">
                     {t('adminDashboard.actions.review')}
                  </button>
               </div>
               <div className="space-y-3">
                  {pendingReviews.length > 0 ? (
                     pendingReviews.slice(0, 2).map(review => (
                        <ReviewModerationItem 
                           key={review.id} 
                           review={review} 
                           products={products} 
                           users={users} 
                           formatDate={formatDate} 
                           updateReviewStatus={updateReviewStatus} 
                           t={t} 
                        />
                     ))
                  ) : (
                     <EmptyState icon="fa-shield-heart" text={t('adminDashboard.empty.reviews')} />
                  )}
               </div>
            </section>
         </div>

         <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-base-content/10 bg-base-200/60 p-5">
               <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black">{t('adminDashboard.sections.inventoryRisk')}</h2>
                  <span className="rounded-full bg-error/10 px-3 py-1 text-xs font-bold text-error">{atRiskProducts.length}</span>
               </div>
               <div className="space-y-3">
                  {atRiskProducts.length > 0 ? atRiskProducts.map(({ product, stock, price }) => (
                     <div key={product.id} className="flex items-center gap-3 rounded-lg border border-base-content/10 bg-base-100 p-3">
                        <img src={product.imageUrl} alt="" className="h-14 w-14 rounded-md object-cover" />
                        <div className="min-w-0 flex-1">
                           <p className="truncate font-bold">{product.name}</p>
                           <p className="text-xs uppercase tracking-wider text-base-content/45">{product.brand}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black">{stock}</p>
                           <p className="text-xs text-base-content/45">{t('adminDashboard.products.stock')}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-sm font-black">{price ? formatPrice(price) : t('adminDashboard.common.notAvailable')}</p>
                           <p className="text-xs text-base-content/45">{t('adminDashboard.products.bestPrice')}</p>
                        </div>
                     </div>
                  )) : <EmptyState icon="fa-boxes-stacked" text={t('adminDashboard.empty.inventory')} />}
               </div>
            </section>

            <section className="rounded-lg border border-base-content/10 bg-base-200/60 p-5">
               <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-black">{t('adminDashboard.sections.channelHealth')}</h2>
                  <button type="button" onClick={() => setActiveTab('wholesalers')} className="btn btn-ghost btn-sm rounded-md text-primary">
                     {t('adminDashboard.tabs.wholesalers')}
                  </button>
               </div>
               <div className="grid gap-3 sm:grid-cols-2">
                  {wholesalers.map(wholesaler => (
                     <div key={wholesaler.id} className="rounded-lg border border-base-content/10 bg-base-100 p-4">
                        <div className="flex items-center gap-3">
                           <img src={wholesaler.logoUrl} alt="" className="h-10 w-10 rounded-md bg-white object-contain p-1" />
                           <div className="min-w-0 flex-1">
                              <p className="truncate font-bold">{wholesaler.name}</p>
                              <p className="text-xs text-base-content/45">{wholesaler.contact}</p>
                           </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-sm">
                           <span className="font-semibold text-base-content/60">{getWholesalerSyncLabel(wholesaler.stockSync)}</span>
                           <span className="flex items-center gap-1 font-bold text-warning">
                              <i className="fa-solid fa-star text-xs" />
                              {wholesaler.rating}
                           </span>
                        </div>
                     </div>
                  ))}
               </div>
            </section>
         </div>

         <section className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5 p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black flex items-center gap-3">
                        <i className="fa-solid fa-bolt-lightning text-warning animate-pulse"></i>
                        Active Campaigns & Growth
                    </h2>
                    <p className="text-sm text-base-content/50 font-medium mt-1">Drive instant revenue with AI-powered flash sales and limited deals.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => services.demo.generateDemoData()}
                        className="btn btn-accent btn-md rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-accent/20"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                        One-Click Demo Data
                    </button>
                    <button 
                        onClick={() => services.promotion.startFlashSale(products[0]?.id, 20, 4, "Admin Flash Deal")}
                        className="btn btn-warning btn-md rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-warning/20"
                    >
                        Trigger Demo Flash Sale
                    </button>
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className="btn btn-primary btn-md rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                    >
                        View Performance Funnels
                    </button>
                </div>
            </div>
         </section>
      </div>
   );
};
