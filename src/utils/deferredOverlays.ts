import { preloadSanitize } from './deferredSanitize';

export const loadLoginModal = () => import('../components/auth/LoginModal');

export const loadQuickViewModal = () => import('../components/product/QuickViewModal');

export const loadCartDrawer = () =>
  import('../components/cart/CartDrawer').then((module) => ({
    default: module.CartDrawer,
  }));

export const preloadLoginModal = () => {
  preloadSanitize();
  void loadLoginModal();
};

export const preloadQuickViewModal = () => {
  void loadQuickViewModal();
};

export const preloadCartDrawer = () => {
  void loadCartDrawer();
};
