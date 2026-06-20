import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { OrderStatus } from '../types';
import ImageWithFallback from '../components/common/ImageWithFallback';
import { OverviewTab } from '../components/profile/OverviewTab';
import { OrdersTab } from '../components/profile/OrdersTab';
import { FavoritesTab } from '../components/profile/FavoritesTab';
import { ReviewsTab } from '../components/profile/ReviewsTab';
import { AddressesSection } from '../components/profile/AddressesSection';
import { PaymentSection } from '../components/profile/PaymentSection';
import { SettingsSection } from '../components/profile/SettingsSection';
import { PreferencesSection } from '../components/profile/PreferencesSection';
import { useSearchParams } from 'react-router-dom';

type ProfileTab = 'overview' | 'orders' | 'favorites' | 'reviews' | 'addresses' | 'payment' | 'settings' | 'preferences';

const tabs: { id: ProfileTab; labelKey: string; icon: string }[] = [
  { id: 'overview', labelKey: 'profile.tabs.overview', icon: 'fa-gauge-high' },
  { id: 'orders', labelKey: 'profile.tabs.orders', icon: 'fa-receipt' },
  { id: 'favorites', labelKey: 'profile.tabs.favorites', icon: 'fa-heart' },
  { id: 'reviews', labelKey: 'profile.tabs.reviews', icon: 'fa-star' },
  { id: 'addresses', labelKey: 'profile.tabs.addresses', icon: 'fa-map-location-dot' },
  { id: 'payment', labelKey: 'profile.tabs.payment', icon: 'fa-credit-card' },
  { id: 'settings', labelKey: 'profile.tabs.settings', icon: 'fa-user-gear' },
  { id: 'preferences', labelKey: 'profile.tabs.preferences', icon: 'fa-bell' },
];

const isProfileTab = (value: string | null): value is ProfileTab => (
  Boolean(value) && tabs.some((tab) => tab.id === value)
);

const openOrderStatuses: OrderStatus[] = [
  'Processing',
  'Awaiting Shipment from Wholesaler',
  'Shipped to Hub',
  'Shipped to You',
  'Return Requested',
];

const ProfilePage: React.FC = () => {
  const { user, products, reviews, orders } = useContext(AppContext);
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<ProfileTab>(() => {
    const tab = searchParams.get('tab');
    return isProfileTab(tab) ? tab : 'overview';
  });

  React.useEffect(() => {
    const tab = searchParams.get('tab');
    if (isProfileTab(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [activeTab, searchParams]);

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      setSearchParams({});
    } else {
      setSearchParams({ tab });
    }
  };

  const favoriteProducts = useMemo(() => {
    if (!user) return [];
    return products.filter(product => user.favorites.includes(product.id));
  }, [user, products]);

  const userReviews = useMemo(() => {
    if (!user) return [];
    return reviews.filter(review => review.authorId === user.id);
  }, [user, reviews]);

  const userOrders = useMemo(() => {
    if (!user) return [];
    return orders
      .filter(order => order.userId === user.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [user, orders]);

  const activeOrders = useMemo(
    () => userOrders.filter(order => openOrderStatuses.includes(order.status)),
    [userOrders],
  );

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            activeOrders={activeOrders}
            userOrders={userOrders}
            favoriteProducts={favoriteProducts}
            userReviewsCount={userReviews.length}
            setActiveTab={handleTabChange}
          />
        );
      case 'orders':
        return <OrdersTab userOrders={userOrders} />;
      case 'favorites':
        return <FavoritesTab favoriteProducts={favoriteProducts} />;
      case 'reviews':
        return <ReviewsTab />;
      case 'addresses':
        return <AddressesSection />;
      case 'payment':
        return <PaymentSection />;
      case 'settings':
        return <SettingsSection />;
      case 'preferences':
        return <PreferencesSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-base-100 pb-16" data-user-dashboard>
      <div className="border-b border-base-content/10 bg-base-200/35">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-4">
              <ImageWithFallback src={user.avatarUrl} alt="" className="h-20 w-20 rounded-lg object-cover ring-1 ring-base-content/10" />
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.24em] text-primary">{t('profile.kicker')}</p>
                <h1 className="display text-3xl font-black tracking-tight md:text-4xl">{user.name}</h1>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-base-content/55">
                  <span><i className="fa-solid fa-envelope mr-2 text-primary/60" />{user.email || t('profile.header.emailFallback')}</span>
                  <span><i className="fa-solid fa-phone mr-2 text-primary/60" />{user.phone || t('profile.header.phoneFallback')}</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-base-content/10 bg-base-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-wider text-base-content/45">{t('profile.header.memberBadge')}</p>
              <p className="mt-1 font-black">{user.role === 'retailer' ? user.retailerName || t('adminDashboard.roles.retailer') : t(`adminDashboard.roles.${user.role}`)}</p>
            </div>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn btn-sm shrink-0 rounded-md border-base-content/10 ${activeTab === tab.id ? 'btn-primary text-white' : 'bg-base-100 text-base-content/65 hover:border-primary/40 hover:text-primary'}`}
                onClick={() => handleTabChange(tab.id)}
              >
                <i className={`fa-solid ${tab.icon}`} />
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default ProfilePage;
