
import React, { useContext, useState, useCallback } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import SettingsBar from './SettingsBar';
import CategoryNav from './CategoryNav';
import NotificationBell from './NotificationBell';
import { preloadCartDrawer, preloadLoginModal } from '../../utils/deferredOverlays';
import { cartItemCountSignal } from '../../signals/auth.signals';
import { siteNameSignal, logoUrlSignal } from '../../signals/branding.signals';

// Custom SVG Chip Icon
const ChipIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
    <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="18" x2="8" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="18" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="16" x2="6" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  useSignals();
  const { 
    setView, setSearchTerm, setCategory, 
    isAuthenticated, user, signOut, setIsLoginModalOpen, setIsCartDrawerOpen
  } = useContext(AppContext);
  const [localSearch, setLocalSearch] = useState('');
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = localSearch.trim();
    if (trimmed) {
      setSearchTerm(trimmed);
      setCategory(null);
      navigate(`/catalog?q=${encodeURIComponent(trimmed)}`);
    }
  }, [localSearch, setSearchTerm, setCategory, navigate]);

  const goHome = () => {
    setSearchTerm('');
    setCategory(null);
    setLocalSearch('');
    navigate('/');
  };

  const goCatalog = () => {
    setSearchTerm('');
    setCategory(null);
    navigate('/catalog');
  };

  const handleLogout = () => {
    signOut();
  };

  const handleOpenCart = () => {
    if (!isAuthenticated || !user) {
      preloadLoginModal();
      setIsLoginModalOpen(true);
      return;
    }

    preloadCartDrawer();
    setIsCartDrawerOpen(true);
  };

  const handleOpenLogin = () => {
    preloadLoginModal();
    setIsLoginModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* Top Thin Bar - System controls and secondary links */}
      <div className="bg-base-300 w-full py-1.5 border-b border-base-content/5">
          <div className="container mx-auto px-4 flex justify-between items-center text-xs text-base-content/60 font-medium">
            <div className="hidden gap-4 md:flex" aria-label={t('header.trust.label')}>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-success" aria-hidden="true"></i>
                  {t('header.trust.verified')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fa-solid fa-truck-fast text-primary" aria-hidden="true"></i>
                  {t('header.trust.shipping')}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-info" aria-hidden="true"></i>
                  {t('header.trust.secure')}
                </span>
            </div>
                <div className="flex items-center gap-2 lg:gap-4 ml-auto">
                    <div className="hidden lg:flex items-center gap-2 text-primary font-semibold">
                        <i className="fa-solid fa-bolt text-warning" aria-hidden="true"></i>
                        {t('header.bannerText')}{' '}
                        <button type="button" onClick={goCatalog} className="underline hover:text-secondary transition-colors">
                            {t('header.bannerLink')}
                        </button>
                    </div>
                    <div className="scale-90 origin-right">
                    <SettingsBar />
                </div>
            </div>
        </div>
      </div>

      {/* Main Navbar — Glassmorphic */}
      <div className="bg-base-200/85 backdrop-blur-2xl shadow-lg shadow-primary/5">
        <div className="container mx-auto flex items-center gap-4 px-4 py-2 lg:gap-8 lg:py-3">
          
          {/* Logo (Left) */}
          <div className="w-auto flex-shrink-0">
            <button type="button" className="flex items-center gap-2.5 px-1 cursor-pointer group" onClick={goHome} aria-label={`${siteNameSignal.value} home`}>
              {logoUrlSignal.value ? (
                <img src={logoUrlSignal.value} alt={siteNameSignal.value} className="h-9 w-auto object-contain" />
              ) : (
                <ChipIcon className="w-9 h-9 text-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(124,58,237,0.7)] transition-all duration-300" />
              )}
              <span className="text-3xl font-bold tracking-tight hidden sm:block" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {siteNameSignal.value.split(/(?=[A-Z])/)[0]}<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{siteNameSignal.value.split(/(?=[A-Z])/).slice(1).join('')}</span>
              </span>
            </button>
          </div>

          {/* Search Bar (Center) */}
          <div className="flex flex-1 max-w-2xl px-2">
            <form onSubmit={handleSearch} className="form-control w-full relative">
              <input
                type="search"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={t('header.searchPlaceholder')}
                aria-label={t('header.searchPlaceholder')}
                autoComplete="off"
                className="input w-full rounded-full bg-base-300/40 border border-base-content/10 pl-6 pr-14 placeholder:text-base-content/40 focus:border-primary/50 focus:bg-base-200 hover:bg-base-300/60 shadow-inner transition-all duration-300"
              />
              <button 
                type="submit" 
                aria-label={t('header.searchAction')}
                className="btn btn-primary btn-circle absolute top-1 right-1 min-h-0 h-10 w-10 border-0 bg-gradient-to-r from-primary to-secondary shadow-md hover:shadow-primary/30"
              >
                <i className="fa-solid fa-magnifying-glass text-white text-sm" aria-hidden="true"></i>
              </button>
            </form>
          </div>

          {/* Controls (Right) */}
          <div className="flex w-auto flex-shrink-0 items-center gap-1 lg:gap-3">
            {/* Cart Button */}
            {(!user || user.role === 'user') && (
              <button 
                className="btn btn-ghost btn-circle relative hover:bg-primary/10 transition-colors" 
                onClick={handleOpenCart}
                onMouseEnter={preloadCartDrawer}
                onFocus={preloadCartDrawer}
                aria-label={`${t('header.cart') || 'Cart'}${cartItemCountSignal.value > 0 ? ` (${cartItemCountSignal.value} items)` : ''}`}
              >
                <i className="fa-solid fa-cart-shopping text-xl text-base-content/80" aria-hidden="true"></i>
                {cartItemCountSignal.value > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-tr from-error to-amber-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-base-200 shadow-md">
                    {cartItemCountSignal.value}
                  </span>
                )}
              </button>
            )}
            
            <NotificationBell />

            {/* Profile / Login */}
            {isAuthenticated && user ? (
              <div className="dropdown dropdown-end">
                <button type="button" tabIndex={0} className="btn btn-ghost rounded-full px-2 gap-2 hover:bg-primary/5 transition-all outline-none border border-transparent hover:border-base-content/10" aria-label={t('header.profileMenu')}>
                  <div className="avatar">
                    <div className="w-8 rounded-full ring-2 ring-primary/20">
                      <img alt={user.name} src={user.avatarUrl} />
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none text-left">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-base-content/40">{t('header.profile')}</span>
                    <span className="text-sm font-semibold max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                  </div>
                  <i className="fa-solid fa-chevron-down text-[10px] text-base-content/40 hidden md:block ml-1"></i>
                </button>
                <ul tabIndex={0} className="dropdown-content mt-4 z-[100] flex w-56 list-none flex-col gap-1 rounded-2xl border border-base-content/10 bg-base-200/95 p-3 shadow-2xl backdrop-blur-2xl">
                  <li className="px-4 py-2 border-b border-base-content/5 mb-2">
                    <div className="font-bold text-base-content p-0">{user.name}</div>
                    <div className="text-xs text-base-content/50 p-0 font-medium">{user.email || 'user@electroprice.com'}</div>
                  </li>
                  {user.role === 'user' && (
                     <li>
                      <button type="button" onClick={() => navigate('/profile')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition-colors hover:bg-primary/10 hover:text-primary">
                        <i className="fa-solid fa-user fa-fw opacity-70"></i>
                        {t('header.nav.myAccount')}
                      </button>
                    </li>
                  )}
                  {user.role === 'admin' && (
                     <li>
                      <button type="button" onClick={() => setView('adminDashboard')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition-colors hover:bg-primary/10 hover:text-primary">
                        <i className="fa-solid fa-shield-halved fa-fw opacity-70"></i>
                        {t('header.nav.adminPanel')}
                      </button>
                    </li>
                  )}
                  {user.role === 'user' && (
                     <li>
                      <button type="button" onClick={() => navigate('/profile?tab=orders')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition-colors hover:bg-primary/10 hover:text-primary">
                        <i className="fa-solid fa-box fa-fw opacity-70"></i>
                        {t('header.nav.myOrders')}
                      </button>
                    </li>
                  )}
                  {user.role === 'admin' && (
                     <li>
                      <button type="button" onClick={() => setView('settings')} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold transition-colors hover:bg-primary/10 hover:text-primary">
                        <i className="fa-solid fa-gear fa-fw opacity-70"></i>
                        {t('header.nav.systemSettings')}
                      </button>
                    </li>
                  )}
                  <li className="mt-2 text-error">
                    <button type="button" onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-bold transition-colors hover:bg-error/10 hover:text-error">
                      <i className="fa-solid fa-arrow-right-from-bracket fa-fw opacity-70"></i>
                      {t('header.signOut')}
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-md rounded-full bg-gradient-to-r from-primary to-secondary border-0 text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 font-bold px-6 ml-2" 
                onClick={handleOpenLogin}
                onMouseEnter={preloadLoginModal}
                onFocus={preloadLoginModal}
                aria-label={t('header.signIn')}
              >
                <i className="fa-solid fa-user hidden sm:block"></i> {t('header.signIn')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Category Nav is injected below Header by layout */}
      <CategoryNav />
    </header>
  );
};

export default Header;
