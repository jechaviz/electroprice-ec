import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import type { OrderStatus, Product } from '../types';
import { useCurrency } from '../contexts/CurrencyContext';
import { OrderRow, ReviewModerationItem, EmptyState } from '../components/admin/AdminComponents';
import { OverviewTab } from '../components/admin/tabs/OverviewTab';
import MetricCard from '../components/common/MetricCard';
import FunnelChart from '../components/admin/FunnelChart';
import { services } from '../services/ServiceContainer';
import { conversionRateSignal } from '../signals/analytics.signals';
import { totalOnlineUsersSignal } from '../signals/inventory.signals';
import { SubshoppingTab } from '../components/admin/tabs/SubshoppingTab';
import { ProductIntelTab } from '../components/admin/tabs/ProductIntelTab';

type AdminTab = 'overview' | 'analytics' | 'orders' | 'subshopping' | 'productIntel' | 'users' | 'reviews' | 'suppliers' | 'wholesalers';

const ORDER_STATUSES: OrderStatus[] = [
  'Processing', 'Awaiting Shipment from Wholesaler', 'Shipped to Hub', 'Shipped to You', 'Delivered', 'Cancelled', 'Return Requested', 'Returned',
];

const OPEN_ORDER_STATUSES: OrderStatus[] = [
  'Processing', 'Awaiting Shipment from Wholesaler', 'Shipped to Hub', 'Shipped to You', 'Return Requested',
];

const tabItems: { id: AdminTab; icon: string }[] = [
  { id: 'overview', icon: 'fa-chart-line' }, { id: 'analytics', icon: 'fa-filter-circle-dollar' }, { id: 'orders', icon: 'fa-receipt' }, 
  { id: 'subshopping', icon: 'fa-network-wired' }, { id: 'productIntel', icon: 'fa-puzzle-piece' }, { id: 'users', icon: 'fa-users' }, { id: 'reviews', icon: 'fa-star-half-stroke' },
  { id: 'suppliers', icon: 'fa-boxes-packing' }, { id: 'wholesalers', icon: 'fa-truck-fast' },
];

const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
const getLowestProductPrice = (product: Product) => {
  const prices = product.wholesalerStock.map(stock => stock.price).filter(price => price > 0);
  return prices.length ? Math.min(...prices) : 0;
};
const getTotalStock = (product: Product) => product.wholesalerStock.reduce((sum, stock) => sum + stock.stock, 0);
const getStatusTone = (status: OrderStatus) => {
  if (status === 'Delivered') return 'bg-success/15 text-success';
  if (status === 'Cancelled' || status === 'Returned') return 'bg-error/15 text-error';
  if (status === 'Return Requested') return 'bg-warning/15 text-warning';
  return 'bg-primary/15 text-primary';
};

const AdminDashboard: React.FC = () => {
  const { user, users, reviews, products, orders, wholesalers, updateReviewStatus, updateOrderStatus } = useContext(AppContext);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const pendingReviews = useMemo(() => reviews.filter(review => review.status === 'pending'), [reviews]);
  const recentOrders = useMemo(() => [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [orders]);
  const openOrders = useMemo(() => recentOrders.filter(order => OPEN_ORDER_STATUSES.includes(order.status)), [recentOrders]);
  const atRiskProducts = useMemo(() => products.map(product => ({ product, stock: getTotalStock(product), price: getLowestProductPrice(product) })).filter(item => item.stock <= 5).sort((a, b) => a.stock - b.stock).slice(0, 6), [products]);
  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + (order.total - (order.totalCost || 0)), 0), [orders]);

  if (!user || user.role !== 'admin') return null;

  const getOrderStatusLabel = (status: OrderStatus) => t(`order.statuses.${status}` as any);
  const getWholesalerSyncLabel = (sync: string) => t(`adminDashboard.wholesalers.sync.${sync.replace(/[^a-zA-Z]/g, '').toLowerCase()}`);

  return (
    <div className="min-h-screen bg-base-300 pb-20 pt-6">
      <div className="container mx-auto px-4 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-3xl font-black tracking-tight">{t('adminDashboard.title')}</h1><p className="mt-1 font-bold text-base-content/40">{t('adminDashboard.welcome')}, {user.name}</p></div>
          <nav className="flex flex-wrap gap-1 rounded-xl bg-base-200 p-1 shadow-inner">
            {tabItems.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-base-100 text-primary shadow' : 'text-base-content/50 hover:bg-base-100/50 hover:text-base-content'}`}>
                <i className={`fa-solid ${tab.icon}`} /> <span className="hidden lg:inline">{t(`adminDashboard.tabs.${tab.id}`)}</span>
              </button>
            ))}
          </nav>
        </header>

        <main className="animate-fade-in-up">
          {activeTab === 'overview' && (
             <OverviewTab totalRevenue={totalRevenue} openOrders={openOrders} pendingReviews={pendingReviews} atRiskProducts={atRiskProducts} wholesalers={wholesalers} users={users} products={products} formatPrice={formatPrice} formatDate={formatDate} getStatusTone={getStatusTone} getOrderStatusLabel={getOrderStatusLabel} updateOrderStatus={updateOrderStatus} updateReviewStatus={updateReviewStatus} getWholesalerSyncLabel={getWholesalerSyncLabel} ORDER_STATUSES={ORDER_STATUSES} setActiveTab={setActiveTab} t={t} />
          )}

          {activeTab === 'analytics' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-base-200/60 rounded-3xl border border-base-content/10 p-8 shadow-xl backdrop-blur-md">
                        <div className="mb-8 flex items-center justify-between">
                            <div><h2 className="text-2xl font-black">Conversion Funnel</h2><p className="text-sm text-base-content/40 font-medium">Real-time analysis of the customer journey.</p></div>
                            <div className="badge badge-primary font-black uppercase tracking-widest text-[10px] px-3 py-3">Live Feed</div>
                        </div>
                        <FunnelChart data={services.analytics.getConversionFunnel()} />
                    </section>
                </div>
                <div className="space-y-6">
                    <MetricCard title="Total Revenue" value={formatPrice(totalRevenue)} icon="fa-sack-dollar" color="success" />
                    <MetricCard title="Live Visitors" value={totalOnlineUsersSignal.value.toLocaleString()} icon="fa-users" color="primary" trend={{ value: 5, isPositive: true }} />
                    <MetricCard title="Global Conversion" value={`${conversionRateSignal.value.toFixed(2)}%`} icon="fa-percent" color="accent" />

                    <section className="bg-error/5 border border-error/20 rounded-3xl p-6 backdrop-blur-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-error">Security Risk Center</h3>
                            <i className="fa-solid fa-shield-halved text-error animate-pulse"></i>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-base-content/60 uppercase">Fraud Score</span>
                                <span className="badge badge-error badge-sm font-black text-[10px]">MEDIUM</span>
                            </div>
                            <div className="h-2 w-full bg-base-300 rounded-full overflow-hidden">
                                <div className="h-full bg-error transition-all duration-1000" style={{ width: '42%' }}></div>
                            </div>
                            <p className="text-[10px] text-error/60 font-medium">3 suspicious IPs flagged in the last 24h.</p>
                        </div>
                    </section>
                </div>
             </div>
          )}

          {activeTab === 'orders' && (
            <section className="rounded-lg border border-base-content/10 bg-base-200/60">
               <div className="border-b border-base-content/10 px-5 py-4"><h2 className="text-xl font-black">{t('adminDashboard.tabs.orders')}</h2><p className="text-sm text-base-content/50">{t('adminDashboard.sections.ordersSubhead')}</p></div>
               <div className="table-responsive">
                 {recentOrders.length > 0 ? (
                   <table className="table w-full">
                     <thead className="bg-base-300/45 text-xs uppercase tracking-wider text-base-content/50"><tr><th className="pl-4">{t('adminDashboard.orders.id')}</th><th>{t('adminDashboard.orders.user')}</th><th>{t('adminDashboard.orders.items')}</th><th>{t('adminDashboard.orders.total')}</th><th>{t('adminDashboard.orders.status')}</th><th className="pr-4">{t('adminDashboard.orders.actions')}</th></tr></thead>
                     <tbody>{recentOrders.map(order => <OrderRow key={order.id} order={order} users={users} wholesalers={wholesalers} formatPrice={formatPrice} formatDate={formatDate} getStatusTone={getStatusTone} getOrderStatusLabel={getOrderStatusLabel} updateOrderStatus={updateOrderStatus} ORDER_STATUSES={ORDER_STATUSES} t={t} />)}</tbody>
                   </table>
                 ) : <div className="p-5"><EmptyState icon="fa-receipt" text={t('adminDashboard.empty.orders')} /></div>}
               </div>
            </section>
          )}

          {activeTab === 'subshopping' && (
            <SubshoppingTab orders={orders} formatPrice={formatPrice} />
          )}

          {activeTab === 'productIntel' && (
            <ProductIntelTab products={products} wholesalers={wholesalers} formatPrice={formatPrice} />
          )}

          {activeTab === 'users' && (
            <section className="rounded-lg border border-base-content/10 bg-base-200/60">
              <div className="border-b border-base-content/10 px-5 py-4 flex items-center justify-between">
                <div><h2 className="text-xl font-black">{t('adminDashboard.users.title')}</h2><p className="text-sm text-base-content/50">{t('adminDashboard.sections.usersSubhead')}</p></div>
                <button 
                  onClick={() => services.export.exportToCSV(users, 'User_List')}
                  className="btn btn-primary btn-sm rounded-xl font-black uppercase tracking-widest text-[10px]"
                >
                  <i className="fa-solid fa-download mr-2"></i>
                  Export CSV
                </button>
              </div>
              <div className="table-responsive">
                <table className="table w-full">
                  <thead className="bg-base-300/45 text-xs uppercase tracking-wider text-base-content/50"><tr><th className="pl-4">{t('adminDashboard.users.name')}</th><th>{t('adminDashboard.users.email')}</th><th>{t('adminDashboard.users.role')}</th><th>{t('adminDashboard.users.status')}</th><th className="pr-4">{t('adminDashboard.users.actions')}</th></tr></thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-base-content/5 last:border-0 hover:bg-base-300/25">
                        <td className="pl-4 flex items-center gap-3"><img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" /><span className="font-bold">{u.name}</span></td>
                        <td>{u.email}</td>
                        <td className="capitalize font-semibold text-base-content/60">{t(`adminDashboard.roles.${u.role}`)}</td>
                        <td><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${u.status === 'active' ? 'bg-success/15 text-success' : 'bg-error/15 text-error'}`}>{u.status}</span></td>
                         <td className="pr-4">
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => services.user.updateUserStatus(u.id, u.status === 'active' ? 'banned' : 'active')}
                                    className={`btn btn-xs rounded-lg font-black uppercase tracking-widest text-[9px] ${u.status === 'active' ? 'btn-error btn-ghost hover:bg-error/10' : 'btn-success btn-ghost hover:bg-success/10'}`}
                                >
                                    {u.status === 'active' ? 'Ban' : 'Unban'}
                                </button>
                                <select 
                                    className="select select-xs select-bordered bg-base-300/50 rounded-lg font-black uppercase tracking-widest text-[9px]"
                                    value={u.role}
                                    onChange={(e) => services.user.updateUserRole?.(u.id, e.target.value as typeof u.role)}
                                >
                                    <option value="user">User</option>
                                    <option value="retailer">Retailer</option>
                                    <option value="wholesaler">Wholesaler</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                         </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activeTab === 'reviews' && (
            <section className="rounded-lg border border-base-content/10 bg-base-200/60 p-5">
              <div className="mb-6"><h2 className="text-xl font-black">{t('adminDashboard.tabs.reviews')}</h2><p className="text-sm text-base-content/50">{t('adminDashboard.sections.moderationSubhead')}</p></div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {pendingReviews.length > 0 ? pendingReviews.map(review => <ReviewModerationItem key={review.id} review={review} products={products} users={users} formatDate={formatDate} updateReviewStatus={updateReviewStatus} t={t} />) : <div className="lg:col-span-2"><EmptyState icon="fa-shield-heart" text={t('adminDashboard.empty.reviews')} /></div>}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
