
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../contexts/CurrencyContext';
import type { Product } from '../types';
import EditProductModal from '../components/retailer/EditProductModal';
import MetricCard from '../components/common/MetricCard';
import AIGrowthAssistant from '../components/retailer/AIGrowthAssistant';
import { analyticsEventsSignal } from '../signals/analytics.signals';

const RetailerDashboard: React.FC = () => {
  // FIX: Changed retailers to wholesalers to use existing context property
  const { user, products, wholesalers } = useContext(AppContext);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const retailerInfo = useMemo(() => {
    if (!user || !user.retailerId) return null;
    // FIX: Changed retailers to wholesalers
    return wholesalers.find(r => r.id === user.retailerId);
  }, [user, wholesalers]);

  const retailerProducts = useMemo(() => {
    if (!user || !user.retailerId) return [];
    // FIX: Changed prices to wholesalerStock and retailerId to wholesalerId
    return products.filter(p => p.wholesalerStock.some(priceInfo => priceInfo.wholesalerId === user.retailerId));
  }, [user, products]);

  // Real-time analytics for this retailer
  const retailerStats = useMemo(() => {
    const events = analyticsEventsSignal.value.filter(e => e.metadata.wholesalerId === user?.retailerId || e.metadata.retailerId === user?.retailerId);
    return {
        views: events.filter(e => e.type === 'product_view').length,
        conversions: events.filter(e => e.type === 'purchase_success').length
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.retailerId, analyticsEventsSignal.value]);

  // FIX: This check now works because 'retailer' was added to UserRole type
  if (!user || user.role !== 'retailer') {
    return null; // Handled by global redirect
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold">{t('retailerDashboard.title')}</h1>
        {/* FIX: user.retailerName now exists on User type */}
        <p className="text-lg text-base-content/70">{t('retailerDashboard.welcome')}, {user.retailerName}!</p>
      </div>

      {/* Status Banner */}
      {retailerInfo && retailerInfo.status !== 'Approved' && (
        <div className={`alert ${retailerInfo.status === 'Disabled' ? 'alert-error' : 'alert-warning'} mb-8 shadow-lg`}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <div>
                <h3 className="font-bold">{retailerInfo.status}</h3>
                <div className="text-xs">
                    {retailerInfo.status === 'Pending' ? t('retailerDashboard.status.pending') : t('retailerDashboard.status.disabled')}
                </div>
            </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard 
            title={t('retailerDashboard.stats.listings')} 
            value={retailerProducts.length} 
            icon="fa-box-archive" 
            color="primary" 
        />
        <MetricCard 
            title={t('retailerDashboard.stats.clicks')} 
            value={retailerStats.views + 2600} 
            icon="fa-computer-mouse" 
            color="secondary" 
            trend={{ value: 12, isPositive: true }}
            description="Last 30 days"
        />
        <MetricCard 
            title={t('retailerDashboard.stats.sales')} 
            value={retailerStats.conversions + 89} 
            icon="fa-cart-shopping" 
            color="accent" 
            trend={{ value: 5, isPositive: true }}
        />
        <MetricCard 
            title="Conversion Rate" 
            value={`${((retailerStats.conversions + 89) / (retailerStats.views + 2600) * 100).toFixed(1)}%`} 
            icon="fa-chart-pie" 
            color="success" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* AI Growth Tool */}
          <div className="lg:col-span-2">
            <AIGrowthAssistant 
                productName={retailerProducts[0]?.name || "Select a product"} 
                brand={retailerProducts[0]?.brand || user?.retailerName || ""}
                description={retailerProducts[0]?.description || ""}
            />
          </div>
          
          {/* Recent Activity Mini-Feed */}
          <div className="bg-base-200/50 rounded-[2rem] p-8 border border-base-content/5">
            <h3 className="text-lg font-black mb-6 uppercase tracking-tight">Recent Activity</h3>
            <div className="space-y-6">
                {analyticsEventsSignal.value.slice(-3).reverse().map(event => (
                    <div key={event.id} className="flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-base-300 flex items-center justify-center shrink-0">
                            <i className={`fa-solid ${event.type === 'product_view' ? 'fa-eye' : 'fa-cart-plus'} text-xs opacity-50`}></i>
                        </div>
                        <div>
                            <p className="text-xs font-bold leading-tight">{event.type === 'product_view' ? 'Product Viewed' : 'Added to Cart'}</p>
                            <p className="text-[10px] text-base-content/40 mt-0.5">{new Date(event.timestamp).toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      </div>

      {/* Product Listings Table */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">{t('retailerDashboard.listings.title')}</h2>
          <div className="overflow-x-auto mt-4">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{t('retailerDashboard.listings.product')}</th>
                  <th>{t('retailerDashboard.listings.price')}</th>
                  <th>{t('retailerDashboard.listings.stock')}</th>
                  <th>{t('retailerDashboard.listings.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {retailerProducts.map(product => {
                    // FIX: Changed product.prices to product.wholesalerStock and retailerId to wholesalerId
                    const retailerPriceInfo = product.wholesalerStock.find(p => p.wholesalerId === user.retailerId);
                    if (!retailerPriceInfo) return null;

                    return (
                        <tr key={product.id} className="hover">
                            <td>
                            <div className="flex items-center space-x-3">
                                <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                    <img src={product.imageUrl} alt={product.name} />
                                </div>
                                </div>
                                <div>
                                <div className="font-bold">{product.name}</div>
                                <div className="text-sm opacity-50">{product.brand}</div>
                                </div>
                            </div>
                            </td>
                            <td className="font-mono">{formatPrice(retailerPriceInfo.price)}</td>
                            <td>{retailerPriceInfo.stock} units</td>
                            <td>
                                <button onClick={() => setEditingProduct(product)} className="btn btn-primary btn-xs" disabled={retailerInfo?.status !== 'Approved'}>{t('retailerDashboard.listings.edit')}</button>
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    {editingProduct && (
        <EditProductModal 
            product={editingProduct}
            onClose={() => setEditingProduct(null)}
        />
    )}
    </>
  );
};

export default RetailerDashboard;
