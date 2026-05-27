import React, { useState } from 'react';
import { services } from '../../services/ServiceContainer';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { PaymentService } from '../../services/PaymentService';

interface CheckoutFormProps {
    total: number;
    onSuccess?: (orderId: string) => void;
    onCancel: () => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ total, onCancel }) => {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const [isProcessing, setIsProcessing] = useState(false);
    const [address, setAddress] = useState('');
    const sandboxCards = PaymentService.getSandboxCards();
    const enabledSandboxCards = sandboxCards.filter((card) => card.provider === 'stripe');
    const [sandboxCardId, setSandboxCardId] = useState(enabledSandboxCards[0]?.id ?? '');

    const checkRateLimit = (action: string, limit: number, timeframe = 60000) => {
        const now = Date.now();
        const key = `rate_limit_${action}`;
        const recentActions = JSON.parse(localStorage.getItem(key) || '[]')
            .filter((timestamp: number) => now - timestamp < timeframe);
        if (recentActions.length >= limit) return false;
        recentActions.push(now);
        localStorage.setItem(key, JSON.stringify(recentActions));
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!address.trim()) {
            services.notification.error(t('checkout.addressRequired'));
            return;
        }

        setIsProcessing(true);
        try {
            // OWASP: Always validate on server side, but client side check for UX
            if (!checkRateLimit('place_order', 3)) {
                services.notification.error(t('checkout.tooManyAttempts'));
                setIsProcessing(false);
                return;
            }

            await services.cart.placeOrder(address, sandboxCardId);
            // After successful placeOrder, the view transitions automatically
            // but we can call onSuccess if needed for local state.
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
            <div className="bg-base-200 p-6 rounded-2xl border border-base-content/5 shadow-inner">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-truck text-primary"></i>
                    {t('checkout.shippingInfo')}
                </h3>
                <div className="form-control w-full">
                    <label className="label">
                        <span className="label-text font-semibold">{t('checkout.addressLabel')}</span>
                    </label>
                    <textarea 
                        className="textarea textarea-bordered h-24 focus:textarea-primary transition-all" 
                        placeholder={t('checkout.addressPlaceholder')}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        disabled={isProcessing}
                    />
                </div>
            </div>

            <div className="bg-base-200 p-6 rounded-2xl border border-base-content/5 shadow-inner">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-credit-card text-secondary"></i>
                    {t('checkout.paymentMethod')}
                </h3>
                <div className="alert alert-info bg-info/10 border-info/20 mb-4">
                    <i className="fa-solid fa-shield-check text-info"></i>
                    <span className="text-xs font-medium">{t('checkout.securePaymentNote')}</span>
                </div>
                
                {/* Simulated Payment UI */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex flex-col items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]">
                        <i className="fa-brands fa-stripe text-3xl text-[#635BFF]"></i>
                        <span className="text-xs font-bold uppercase tracking-wider">Stripe</span>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-base-content/10 bg-base-100 flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
                        <i className="fa-brands fa-paypal text-3xl text-[#003087]"></i>
                        <span className="text-xs font-bold uppercase tracking-wider">PayPal</span>
                    </div>
                </div>
                <label className="form-control w-full">
                    <span className="label-text mb-2 text-xs font-black uppercase tracking-widest text-base-content/45">
                        {t('checkout.sandboxCard')}
                    </span>
                    <select
                        className="select select-bordered w-full bg-base-100 font-mono text-xs"
                        value={sandboxCardId}
                        onChange={(event) => setSandboxCardId(event.target.value)}
                        disabled={isProcessing}
                    >
                        {enabledSandboxCards.map(card => (
                            <option key={card.id} value={card.id}>
                                {card.label} - {card.displayNumber}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="flex flex-col gap-3 pt-4">
                <button 
                    type="submit" 
                    className={`btn btn-primary btn-lg rounded-full font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 ${isProcessing ? 'loading' : ''}`}
                    disabled={isProcessing}
                >
                    {!isProcessing && <i className="fa-solid fa-lock mr-2"></i>}
                    {t('checkout.payNow')} {formatPrice(total)}
                </button>
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="btn btn-ghost btn-sm rounded-full font-bold opacity-50 hover:opacity-100 transition-opacity"
                    disabled={isProcessing}
                >
                    {t('common.cancel')}
                </button>
            </div>
        </form>
    );
};

export default CheckoutForm;
