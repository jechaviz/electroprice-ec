import React, { createContext, ReactNode, useEffect } from 'react';
import type { User, Product, Review, Toast, Order, Supplier, Wholesaler } from '../types';
import { useNavigate } from 'react-router-dom';
import { getProductUrl, getCategoryUrl } from '../utils/slugify';

// Signals
import { 
    viewSignal, productIdSignal, orderIdSignal, searchTermSignal, categorySignal, 
    highlightedProductIdSignal, quickViewProductIdSignal, isCartDrawerOpenSignal, 
    isCheckoutLoadingSignal, isLoginModalOpenSignal, toastSignal, View
} from '../signals/ui.signals';
import { currentUserSignal, isAuthLoadingSignal, isAuthenticatedSignal } from '../signals/auth.signals';
import { 
    productsSignal, usersSignal, reviewsSignal, ordersSignal, suppliersSignal, 
    wholesalersSignal, isCatalogLoadingSignal, isAccountDataLoadingSignal, dataErrorSignal 
} from '../signals/data.signals';

// Services
import { services } from '../services/ServiceContainer';


interface AppContextType {
   view: View;
   setView: (view: View) => void;
   productId: string | null;
   setProductId: (id: string | null) => void;
   orderId: string | null;
   setOrderId: (id: string | null) => void;
   searchTerm: string;
   setSearchTerm: (term: string) => void;
   category: string | null;
   setCategory: (cat: string | null) => void;
   highlightedProductId: string | null;
   setHighlightedProductId: (id: string | null) => void;
   quickViewProductId: string | null;
   setQuickViewProductId: (id: string | null) => void;

   navigateToProduct: (product: Product) => void;
   navigateToCategory: (categoryId: string) => void;

   // Auth state
   isAuthenticated: boolean;
   isAuthLoading: boolean;
   user: User | null;
   signUp: typeof services.auth.signUp;
   signIn: typeof services.auth.signIn;
   signInWithGoogle: typeof services.auth.signInWithGoogle;
   signOut: () => void;
   isLoginModalOpen: boolean;
   setIsLoginModalOpen: (isOpen: boolean) => void;
   isCartDrawerOpen: boolean;
   setIsCartDrawerOpen: (isOpen: boolean) => void;

   // Centralized Data
   products: Product[];
   users: User[];
   reviews: Review[];
   orders: Order[];
   suppliers: Supplier[];
   wholesalers: Wholesaler[];
   loading: boolean;
   error: string | null;

   // Data Manipulation Functions
   toggleFavorite: typeof services.user.toggleFavorite;
   addReview: typeof services.user.addReview;
   updateUserStatus: typeof services.user.updateUserStatus;
   updateReviewStatus: typeof services.user.updateReviewStatus;
   updateProductPrice: typeof services.user.updateProductPrice;
   updateUserContactInfo: typeof services.user.updateUserContactInfo;
   addAddress: typeof services.user.addAddress;
   removeAddress: typeof services.user.removeAddress;
   addPaymentMethod: typeof services.user.addPaymentMethod;
   removePaymentMethod: typeof services.user.removePaymentMethod;

   // E-commerce Functions
   addToCart: typeof services.cart.addToCart;
   updateCartQuantity: typeof services.cart.updateCartQuantity;
   removeFromCart: typeof services.cart.removeFromCart;
   placeOrder: typeof services.cart.placeOrder;
   cancelOrder: (id: string) => Promise<void>;
   requestReturn: (id: string) => Promise<void>;
   confirmDelivery: (id: string) => Promise<void>;
   refundReturn: (id: string) => Promise<void>;
   updateOrderStatus: typeof services.cart.updateOrderStatus;

   // UI Feedback
   toast: Toast | null;
   setToast: (toast: Toast | null) => void;
   
   // DI Container access
   services: typeof services;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
   const navigate = useNavigate();

   // Navigation Sync
   const setView = React.useCallback((nextView: View) => {
      viewSignal.value = nextView;
      const routes: Record<string, string> = { 
          home: '/', list: '/catalog', profile: '/profile', 
          adminDashboard: '/admin', settings: '/settings', cart: '/cart', checkout: '/checkout'
      };
      if (routes[nextView]) navigate(routes[nextView]);
   }, [navigate]);

   const navigateToProduct = React.useCallback((product: Product) => {
      productIdSignal.value = product.id;
      viewSignal.value = 'detail';
      navigate(getProductUrl(product.name, product.id));
   }, [navigate]);

   const navigateToCategory = React.useCallback((categoryId: string) => {
      categorySignal.value = categoryId;
      viewSignal.value = 'list';
      navigate(getCategoryUrl(categoryId));
   }, [navigate]);

   // Initial Data Fetching
   useEffect(() => {
      void services.data.fetchPublicData();
   }, []);

   // Auth Sync
   useEffect(() => {
      let cleanup: (() => void) | undefined;
      const initSync = async () => {
          cleanup = await services.auth.initializeAuthSync();
      };
      void initSync();
      return () => cleanup?.();
   }, []);

   // Privileged Data Fetching
   useEffect(() => {
       if (currentUserSignal.value) {
           void services.data.fetchPrivilegedData(currentUserSignal.value.id, currentUserSignal.value.role);
       }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [currentUserSignal.value]);

   // Toast Auto-clear
   useEffect(() => {
      if (toastSignal.value) {
         const timer = setTimeout(() => toastSignal.value = null, 3000);
         return () => clearTimeout(timer);
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [toastSignal.value]);

   const signOut = React.useCallback(() => {
      services.auth.signOut();
      usersSignal.value = [];
      ordersSignal.value = [];
      viewSignal.value = 'home';
      services.notification.success('You have been logged out.');
      navigate('/');
   }, [navigate]);

  const contextValue = {
      view: viewSignal.value,
      setView,
      productId: productIdSignal.value,
      setProductId: (id: string | null) => { productIdSignal.value = id; },
      orderId: orderIdSignal.value,
      setOrderId: (id: string | null) => { orderIdSignal.value = id; },
      searchTerm: searchTermSignal.value,
      setSearchTerm: (term: string) => { searchTermSignal.value = term; },
      category: categorySignal.value,
      setCategory: (cat: string | null) => { categorySignal.value = cat; },
      highlightedProductId: highlightedProductIdSignal.value,
      setHighlightedProductId: (id: string | null) => { highlightedProductIdSignal.value = id; },
      quickViewProductId: quickViewProductIdSignal.value,
      setQuickViewProductId: (id: string | null) => { quickViewProductIdSignal.value = id; },

      navigateToProduct,
      navigateToCategory,

      // Auth
      isAuthenticated: isAuthenticatedSignal.value,
      isAuthLoading: isAuthLoadingSignal.value,
      user: currentUserSignal.value,
      signUp: services.auth.signUp,
      signIn: services.auth.signIn,
      signInWithGoogle: services.auth.signInWithGoogle,
      signOut,
      isLoginModalOpen: isLoginModalOpenSignal.value, 
      setIsLoginModalOpen: (isOpen: boolean) => { isLoginModalOpenSignal.value = isOpen; },
      isCartDrawerOpen: isCartDrawerOpenSignal.value,
      setIsCartDrawerOpen: (isOpen: boolean) => { isCartDrawerOpenSignal.value = isOpen; },

      // Data
      products: productsSignal.value,
      users: usersSignal.value,
      reviews: reviewsSignal.value,
      orders: ordersSignal.value,
      suppliers: suppliersSignal.value,
      wholesalers: wholesalersSignal.value,
      loading: isCatalogLoadingSignal.value || isAccountDataLoadingSignal.value || isCheckoutLoadingSignal.value,
      error: dataErrorSignal.value,

      // User Actions
      toggleFavorite: services.user.toggleFavorite,
      addReview: services.user.addReview,
      updateUserStatus: services.user.updateUserStatus,
      updateReviewStatus: services.user.updateReviewStatus,
      updateProductPrice: services.user.updateProductPrice,
      updateUserContactInfo: services.user.updateUserContactInfo,
      addAddress: services.user.addAddress,
      removeAddress: services.user.removeAddress,
      addPaymentMethod: services.user.addPaymentMethod,
      removePaymentMethod: services.user.removePaymentMethod,
 
      // Cart
      addToCart: services.cart.addToCart,
      updateCartQuantity: services.cart.updateCartQuantity,
      removeFromCart: services.cart.removeFromCart,
      placeOrder: services.cart.placeOrder,
      cancelOrder: async (orderId: string) => { await services.cart.updateOrderStatus(orderId, 'Cancelled'); },
      requestReturn: async (orderId: string) => { await services.orderLifecycle.requestReturnById(orderId); },
      confirmDelivery: async (orderId: string) => { await services.orderLifecycle.confirmDeliveryById(orderId); },
      refundReturn: async (orderId: string) => { await services.orderLifecycle.refundReturnById(orderId); },
      updateOrderStatus: services.cart.updateOrderStatus,

      // UI
      toast: toastSignal.value,
      setToast: (toast: Toast | null) => { toastSignal.value = toast; },
      
      services
   };

   return (
      <AppContext.Provider value={contextValue as AppContextType}>
         {children}
      </AppContext.Provider>
   );
};
