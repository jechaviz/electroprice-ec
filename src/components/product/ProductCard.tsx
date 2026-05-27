import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import StarRating from '../common/StarRating';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getProductUrl } from '../../utils/slugify';
import { preloadLoginModal, preloadQuickViewModal } from '../../utils/deferredOverlays';
import { calculateRetailPrice, getProductDisplayPrice } from '../../utils/pricing';
import { activeFlashSalesSignal } from '../../services/PromotionService';
import { isCatalogDeal } from '../../utils/productIndex';
import {
  highlightedProductIdSignal,
  isLoginModalOpenSignal,
  quickViewProductIdSignal,
  toastSignal,
} from '../../signals/ui.signals';
import { currentUserSignal, isAuthenticatedSignal } from '../../signals/auth.signals';
import { UserService } from '../../services/UserService';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  useSignals();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const user = currentUserSignal.value;
  const isAuthenticated = isAuthenticatedSignal.value;

  const productUrl = useMemo(() => getProductUrl(product.name, product.id), [product.id, product.name]);
  const rawBestPrice = typeof product.bestPrice === 'number' && product.bestPrice > 0
    ? calculateRetailPrice(product.bestPrice)
    : getProductDisplayPrice(product);
  
  const activeSale = activeFlashSalesSignal.value.find((sale) => sale.productId === product.id);
  const bestPrice = rawBestPrice && activeSale
    ? rawBestPrice * (1 - activeSale.discountPercent / 100)
    : rawBestPrice;
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!activeSale) return;
    const getTimeRemaining = () => {
        const diff = activeSale.endTime - Date.now();
        if (diff <= 0) return '00:00:00';
        const h = Math.floor(diff / 3_600_000);
        const m = Math.floor((diff % 3_600_000) / 60_000);
        const s = Math.floor((diff % 60_000) / 1_000);
        const pad = (value: number) => value.toString().padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    };
    setTimeLeft(getTimeRemaining());
    const timer = setInterval(() => {
        setTimeLeft(getTimeRemaining());
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSale]);

  const totalStock = useMemo(() => (
    typeof product.totalStock === 'number'
      ? product.totalStock
      : product.wholesalerStock.reduce((sum, stock) => sum + stock.stock, 0)
  ), [product.totalStock, product.wholesalerStock]);

  const isFavorite = useMemo(() => {
    return user?.favorites.includes(product.id) ?? false;
  }, [user, product.id]);

  const dynamicBadges = useMemo(() => {
    const badges = [];

    if (product.priceHistory && product.priceHistory.length >= 2 && bestPrice) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHistory = product.priceHistory.filter((history) => new Date(history.date) >= thirtyDaysAgo);
      if (recentHistory.length >= 2) {
        const maxRecentPrice = Math.max(...recentHistory.map((history) => history.price));
        if (bestPrice < maxRecentPrice * 0.9) {
          const percentageDrop = Math.round(((maxRecentPrice - bestPrice) / maxRecentPrice) * 100);
          badges.push({ type: 'deal', text: t('productCard.priceDrop', { percent: percentageDrop }) });
        }
      }
    } else if (isCatalogDeal(product)) {
      badges.push({ type: 'deal', text: product.dealTag || t('productCard.blackFriday') });
    }

    if (product.avgRating > 4.7) {
      badges.push({ type: 'rating', text: t('productCard.highlyRated') });
    }

    if (bestPrice && product.featureScore > 0) {
      const valueScore = product.featureScore / bestPrice;
      if (valueScore > 0.09) {
        badges.push({ type: 'value', text: t('productCard.bestValue') });
      }
    }

    return badges;
  }, [product, bestPrice, t]);

  const handleHighlight = useCallback(() => {
    if (highlightedProductIdSignal.value !== product.id) {
      highlightedProductIdSignal.value = product.id;
    }
  }, [product.id]);

  const handleUnhighlight = useCallback(() => {
    if (highlightedProductIdSignal.value === product.id) {
      highlightedProductIdSignal.value = null;
    }
  }, [product.id]);

  const handleFavoriteClick = useCallback(() => {
    if (!isAuthenticated) {
      preloadLoginModal();
      isLoginModalOpenSignal.value = true;
      return;
    }

    void UserService.toggleFavorite(product.id);
  }, [isAuthenticated, product.id]);

  const handleQuickViewClick = useCallback(() => {
    preloadQuickViewModal();
    quickViewProductIdSignal.value = product.id;
  }, [product.id]);

  const handleCompareClick = useCallback(() => {
    toastSignal.value = { message: t('productCard.compareSoon'), type: 'success' };
  }, [t]);

  return (
    <article
      onMouseEnter={handleHighlight}
      onMouseLeave={handleUnhighlight}
      onFocus={handleHighlight}
      className="group/card relative flex h-full flex-col overflow-hidden rounded-2xl border border-base-content/10 bg-base-200/90 shadow-sm transition-all duration-300 hover:border-primary/25 hover:shadow-2xl focus-within:border-primary/40 focus-within:shadow-2xl"
    >
      <div className="relative overflow-hidden bg-base-100/25">
        <Link
          to={productUrl}
          className="block aspect-[4/3] p-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-2px]"
          aria-label={t('productCard.viewDetailsFor', { product: product.name })}
        >
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="relative z-10 h-full w-full object-contain drop-shadow-xl transition-transform duration-500 group-hover/card:scale-[1.03]"
          />
        </Link>

        {totalStock === 0 && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-base-100/75 backdrop-blur-sm">
            <span className="badge badge-error px-4 py-3 text-lg font-bold uppercase tracking-widest">{t('product.outOfStock')}</span>
          </div>
        )}

        <div className="pointer-events-none absolute left-4 top-4 z-20 flex flex-col items-start gap-1.5">
          {dynamicBadges.map((badge) => (
            <div
              key={badge.text}
              className={`badge border-0 px-3 py-2.5 text-[10px] font-extrabold uppercase tracking-wider shadow-lg ${
                badge.type === 'deal'
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white'
                  : badge.type === 'rating'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-base-100'
                    : 'bg-gradient-to-r from-primary to-secondary text-white'
              }`}
            >
              {badge.type === 'deal' && <i className="fa-solid fa-arrow-trend-down mr-1" aria-hidden="true"></i>}
              {badge.type === 'rating' && <i className="fa-solid fa-star mr-1" aria-hidden="true"></i>}
              {badge.type === 'value' && <i className="fa-solid fa-gem mr-1" aria-hidden="true"></i>}
              {badge.text}
            </div>
          ))}
          {product.smartTag && (
            <span className="rounded-md bg-secondary px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white shadow-sm">
              {t(`smartTags.${product.smartTag.replace(/\s+/g, '')}`)}
            </span>
          )}
          {activeSale && (
            <div className="bg-error text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-1.5 shadow-lg animate-pulse">
                <i className="fa-solid fa-bolt-lightning"></i>
                FLASH SALE: {timeLeft}
            </div>
          )}
        </div>

        <div className="absolute right-4 top-4 z-30 flex flex-col gap-2 opacity-100 transition-all duration-300 sm:translate-x-12 sm:opacity-0 sm:group-hover/card:translate-x-0 sm:group-hover/card:opacity-100 sm:group-focus-within/card:translate-x-0 sm:group-focus-within/card:opacity-100">
          {user?.role === 'admin' && (
            <button
              type="button"
              onClick={handleCompareClick}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-base-content/5 bg-base-100/85 text-base-content/70 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-base-100 hover:text-primary"
              aria-label={t('productCard.compare', { product: product.name })}
              title={t('productCard.compareAction')}
            >
              <i className="fa-solid fa-right-left text-sm" aria-hidden="true"></i>
            </button>
          )}
          <button
            type="button"
            onClick={handleQuickViewClick}
            onMouseEnter={preloadQuickViewModal}
            onFocus={preloadQuickViewModal}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-base-content/5 bg-base-100/85 text-base-content/70 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-base-100 hover:text-primary"
            aria-label={t('productCard.quickViewFor', { product: product.name })}
            title={t('productCard.quickView')}
          >
            <i className="fa-regular fa-eye text-sm" aria-hidden="true"></i>
          </button>
          <button
            type="button"
            onClick={handleFavoriteClick}
            className="group/fav flex h-10 w-10 items-center justify-center rounded-full border border-base-content/5 bg-base-100/85 text-base-content/70 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:bg-base-100 hover:text-red-500"
            aria-label={t(isFavorite ? 'productCard.removeFavoriteFor' : 'productCard.addFavoriteFor', { product: product.name })}
            aria-pressed={isFavorite}
            title={t(isFavorite ? 'productCard.removeFavorite' : 'productCard.addFavorite')}
          >
            <i className={`${isFavorite ? 'fa-solid text-red-500' : 'fa-regular group-hover/fav:text-red-500'} fa-heart text-sm transition-colors`} aria-hidden="true"></i>
          </button>
        </div>

        <button
          type="button"
          onClick={handleQuickViewClick}
          onMouseEnter={preloadQuickViewModal}
          onFocus={preloadQuickViewModal}
          className="absolute bottom-0 left-0 z-30 flex w-full items-center justify-center gap-2 bg-base-300/95 py-2.5 text-center text-xs font-bold uppercase tracking-widest text-base-content shadow-[0_-5px_15px_rgba(0,0,0,0.1)] transition-colors hover:bg-base-content hover:text-base-100 focus-visible:bg-base-content focus-visible:text-base-100"
        >
          <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
          {t('productCard.selectOptions')}
        </button>
      </div>

      <div className="relative z-10 flex flex-grow flex-col bg-base-200 p-6 pt-4">
        <p className="heading mb-1 text-[10px] font-bold uppercase tracking-widest text-primary/80">
          {product.brand || 'ElectroPrice'}
        </p>
        <h3 className="heading text-lg font-bold leading-tight text-base-content transition-colors duration-300 group-hover/card:text-primary">
          <Link to={productUrl} className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
            {product.name}
          </Link>
        </h3>

        <div className="mb-4 mt-2 flex items-center gap-2">
          <StarRating rating={product.avgRating} />
          <span className="text-[10px] font-bold tracking-wider text-base-content/45">
            {t('productCard.reviews', { count: product.reviewCount })}
          </span>
        </div>

        <div className="mt-auto border-t border-base-content/5 pt-4">
          {bestPrice !== null && totalStock > 0 ? (
            <>
              <span className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-base-content/45">{t('productCard.price')}</span>
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-mono text-2xl font-black tracking-tight text-primary">{formatPrice(bestPrice)}</p>
                {(product.oldPrice || activeSale) && (
                  <p className="text-xs font-semibold text-base-content/30 line-through">
                    {formatPrice(activeSale ? rawBestPrice! : product.oldPrice!)}
                  </p>
                )}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm font-semibold text-base-content/45">{t('productCard.notAvailable')}</p>
          )}
        </div>
      </div>
    </article>
  );
};

export default React.memo(ProductCard);
