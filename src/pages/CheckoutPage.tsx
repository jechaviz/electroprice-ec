import React, { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../contexts/CurrencyContext';
import { preloadCartDrawer } from '../utils/deferredOverlays';
import { calculateOrderAmounts, formatTaxRate } from '../utils/pricing';
import CheckoutForm from '../components/cart/CheckoutForm';
import CheckoutSourcingPreview from '../components/subshopping/CheckoutSourcingPreview';

const CheckoutPage: React.FC = () => {
    const { user, products, wholesalers, setView, setIsCartDrawerOpen } = useContext(AppContext);
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    
    const cartDetails = useMemo(() => {
        if (!user) return [];
        return user.cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return { ...item, product };
        });
    }, [user, products]);

    const subtotal = useMemo(() => cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0), [cartDetails]);
    const amounts = useMemo(() => calculateOrderAmounts(subtotal), [subtotal]);
    const total = amounts.total;

    if (!user || cartDetails.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] bg-base-100 text-center px-4">
                <i className="fa-solid fa-cart-arrow-down text-6xl text-base-content/20 mb-6"></i>
                <h1 className="text-3xl font-black heading mb-4">{t('cart.emptyTitle')}</h1>
                <button onClick={() => setView('home')} className="btn btn-primary rounded-full px-8 uppercase tracking-widest font-black text-xs">
                    {t('common.browseProducts')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100 pb-20 animate-fade-in relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-primary/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-[50rem] h-[50rem] bg-secondary/5 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-4 py-8 lg:py-16 relative z-10 max-w-7xl">
                <header className="mb-12">
                    <h1 className="text-5xl font-black tracking-tight mb-2">
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Checkout</span>
                    </h1>
                    <div className="flex items-center gap-2 text-base-content/50 font-medium">
                        <i className="fa-solid fa-shield-check text-success"></i>
                        <span>{t('checkout.secureSubtitle')}</span>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Left Column: Form Integration */}
                    <div className="w-full lg:w-[55%]">
                        <CheckoutForm 
                            total={total} 
                            onCancel={() => setView('home')} 
                        />
                        <div className="mt-6">
                            <CheckoutSourcingPreview cartItems={cartDetails} wholesalers={wholesalers} formatPrice={formatPrice} />
                        </div>
                    </div>

                    {/* Right Column: Order Summary (High Fidelity) */}
                    <div className="w-full lg:w-[45%]">
                        <div className="sticky top-24 bg-base-200/40 backdrop-blur-3xl rounded-[2.5rem] p-10 border border-base-content/5 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black uppercase tracking-tight">{t('cart.summary')}</h2>
                                <button 
                                    onClick={() => { preloadCartDrawer(); setIsCartDrawerOpen(true); }} 
                                    className="btn btn-ghost btn-sm rounded-full text-primary font-bold lowercase"
                                >
                                    {t('common.edit')}
                                </button>
                            </div>
                            
                            <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
                                {cartDetails.map(item => (
                                    <div key={item.productId} className="flex gap-6 items-center group">
                                        <div className="w-20 h-20 rounded-2xl bg-base-100 flex-shrink-0 p-3 border border-base-content/5 relative shadow-sm group-hover:shadow-md transition-shadow">
                                            <img src={item.product?.imageUrl} alt="" className="w-full h-full object-contain" />
                                            <span className="absolute -top-3 -right-3 bg-primary text-white text-[10px] font-black w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 border-base-200">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-base truncate group-hover:text-primary transition-colors">{item.product?.name}</p>
                                            <p className="text-xs font-bold text-base-content/30 uppercase tracking-widest">{item.product?.brand}</p>
                                        </div>
                                        <div className="font-mono font-black text-right">
                                            {formatPrice(item.price * item.quantity)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-8 border-t border-base-content/10">
                                <div className="flex justify-between text-base-content/50 font-bold uppercase tracking-widest text-[10px]">
                                    <span>{t('cart.subtotal')}</span>
                                    <span className="font-mono text-sm text-base-content">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-base-content/50 font-bold uppercase tracking-widest text-[10px]">
                                    <span>{t('cart.tax')} ({formatTaxRate()})</span>
                                    <span className="font-mono text-sm text-base-content">{formatPrice(amounts.tax)}</span>
                                </div>
                                <div className="flex justify-between text-success font-bold uppercase tracking-widest text-[10px]">
                                    <span>{t('cart.shipping')}</span>
                                    <span className="font-mono text-sm uppercase">{amounts.shipping > 0 ? formatPrice(amounts.shipping) : t('cart.free')}</span>
                                </div>
                                
                                <div className="divider opacity-30 my-4"></div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-base-content/30 uppercase tracking-[0.25em] text-xs">Total Amount</span>
                                    <span className="text-4xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-mono tracking-tighter">
                                        {formatPrice(total)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
