
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getProductGalleryImages } from '../../utils/productGallery';
import { getProductDisplayPrice } from '../../utils/pricing';
import { ProductCatalogService } from '../../services/ProductCatalogService';
import ImageWithFallback from '../common/ImageWithFallback';
import type { Product } from '../../types';

const QuickViewModal: React.FC = () => {
    const { quickViewProductId, setQuickViewProductId, products, addToCart, navigateToProduct } = useContext(AppContext);
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();

    const [quantity, setQuantity] = useState(1);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [remoteProduct, setRemoteProduct] = useState<Product | null>(null);
    const [isProductLoading, setIsProductLoading] = useState(false);

    const previewProduct = products.find(p => p.id === quickViewProductId) ?? null;
    const product = remoteProduct ?? previewProduct;
    const galleryImages = useMemo(() => product ? getProductGalleryImages(product) : [], [product]);
    const defaultSelectedOptions = useMemo(() => {
        if (!product?.options?.length) return {};
        return Object.fromEntries(
            product.options.map((option) => [option.name, option.values[0] ?? ''])
        );
    }, [product]);

    useEffect(() => {
        if (quickViewProductId) {
            setQuantity(1);
            setCurrentImageIndex(0);
            setRemoteProduct(null);
        }
    }, [quickViewProductId]);

    useEffect(() => {
        if (!quickViewProductId) {
            return;
        }

        let cancelled = false;
        setIsProductLoading(true);
        ProductCatalogService.fetchProductDetail(quickViewProductId)
            .then((detailProduct) => {
                if (!cancelled) setRemoteProduct(detailProduct);
            })
            .catch((error) => {
                console.error('Failed to fetch quick view product:', error);
            })
            .finally(() => {
                if (!cancelled) setIsProductLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [quickViewProductId]);

    useEffect(() => {
        if (!quickViewProductId) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setQuickViewProductId(null);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [quickViewProductId, setQuickViewProductId]);

    if (!quickViewProductId || (!product && !isProductLoading)) {
        return null;
    }

    if (!product) {
        return (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
                <div className="absolute inset-0 bg-base-100/80 backdrop-blur-sm" onClick={() => setQuickViewProductId(null)} />
                <div role="dialog" aria-modal="true" className="relative flex min-h-48 w-full max-w-md items-center justify-center rounded-2xl border border-base-content/10 bg-base-200/95 p-8 shadow-2xl">
                    <span className="loading loading-spinner loading-lg text-primary" aria-label={t('list.loadingMore')}></span>
                </div>
            </div>
        );
    }

    const availableVariants = product.wholesalerStock || [];
    
    // For regular users, we only show the best retail price.
    // Wholesalers are hidden "variants" in the old system.
    const displayPrice = getProductDisplayPrice(product);
    const totalStock = availableVariants.reduce((sum, v) => sum + v.stock, 0);
    const currentImage = galleryImages[currentImageIndex] || product.imageUrl;

    const handleClose = () => {
        setQuickViewProductId(null);
    };

    const handleAddToCart = () => {
        if (totalStock > 0) {
            addToCart(product.id, quantity, defaultSelectedOptions);
            handleClose();
        }
    };

    const handleViewDetails = () => {
         navigateToProduct(product);
         handleClose();
    };

    const showPreviousImage = () => {
        setCurrentImageIndex((index) => (index === 0 ? galleryImages.length - 1 : index - 1));
    };

    const showNextImage = () => {
        setCurrentImageIndex((index) => (index + 1) % galleryImages.length);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-base-100/80 backdrop-blur-sm" 
                onClick={handleClose}
            />

            {/* Modal Box - Inspired by Screenshot 2 */}
            <div
                data-quick-view-modal
                role="dialog"
                aria-modal="true"
                aria-labelledby="quick-view-title"
                className="relative grid w-full max-w-4xl max-h-[calc(100dvh-2rem)] overflow-y-auto bg-base-200/95 backdrop-blur-2xl border border-base-content/10 shadow-2xl shadow-black/50 rounded-2xl p-4 sm:p-5 md:p-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)] gap-5 md:gap-6 transform animate-slide-in-up"
            >
                
                <button type="button" onClick={handleClose} aria-label={t('common.close')} className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-base-100/80 backdrop-blur border border-base-content/10 text-base-content/50 hover:text-base-content transition-colors">
                    <i className="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
                </button>

                <div className="min-w-0">
                    <div
                        data-quick-view-carousel
                        className="relative aspect-[4/3] overflow-hidden rounded-xl border border-base-content/10 bg-base-100/70"
                    >
                        <ImageWithFallback
                            src={currentImage}
                            alt={`${product.name} ${currentImageIndex + 1}`}
                            className="h-full w-full object-contain p-5 drop-shadow-2xl animate-fade-in"
                        />
                        {galleryImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={showPreviousImage}
                                    aria-label="Imagen anterior"
                                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-base-200/85 text-base-content/70 shadow-lg backdrop-blur transition-colors hover:text-primary"
                                >
                                    <i className="fa-solid fa-chevron-left text-xs"></i>
                                </button>
                                <button
                                    type="button"
                                    onClick={showNextImage}
                                    aria-label="Imagen siguiente"
                                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-base-200/85 text-base-content/70 shadow-lg backdrop-blur transition-colors hover:text-primary"
                                >
                                    <i className="fa-solid fa-chevron-right text-xs"></i>
                                </button>
                            </>
                        )}
                    </div>

                    {galleryImages.length > 1 && (
                        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                            {galleryImages.map((image, index) => (
                                <button
                                    key={`${image}-${index}`}
                                    type="button"
                                    onClick={() => setCurrentImageIndex(index)}
                                    aria-label={`Imagen ${index + 1}`}
                                    className={`h-14 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-base-100 transition-all ${currentImageIndex === index ? 'border-primary shadow-lg shadow-primary/20' : 'border-base-content/10 opacity-65 hover:opacity-100'}`}
                                >
                                    <ImageWithFallback src={image} alt="" className="h-full w-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex min-w-0 flex-col gap-5 pr-0 md:pr-2">
                    <div className="pr-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/80 mb-1">{product.brand}</p>
                        <h2 id="quick-view-title" className="text-2xl font-bold heading text-base-content leading-tight mb-2">
                            {product.name}
                        </h2>
                        <p className="font-mono text-2xl font-black text-primary">
                            {displayPrice !== null ? formatPrice(displayPrice) : t('productCard.notAvailable')}
                        </p>
                    </div>

                    <div className="flex flex-col gap-5">
                        {product.options && product.options.length > 0 && (
                            <div className="rounded-xl border border-base-content/10 bg-base-300/35 p-3">
                                <div className="flex flex-wrap gap-2">
                                    {product.options.map((option) => (
                                        <span key={option.name} className="badge badge-ghost max-w-full truncate font-bold">
                                            {option.name}: {defaultSelectedOptions[option.name]}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className={`text-xs font-semibold ${totalStock > 0 ? 'text-success' : 'text-error'} mb-3`}>
                                {totalStock > 0 ? `${totalStock} ${t('product.available') || 'products available'}` : t('product.outOfStock')}
                            </p>
                            
                            <p className="text-sm font-semibold text-base-content/60 mb-2">{t('cart.quantity') || 'Quantity'}</p>
                            <div className="flex items-center gap-4">
                                {/* Quantity Selector */}
                                <div className="flex items-center bg-base-300 rounded-lg p-1.5 border border-base-content/10">
                                    <button 
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-100 rounded-md transition-colors"
                                    >
                                        <i className="fa-solid fa-minus text-xs"></i>
                                    </button>
                                    <span className="w-10 text-center font-bold">{quantity}</span>
                                    <button 
                                        onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                                        disabled={totalStock <= quantity}
                                        className="w-8 h-8 flex items-center justify-center text-base-content/70 hover:text-base-content hover:bg-base-100 rounded-md transition-colors disabled:opacity-35"
                                    >
                                        <i className="fa-solid fa-plus text-xs"></i>
                                    </button>
                                </div>
                                
                                {/* Add to Cart Button */}
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={totalStock <= 0}
                                    className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-bold h-12 rounded-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 focus:ring-2 disabled:opacity-50 disabled:grayscale transition-all"
                                >
                                    {t('product.addToCart') || 'Add To Cart'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-base-content/10">
                        <button 
                            onClick={handleViewDetails}
                            className="text-sm font-semibold text-base-content/60 hover:text-primary transition-colors flex items-center gap-2 group"
                        >
                            {t('product.viewFullDetails') || 'View full details'} 
                            <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickViewModal;
