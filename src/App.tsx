
import React, { useContext, useEffect, lazy, Suspense, useState } from 'react';
import { AppContext } from './contexts/AppContext';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { LanguageContext } from './contexts/LanguageContext';
import { useCurrency } from './contexts/CurrencyContext';
import { useTranslation } from './hooks/useTranslation';
import Spinner from './components/common/Spinner';
import { loadCartDrawer, loadLoginModal, loadQuickViewModal } from './utils/deferredOverlays';
import { services } from './services/ServiceContainer';
import SupportChat from './components/common/SupportChat';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const RetailerDashboard = lazy(() => import('./pages/RetailerDashboard'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginModal = lazy(loadLoginModal);
const CartDrawer = lazy(loadCartDrawer);
const QuickViewModal = lazy(loadQuickViewModal);

const ModalOverlayFallback: React.FC<{ label: string }> = ({ label }) => (
   <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="status" aria-live="polite" aria-label={label}>
      <div className="absolute inset-0 bg-base-100/70 backdrop-blur-sm" aria-hidden="true"></div>
      <div className="relative bg-base-200/95 border border-base-content/10 rounded-3xl shadow-2xl px-8 py-10 flex flex-col items-center gap-4 min-w-[18rem]">
         <span className="loading loading-spinner loading-lg text-primary" aria-hidden="true"></span>
         <span className="font-semibold text-base-content/70 text-center">{label}</span>
      </div>
   </div>
);

const DrawerOverlayFallback: React.FC<{ label: string }> = ({ label }) => (
   <div className="fixed inset-0 z-[100]" role="status" aria-live="polite" aria-label={label}>
      <div className="absolute inset-0 bg-base-100/60 backdrop-blur-sm" aria-hidden="true"></div>
      <div className="absolute top-0 right-0 h-[100dvh] w-full sm:w-[450px] bg-base-200/90 backdrop-blur-3xl border-l border-base-content/10 shadow-2xl shadow-primary/20 p-6 flex flex-col gap-4">
         <div className="flex items-center gap-3 border-b border-base-content/10 pb-4">
            <span className="loading loading-spinner loading-md text-primary" aria-hidden="true"></span>
            <span className="font-semibold text-base-content/70">{label}</span>
         </div>
         <div className="skeleton h-24 rounded-3xl" aria-hidden="true"></div>
         <div className="skeleton h-24 rounded-3xl" aria-hidden="true"></div>
         <div className="skeleton h-24 rounded-3xl" aria-hidden="true"></div>
         <div className="mt-auto skeleton h-16 rounded-2xl" aria-hidden="true"></div>
      </div>
   </div>
);

const ProtectedRouteFallback: React.FC = () => (
   <div className="flex min-h-[50vh] items-center justify-center py-20" role="status" aria-label="Loading">
      <Spinner />
   </div>
);

const App: React.FC = () => {
    const { user, isAuthenticated, isAuthLoading, toast, error: backendError, isLoginModalOpen, isCartDrawerOpen, quickViewProductId } = useContext(AppContext);
    const { language } = useContext(LanguageContext);
    const { error: currencyError } = useCurrency();
    const { t } = useTranslation();
    const location = useLocation();
    const [hasLoadedLoginModal, setHasLoadedLoginModal] = useState(false);
    const [hasLoadedCartDrawer, setHasLoadedCartDrawer] = useState(false);
    const [hasLoadedQuickViewModal, setHasLoadedQuickViewModal] = useState(false);

    useEffect(() => {
       document.documentElement.lang = language;
    }, [language]);

    useEffect(() => {
       window.scrollTo(0, 0);
       services.analytics.trackPageView(location.pathname);
    }, [location.pathname]);

    useEffect(() => {
        const mainContent = document.getElementById('main-content');
        if (mainContent && location.pathname !== '/') {
            mainContent.focus({ preventScroll: true });
        }
    }, [location.pathname]);

    useEffect(() => {
       if (isLoginModalOpen) {
          setHasLoadedLoginModal(true);
       }
    }, [isLoginModalOpen]);

    useEffect(() => {
       if (isCartDrawerOpen) {
          setHasLoadedCartDrawer(true);
       }
    }, [isCartDrawerOpen]);

    useEffect(() => {
       if (quickViewProductId) {
          setHasLoadedQuickViewModal(true);
       }
    }, [quickViewProductId]);

    const renderProtectedRoute = (element: React.ReactNode, allowAccess: boolean) => {
       if (isAuthLoading) {
          return <ProtectedRouteFallback />;
       }

       return allowAccess ? element : <Navigate to="/" replace />;
    };

    if (currencyError || backendError) {
       return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content relative overflow-hidden" role="alert">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50"></div>
             <div className="relative z-10 text-center px-4">
                 <div className="w-24 h-24 bg-error/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-error/10">
                     <i className="fa-solid fa-triangle-exclamation text-5xl text-error animate-pulse" aria-hidden="true"></i>
                 </div>
                 <h1 className="text-4xl font-black mb-4 tracking-tight">{t('error.title') || 'Connection Issue'}</h1>
                 <p className="text-base-content/60 max-w-md mx-auto mb-10 font-medium">
                     {backendError || currencyError || 'No pudimos establecer conexión con nuestros servicios centrales.'}
                 </p>
                 <div className="flex items-center justify-center gap-4">
                     <button onClick={() => window.location.reload()} className="btn btn-primary rounded-2xl px-8 h-12 shadow-lg shadow-primary/20">Intentar de Nuevo</button>
                 </div>
             </div>
          </div>
       );
    }

   return (
      <div className="flex flex-col min-h-screen font-sans">
         <Header />
         <main id="main-content" className="flex-grow" tabIndex={-1}>
            <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20"><Spinner /></div>}>
               <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/catalog" element={<ProductListPage />} />
                  <Route path="/catalog/:categoryId" element={<ProductListPage />} />
                  <Route path="/product/:slug" element={<ProductDetailPage />} />

                  <Route path="/profile" element={renderProtectedRoute(<ProfilePage />, isAuthenticated)} />
                  <Route path="/admin" element={renderProtectedRoute(<AdminDashboard />, isAuthenticated && user?.role === 'admin')} />
                  <Route path="/settings" element={renderProtectedRoute(<SettingsPage />, isAuthenticated && user?.role === 'admin')} />
                  <Route path="/retailer" element={renderProtectedRoute(<RetailerDashboard />, isAuthenticated && user?.role === 'retailer')} />
                  <Route path="/cart" element={renderProtectedRoute(<CartPage />, isAuthenticated)} />
                  <Route path="/checkout" element={renderProtectedRoute(<CheckoutPage />, isAuthenticated)} />
                  <Route path="/order/:id" element={renderProtectedRoute(<OrderDetailPage />, isAuthenticated)} />

                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<NotFoundPage />} />
               </Routes>
            </Suspense>
         </main>
         <Footer />
         <SupportChat />
         {hasLoadedCartDrawer && (
            <Suspense fallback={isCartDrawerOpen ? <DrawerOverlayFallback label={t('cart.title') || 'Loading cart'} /> : null}>
               <CartDrawer />
            </Suspense>
         )}
         {hasLoadedQuickViewModal && (
            <Suspense fallback={quickViewProductId ? <ModalOverlayFallback label="Loading product preview" /> : null}>
               <QuickViewModal />
            </Suspense>
         )}
         {hasLoadedLoginModal && (
            <Suspense fallback={isLoginModalOpen ? <ModalOverlayFallback label={t('auth.title.login') || 'Loading sign in'} /> : null}>
               <LoginModal />
            </Suspense>
         )}
         {toast && (
             <div className="pointer-events-none fixed inset-x-0 top-6 z-[200] flex justify-center px-4" role="alert" aria-live="polite">
                <div className={`pointer-events-auto w-full max-w-md rounded-2xl shadow-2xl ${toast.type === 'success' ? 'alert alert-success border-success/20' : 'alert alert-error border-error/20'} animate-fade-in`}>
                   <i className={`fa-solid ${toast.type === 'success' ? 'fa-check-circle' : 'fa-circle-exclamation'}`} aria-hidden="true"></i>
                   <span>{toast.message}</span>
                </div>
             </div>
         )}
      </div>
   );
};

export default App;
