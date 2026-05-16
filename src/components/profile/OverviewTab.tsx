import React, { useContext, useMemo } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { Order, Product } from '../../types';
import { EmptyState, SectionShell } from './ProfileUI';
import { OrderCard } from './OrdersTab';

export const OverviewTab: React.FC<{
  activeOrders: Order[];
  userOrders: Order[];
  favoriteProducts: Product[];
  userReviewsCount: number;
  setActiveTab: (tab: any) => void;
}> = ({ activeOrders, userOrders, favoriteProducts, userReviewsCount, setActiveTab }) => {
  const { user, products, setView, navigateToProduct, setOrderId } = useContext(AppContext);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const nextOrder = activeOrders[0] || userOrders[0];
  const checkoutReady = (user?.addresses || []).length > 0 && (user?.paymentMethods || []).length > 0;

  const cartItems = useMemo(() => {
    if (!user) return [];
    return user.cart.map(cartItem => ({
      ...cartItem,
      product: products.find(product => product.id === cartItem.productId),
    }));
  }, [products, user]);

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const handleViewOrder = (orderId: string) => {
    setOrderId(orderId);
    setView('orderDetail');
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: t('profile.overview.activeOrders'), value: activeOrders.length, icon: 'fa-truck-fast', tone: 'text-primary' },
          { label: t('profile.overview.savedFavorites'), value: favoriteProducts.length, icon: 'fa-heart', tone: 'text-error' },
          { label: t('profile.overview.reviewsWritten'), value: userReviewsCount, icon: 'fa-star', tone: 'text-warning' },
          { label: t('profile.overview.readyCheckout'), value: checkoutReady ? t('profile.overview.readyYes') : t('profile.overview.readyNo'), icon: 'fa-bag-shopping', tone: checkoutReady ? 'text-success' : 'text-base-content/45' },
        ].map(metric => (
          <div key={metric.label} className="rounded-lg border border-base-content/10 bg-base-200/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/45">{metric.label}</p>
                <p className="mt-2 text-xl font-black">{metric.value}</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-base-100 ${metric.tone}`}>
                <i className={`fa-solid ${metric.icon}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionShell title={t('profile.overview.nextOrder')}>
          {nextOrder ? (
            <OrderCard order={nextOrder} onViewDetails={handleViewOrder} />
          ) : (
            <EmptyState icon="fa-receipt" title={t('profile.orders.emptyTitle')} text={t('profile.orders.empty')} />
          )}
        </SectionShell>

        <SectionShell
          title={t('profile.overview.cartTitle')}
          action={<button type="button" onClick={() => setView('cart')} className="btn btn-ghost btn-sm rounded-md text-primary">{t('cart.title')}</button>}
        >
          {cartItems.length > 0 ? (
            <div className="space-y-3">
              {cartItems.slice(0, 4).map(item => (
                <div key={item.productId} className="flex items-center gap-3 rounded-lg border border-base-content/10 bg-base-100 p-3">
                  {item.product?.imageUrl && <img src={item.product.imageUrl} alt="" className="h-11 w-11 rounded-md object-cover" />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{item.product?.name || item.productId}</p>
                    <p className="text-xs text-base-content/45">x{item.quantity}</p>
                  </div>
                  <p className="text-sm font-black">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-base-content/10 pt-3">
                <span className="text-sm font-bold text-base-content/60">{t('cart.total')}</span>
                <span className="text-lg font-black">{formatPrice(cartTotal)}</span>
              </div>
            </div>
          ) : (
            <EmptyState icon="fa-cart-shopping" title={t('profile.overview.cartEmptyTitle')} text={t('cart.empty')} />
          )}
        </SectionShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionShell
          title={t('profile.tabs.favorites')}
          action={<button type="button" onClick={() => setActiveTab('favorites')} className="btn btn-ghost btn-sm rounded-md text-primary">{t('adminDashboard.actions.viewAll')}</button>}
        >
          {favoriteProducts.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {favoriteProducts.slice(0, 3).map(product => (
                <button key={product.id} type="button" onClick={() => navigateToProduct(product)} className="rounded-lg border border-base-content/10 bg-base-100 p-3 text-left hover:border-primary/40">
                  <img src={product.imageUrl} alt="" className="aspect-[4/3] w-full rounded-md object-cover" />
                  <p className="mt-3 line-clamp-2 text-sm font-bold">{product.name}</p>
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon="fa-heart" title={t('profile.favorites.emptyTitle')} text={t('profile.favorites.empty')} />
          )}
        </SectionShell>

        <SectionShell title={t('profile.overview.accountReadiness')}>
          <div className="space-y-3">
            {[
              { label: t('profile.addresses.title'), ready: (user.addresses || []).length > 0, tab: 'addresses' },
              { label: t('profile.payment.title'), ready: (user.paymentMethods || []).length > 0, tab: 'payment' },
              { label: t('profile.settings.contactInfo'), ready: Boolean(user.email || user.phone), tab: 'settings' },
            ].map(item => (
              <button key={item.label} type="button" onClick={() => setActiveTab(item.tab)} className="flex w-full items-center justify-between rounded-lg border border-base-content/10 bg-base-100 p-4 text-left hover:border-primary/40">
                <span className="font-bold">{item.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.ready ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>
                  {item.ready ? t('profile.overview.complete') : t('profile.overview.pending')}
                </span>
              </button>
            ))}
          </div>
        </SectionShell>
      </div>
    </div>
  );
};
