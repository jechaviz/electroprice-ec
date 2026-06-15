import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getCartItemKey, selectedOptionsLabel } from '../../utils/cartLine';
import ImageWithFallback from '../common/ImageWithFallback';

export const CartDrawer: React.FC = () => {
    const { isCartDrawerOpen, setIsCartDrawerOpen, user, products, updateCartQuantity, removeFromCart, setView } = useContext(AppContext);
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();

    if (!user || user.role !== 'user') return null;

    const cartItems = user.cart.map((item) => {
        const cartItemId = getCartItemKey(item);
        return {
            ...item,
            cartItemId,
            optionsLabel: selectedOptionsLabel(item.selectedOptions),
            product: products.find((product) => product.id === item.productId),
        };
    });
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleClose = () => setIsCartDrawerOpen(false);

    const handleProceed = () => {
        setIsCartDrawerOpen(false);
        setView('checkout');
    };

    return (
        <div className={`fixed inset-0 z-[100] transition-transform duration-300 ${isCartDrawerOpen ? 'translate-x-0' : 'translate-x-[100%]'}`}>
            <div
                className={`absolute inset-0 bg-base-100/60 backdrop-blur-sm transition-opacity duration-300 ${isCartDrawerOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
                aria-hidden="true"
            />

            <div className={`absolute right-0 top-0 flex h-[100dvh] w-full flex-col border-l border-base-content/10 bg-base-200/90 shadow-2xl shadow-primary/20 backdrop-blur-3xl transition-transform duration-500 ease-out sm:w-[450px] ${isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="relative flex shrink-0 flex-col items-center justify-center gap-3 border-b border-base-content/10 p-6 pb-8">
                    <button type="button" onClick={handleClose} className="btn btn-sm btn-circle btn-ghost absolute left-6 top-6 text-base-content/50 hover:text-base-content" aria-label={t('common.close')}>
                        <i className="fa-solid fa-xmark text-lg" aria-hidden="true"></i>
                    </button>
                    <h2 className="heading mt-2 flex items-center justify-center gap-2 text-2xl font-bold text-base-content">
                        <i className="fa-solid fa-bag-shopping text-primary" aria-hidden="true"></i>
                        {t('cart.title')}
                    </h2>
                    <div className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-inner shadow-primary/5">
                        {itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')}
                    </div>
                </div>

                <div className="custom-scrollbar flex flex-1 flex-col gap-6 overflow-y-auto p-6">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-1 animate-fade-in-up flex-col items-center justify-center text-center opacity-70">
                            <i className="fa-solid fa-cart-arrow-down mb-6 text-6xl text-base-content/20 transition-transform group-hover:-rotate-12" aria-hidden="true"></i>
                            <p className="heading text-xl font-bold text-base-content">{t('cart.emptyTitle')}</p>
                            <p className="body mt-2 text-sm text-base-content/60">{t('cart.emptySubtitle')}</p>
                            <button type="button" onClick={handleClose} className="btn mt-8 rounded-full border-base-content/20 bg-transparent px-8 text-base-content shadow-sm transition-all hover:border-base-content/40 hover:bg-base-content/5">
                                {t('cart.continueShopping')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {cartItems.map((item, index) => (
                                <div key={item.cartItemId} className="flex shrink-0 animate-slide-in-right items-center gap-4 rounded-3xl border border-base-content/5 bg-base-300/40 p-4 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] transition-all duration-300 hover:bg-base-300" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-base-content/5 bg-base-100 p-2 shadow-inner">
                                        {item.product ? (
                                            <ImageWithFallback
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="h-full w-full object-contain drop-shadow-md"
                                            />
                                        ) : (
                                            <i className="fa-solid fa-box text-2xl text-base-content/20" aria-hidden="true"></i>
                                        )}
                                    </div>

                                    <div className="flex min-w-0 flex-1 flex-col gap-2 pr-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <h4 className="heading truncate text-sm font-bold leading-tight text-base-content">{item.product?.name || item.productId}</h4>
                                                <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-primary">{item.product?.brand || t('cart.product')}</p>
                                                {item.optionsLabel && (
                                                    <p className="mt-1 truncate text-[10px] font-semibold text-base-content/45">
                                                        {item.optionsLabel}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.cartItemId)}
                                                className="btn btn-xs btn-circle btn-ghost shrink-0 text-base-content/40 transition-colors hover:bg-error/10 hover:text-error"
                                                title={t('cart.remove')}
                                                aria-label={t('cart.remove')}
                                            >
                                                <i className="fa-solid fa-trash-can text-xs" aria-hidden="true"></i>
                                            </button>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div className="flex items-center gap-3 rounded-full border border-base-content/10 bg-base-100/50 px-2.5 py-1 shadow-inner">
                                                <button
                                                    type="button"
                                                    onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-base-200 text-base-content shadow-sm transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                                    aria-label={t('cart.decreaseQuantity')}
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <i className="fa-solid fa-minus text-[10px]" aria-hidden="true"></i>
                                                </button>
                                                <span className="inline-block min-w-[2ch] text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                                                    className="flex h-6 w-6 items-center justify-center rounded-full bg-base-200 text-base-content shadow-sm transition-colors hover:text-primary"
                                                    aria-label={t('cart.increaseQuantity')}
                                                >
                                                    <i className="fa-solid fa-plus text-[10px]" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                            <span className="heading font-mono text-base font-bold text-base-content">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="safe-area-pb shrink-0 border-t border-base-content/10 bg-base-300/60 p-6 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-sm font-bold uppercase tracking-wide text-base-content/70">{t('cart.subtotal')}</span>
                            <span className="heading font-mono text-2xl font-black text-base-content drop-shadow-sm">{formatPrice(subtotal)}</span>
                        </div>
                        <p className="mb-6 text-[10px] font-medium text-base-content/50">{t('cart.shippingCalculated')}</p>

                        <button
                            type="button"
                            onClick={handleProceed}
                            className="group relative flex h-14 w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary px-6 text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-primary/40"
                        >
                            <div className="absolute inset-0 -translate-x-[150%] skew-x-[-25deg] bg-white/20 transition-transform duration-700 group-hover:translate-x-[150%]"></div>
                            <span className="heading relative z-10 text-[15px] font-bold uppercase tracking-widest">{t('cart.checkout')}</span>
                            <div className="relative z-10 flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-2 shadow-inner backdrop-blur">
                                <span className="font-mono text-sm font-bold tracking-tight">{formatPrice(subtotal)}</span>
                                <i className="fa-solid fa-arrow-right text-xs transition-transform group-hover:translate-x-1" aria-hidden="true"></i>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="mt-4 w-full py-2 text-center text-xs font-semibold text-base-content/50 transition-colors hover:text-primary"
                        >
                            {t('cart.continueShopping')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
