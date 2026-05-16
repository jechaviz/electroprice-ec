
import React, { useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../contexts/CurrencyContext';
import { Product } from '../types';
import { calculateOrderAmounts, formatTaxRate } from '../utils/pricing';

const CartPage: React.FC = () => {
  const { user, products, updateCartQuantity, removeFromCart, setView } = useContext(AppContext);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const cartDetails = useMemo(() => {
    if (!user) return [];
    return user.cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product: product as Product,
      };
    }).filter(item => item.product); // Filter out items where product might not be found
  }, [user, products]);

  const subtotal = useMemo(() => {
    return cartDetails.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartDetails]);

  const amounts = useMemo(() => calculateOrderAmounts(subtotal), [subtotal]);

  if (!user || cartDetails.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="card bg-base-200">
          <div className="card-body items-center">
            <i className="fa-solid fa-cart-shopping text-5xl text-base-content/30 mb-4"></i>
            <h2 className="card-title text-3xl">{t('cart.empty')}</h2>
            <div className="card-actions justify-center mt-4">
              <button onClick={() => setView('list')} className="btn btn-primary">{t('cart.browse')}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-8">{t('cart.title')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card bg-base-200 p-6 shadow-lg">
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>{t('cart.product')}</th>
                  <th className="text-center">{t('cart.quantity')}</th>
                  <th className="text-right">{t('cart.price')}</th>
                  <th className="text-right">{t('cart.total')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cartDetails.map(item => (
                  <tr key={item.productId} className="hover">
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar"><div className="mask mask-squircle w-12 h-12"><img src={item.product.imageUrl} alt={item.product.name} /></div></div>
                        <div><div className="font-bold">{item.product.name}</div><div className="text-sm opacity-50">{item.product.brand}</div></div>
                      </div>
                    </td>
                    <td className="text-center">
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateCartQuantity(item.productId, parseInt(e.target.value, 10))}
                        className="input input-bordered input-sm w-20 text-center"
                      />
                    </td>
                    <td className="text-right">{formatPrice(item.price)}</td>
                    <td className="text-right font-bold">{formatPrice(item.price * item.quantity)}</td>
                    <td><button onClick={() => removeFromCart(item.productId)} className="btn btn-ghost btn-xs"><i className="fa-solid fa-trash-can"></i></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card bg-base-200 p-6 shadow-lg self-start">
            <h2 className="text-2xl font-bold mb-4">{t('cart.summary')}</h2>
            <div className="space-y-2">
                <div className="flex justify-between"><span>{t('cart.subtotal')}</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between"><span>{t('cart.shipping')}</span><span>{amounts.shipping > 0 ? formatPrice(amounts.shipping) : t('cart.free')}</span></div>
                <div className="flex justify-between"><span>{t('cart.tax')} ({formatTaxRate()})</span><span>{formatPrice(amounts.tax)}</span></div>
                <div className="divider my-2"></div>
                <div className="flex justify-between font-extrabold text-xl"><span>{t('cart.total')}</span><span>{formatPrice(amounts.total)}</span></div>
            </div>
            <div className="card-actions mt-6">
                <button onClick={() => setView('checkout')} className="btn btn-primary btn-block">{t('cart.checkout')}</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
