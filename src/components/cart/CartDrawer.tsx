
import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';

export const CartDrawer: React.FC = () => {
    const { isCartDrawerOpen, setIsCartDrawerOpen, user, products, updateCartQuantity, removeFromCart, setView } = useContext(AppContext);
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();

    if (!user || user.role !== 'user') return null;

    const cartItems = user.cart;
    
    // Derived cart properties
    const enrichedCart = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return { ...item, product };
    }).filter(item => item.product);

    const itemCount = enrichedCart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = enrichedCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const handleClose = () => setIsCartDrawerOpen(false);

    const handleProceed = () => {
        setIsCartDrawerOpen(false);
        setView('checkout');
    };

    return (
        <div className={`fixed inset-0 z-[100] transition-transform duration-300 ${isCartDrawerOpen ? 'translate-x-0' : 'translate-x-[100%]'}`}>
            
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-base-100/60 backdrop-blur-sm transition-opacity duration-300 ${isCartDrawerOpen ? 'opacity-100' : 'opacity-0'}`} 
                onClick={handleClose}
                aria-hidden="true"
            />
            
            {/* Drawer Content */}
            <div className={`absolute top-0 right-0 h-[100dvh] w-full sm:w-[450px] bg-base-200/90 backdrop-blur-3xl shadow-2xl shadow-primary/20 border-l border-base-content/10 flex flex-col transform transition-transform duration-500 ease-out ${isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="border-b border-base-content/10 flex flex-col items-center justify-center p-6 gap-3 pb-8 relative shrink-0">
                    <button onClick={handleClose} className="absolute left-6 top-6 btn btn-sm btn-circle btn-ghost text-base-content/50 hover:text-base-content">
                        <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                    <h2 className="text-2xl font-bold heading flex items-center justify-center gap-2 text-base-content mt-2">
                        <i className="fa-solid fa-bag-shopping text-primary"></i>
                        {t('cart.title')}
                    </h2>
                    <div className="bg-primary/10 text-primary font-semibold px-4 py-1.5 rounded-full text-sm shadow-inner shadow-primary/5 border border-primary/20">
                        {itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
                    {enrichedCart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70 animate-fade-in-up">
                            <i className="fa-solid fa-cart-arrow-down text-6xl text-base-content/20 mb-6 group-hover:-rotate-12 transition-transform"></i>
                            <p className="heading text-xl font-bold text-base-content">{t('cart.emptyTitle') || 'Tu carrito está vacío'}</p>
                            <p className="body text-sm mt-2 text-base-content/60">¡Descubre nuestros productos tecnológicos y añade tus favoritos!</p>
                            <button onClick={handleClose} className="btn mt-8 rounded-full border-base-content/20 bg-transparent hover:bg-base-content/5 hover:border-base-content/40 text-base-content shadow-sm transition-all px-8">
                                Seguir comprando
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {enrichedCart.map((item, index) => (
                                <div key={item.productId} className="flex gap-4 p-4 rounded-3xl bg-base-300/40 hover:bg-base-300 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.1)] border border-base-content/5 shrink-0 items-center transform transition-all duration-300 animate-slide-in-right" style={{ animationDelay: `${index * 0.05}s` }}>
                                    <div className="w-20 h-20 rounded-2xl bg-base-100 flex-shrink-0 flex items-center justify-center p-2 relative overflow-hidden shadow-inner border border-base-content/5">
                                        <img
                                            src={item.product!.imageUrl}
                                            alt={item.product!.name}
                                            className="w-full h-full object-contain filter drop-shadow-md"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col gap-2 min-w-0 pr-2">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-sm heading leading-tight truncate text-base-content">{item.product!.name}</h4>
                                                <p className="text-[10px] text-primary uppercase mt-1 tracking-wider font-extrabold">{item.product!.brand}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromCart(item.productId)}
                                                className="btn btn-xs btn-circle btn-ghost text-base-content/40 hover:text-error hover:bg-error/10 transition-colors shrink-0"
                                                title="Eliminar"
                                            >
                                                <i className="fa-solid fa-trash-can text-xs"></i>
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-3 bg-base-100/50 rounded-full px-2.5 py-1 border border-base-content/10 shadow-inner">
                                                <button
                                                    onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center bg-base-200 shadow-sm hover:text-primary transition-colors text-base-content"
                                                >
                                                    <i className="fa-solid fa-minus text-[10px]"></i>
                                                </button>
                                                <span className="font-bold text-sm min-w-[2ch] inline-block text-center tabular-nums">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                                    className="w-6 h-6 rounded-full flex items-center justify-center bg-base-200 shadow-sm hover:text-primary transition-colors text-base-content"
                                                >
                                                    <i className="fa-solid fa-plus text-[10px]"></i>
                                                </button>
                                            </div>
                                            <span className="font-bold heading text-base-content text-base font-mono">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Checkout Button */}
                {enrichedCart.length > 0 && (
                    <div className="border-t border-base-content/10 p-6 bg-base-300/60 backdrop-blur-xl shrink-0 shadow-[0_-15px_40px_-15px_rgba(0,0,0,0.3)] safe-area-pb">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-base-content/70 font-bold text-sm uppercase tracking-wide">Subtotal</span>
                            <span className="text-2xl font-black heading text-base-content drop-shadow-sm font-mono">{formatPrice(subtotal)}</span>
                        </div>
                        <p className="text-[10px] text-base-content/50 mb-6 font-medium">El costo de envío se calculará en la pantalla final.</p>

                        <button
                            onClick={handleProceed}
                            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all flex justify-between items-center px-6 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 transform -translate-x-[150%] skew-x-[-25deg] group-hover:translate-x-[150%] transition-transform duration-700"></div>
                            <span className="font-bold text-[15px] heading tracking-widest uppercase relative z-10">{t('cart.checkout') || 'Pagar Ahora'}</span>
                            <div className="flex items-center gap-3 bg-black/20 rounded-xl px-4 py-2 border border-white/10 backdrop-blur shadow-inner relative z-10">
                                <span className="font-mono text-sm font-bold tracking-tight">{formatPrice(subtotal)}</span>
                                <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                            </div>
                        </button>

                        <button
                            onClick={handleClose}
                            className="w-full mt-4 text-xs font-semibold text-base-content/50 hover:text-primary transition-colors text-center py-2"
                        >
                            Continuar Comprando
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
