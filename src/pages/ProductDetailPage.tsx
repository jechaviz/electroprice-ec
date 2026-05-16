import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../contexts/AppContext';
import Spinner from '../components/common/Spinner';
import StarRating from '../components/common/StarRating';
import { useTranslation } from '../hooks/useTranslation';
import { useCurrency } from '../contexts/CurrencyContext';
import ProductCarousel from '../components/home/ProductCarousel';
import { Navigate } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { preloadLoginModal } from '../utils/deferredOverlays';
import { calculateRetailPrice } from '../utils/pricing';
import { useProductDetail, SectionType } from '../hooks/useProductDetail';
import { services } from '../services/ServiceContainer';

// Sub-components
import { DetailGallery } from '../components/product/detail/DetailGallery';
import { DescriptionTab } from '../components/product/detail/DescriptionTab';
import { ReviewsTab } from '../components/product/detail/ReviewsTab';
import { SpecsTab } from '../components/product/detail/SpecsTab';
import { AITab } from '../components/product/detail/AITab';
import { PriceHistoryChartFallback } from '../components/product/detail/PriceHistoryChartFallback';

const ProductDetailPage: React.FC = () => {
  const { loading, user, isAuthenticated, addToCart, setIsLoginModalOpen, setView } = useContext(AppContext);
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const {
    product,
    isLiked,
    aiSummary,
    isSummaryLoading,
    currentImageIndex,
    setCurrentImageIndex,
    activeTab,
    setActiveTab,
    selectedOptions,
    setSelectedOptions,
    handleFavoriteToggle,
    navigateCategory,
    bestPrice,
    internalBestPrice,
    totalStock,
    isOutOfStock,
    galleryImages,
    approvedReviews,
    similarProducts,
  } = useProductDetail();

  const [liveVisitors, setLiveVisitors] = useState(0);

  useEffect(() => {
    if (product) {
      services.analytics.trackProductView(product.id, product.name);
      
      // Update live visitors periodically
      setLiveVisitors(services.inventory.getLiveVisitors(product.id));
      const timer = setInterval(() => {
          setLiveVisitors(services.inventory.getLiveVisitors(product.id));
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [product]);

  useSEO({
    title: product ? `${product.name} - ${product.brand}` : 'Product Details',
    description: product?.description || 'View product details, prices, reviews, and AI-generated summaries.',
    keywords: product ? [product.name, product.brand, product.category, 'price comparison', 'reviews'] : ['product'],
    ogImage: product?.imageUrl,
    ogType: 'product',
    jsonLd: product ? {
      '@type': 'Product',
      name: product.name,
      brand: { '@type': 'Brand', name: product.brand },
      description: product.description,
      image: product.imageUrl,
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: bestPrice,
        highPrice: product.wholesalerStock.length ? Math.max(...product.wholesalerStock.map(p => p.price)) : bestPrice,
        priceCurrency: 'USD',
        offerCount: product.wholesalerStock.length,
        availability: product.wholesalerStock.some(ws => ws.stock > 0) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.avgRating,
        reviewCount: product.reviewCount,
      },
    } : undefined,
  });

  const handleLoginPrompt = () => { preloadLoginModal(); setIsLoginModalOpen(true); };

  if (!product) {
    return loading ? <Spinner /> : <Navigate to="/404" replace />;
  }
  
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'description':
        return <DescriptionTab product={product} user={user} formatPrice={formatPrice} internalBestPrice={internalBestPrice} PriceHistoryChartFallback={PriceHistoryChartFallback} t={t} calculateRetailPrice={calculateRetailPrice} />;
      case 'specs':
        return <SpecsTab specs={product.specs} t={t} />;
      case 'ai':
        return <AITab aiSummary={aiSummary} isSummaryLoading={isSummaryLoading} t={t} />;
      case 'reviews':
        return <ReviewsTab product={product} approvedReviews={approvedReviews} isAuthenticated={isAuthenticated} user={user} handleLoginPrompt={handleLoginPrompt} t={t} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-base-300 animate-fade-in pb-20">
      <div className="bg-base-200 border-b border-base-content/5 py-4 sticky top-0 md:static z-40">
        <div className="container mx-auto px-4 lg:px-8 flex items-center text-sm font-semibold text-base-content/50 uppercase tracking-wider">
          <button onClick={() => setView('home')} className="hover:text-primary transition-colors">Inicio</button>
          <i className="fa-solid fa-chevron-right text-[10px] mx-3 opacity-50"></i>
          <button onClick={navigateCategory} className="hover:text-primary transition-colors">{product.category}</button>
          <i className="fa-solid fa-chevron-right text-[10px] mx-3 opacity-50"></i>
          <span className="text-base-content/80 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <DetailGallery galleryImages={galleryImages} currentImageIndex={currentImageIndex} setCurrentImageIndex={setCurrentImageIndex} productName={product.name} />
          <div className="lg:col-span-5 flex flex-col pt-2 lg:pt-4">
            <span className="text-secondary tracking-[0.2em] font-bold text-[10px] uppercase mb-1">{product.brand}</span>
            <h1 className="text-2xl lg:text-3xl font-black mb-2 leading-tight text-base-content" style={{ fontFamily: 'Outfit, sans-serif' }}>{product.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center text-warning text-sm"><StarRating rating={product.avgRating} /></div>
              <span className="text-accent font-semibold text-xs cursor-pointer hover:underline" onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}>
                {product.reviewCount} {t('detail.verifiedRatings')}
              </span>
            </div>
            <div className="bg-base-200/50 rounded-2xl p-5 lg:p-6 border-2 border-base-content/5 shadow-xl flex flex-col flex-1 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div className="flex flex-col">
                  <div className="mb-3">
                    {isOutOfStock ? (
                      <span className="inline-flex items-center gap-1.5 text-error font-extrabold bg-error/10 px-2 py-1 rounded-md text-[10px] border border-error/20"><i className="fa-solid fa-xmark"></i> {t('detail.outOfStockFull')}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-success font-extrabold bg-success/10 px-2 py-1 rounded-md text-xs border border-success/20"><i className="fa-solid fa-check-circle"></i> {t('detail.inStock')} ({totalStock} {t('detail.available')})</span>
                    )}
                  </div>
                  {liveVisitors > 0 && (
                      <div className="flex items-center gap-2 mb-3 px-3 py-1.5 bg-base-300/50 border border-base-content/5 rounded-xl w-fit">
                          <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-base-content/60">
                              {liveVisitors} {t('detail.viewingNow') || 'People viewing this right now'}
                          </span>
                      </div>
                  )}
                  {bestPrice !== null && (
                    <div className="mb-2">
                      <div className="flex items-baseline gap-2 mb-1"><span className="text-2xl lg:text-4xl font-black text-base-content tracking-tighter">{formatPrice(bestPrice)}</span></div>
                      {product.oldPrice && (
                        <div className="flex flex-col gap-1 text-[10px] font-bold text-base-content/40">
                          <span>{t('detail.regularPrice')}: <span className="line-through">{formatPrice(product.oldPrice)}</span></span>
                          <span className="text-accent inline-block w-fit bg-accent/10 px-1 py-0.5 rounded">{t('detail.youSave')} {formatPrice(product.oldPrice - bestPrice)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2.5 w-full sm:w-[220px] shrink-0">
                  <button onClick={() => addToCart(product.id, 1)} className="w-full py-2.5 rounded-lg bg-accent text-accent-content font-black text-xs uppercase tracking-wider shadow-[0_5px_15px_-5px_rgba(4,217,255,0.5)] hover:shadow-[0_10px_20px_-5px_rgba(4,217,255,0.6)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" disabled={isOutOfStock}><i className="fa-solid fa-cart-shopping"></i> {t('detail.addToCart')}</button>
                  <button onClick={handleFavoriteToggle} className={`w-full py-2.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all border-2 flex items-center justify-center gap-2 ${isLiked ? 'bg-red-500/10 border-red-500 text-red-500 shadow-[0_5px_15px_-5px_rgba(239,68,68,0.3)]' : 'bg-base-300/50 border-base-content/5 text-base-content/60 hover:bg-red-500 hover:border-red-500 hover:text-white'}`}><i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart`}></i> {isLiked ? t('detail.inFavorites') : t('detail.addToFavorites')}</button>
                </div>
              </div>

              {product.options && (
                <div className="mt-8 space-y-6">
                  {product.options.map(opt => (
                    <div key={opt.name} className="animate-fade-in">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-base-content/40">{opt.name}</span>
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">{selectedOptions[opt.name]}</span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {opt.values.map(val => {
                          const isActive = selectedOptions[opt.name] === val;
                          if (opt.name.toLowerCase().includes('color')) {
                            const hex = val.toLowerCase().replace(' ', '');
                            return (
                              <button key={val} onClick={(e) => { e.stopPropagation(); setSelectedOptions(prev => ({ ...prev, [opt.name]: val })); }} className={`relative w-10 h-10 rounded-full transition-all duration-500 hover:scale-110 active:scale-90 p-1 ${isActive ? 'scale-110' : 'opacity-70 hover:opacity-100'}`}>
                                <div className={`absolute -inset-1 rounded-full border-2 transition-all duration-500 ${isActive ? 'border-primary opacity-100 rotate-180' : 'border-transparent opacity-0'}`}></div>
                                <div className="absolute inset-1 rounded-full bg-black/5 z-20 pointer-events-none"></div>
                                <div className="w-full h-full rounded-full border border-white/10 shadow-lg relative z-10 overflow-hidden" style={{ backgroundColor: hex }}><div className="absolute top-1 left-1.5 w-1/2 h-1/2 bg-white/20 rounded-full blur-[2px]"></div></div>
                              </button>
                            );
                          }
                          return (
                            <button key={val} onClick={(e) => { e.stopPropagation(); setSelectedOptions(prev => ({ ...prev, [opt.name]: val })); }} className={`relative px-4 py-2.5 rounded-xl border-2 font-bold text-[11px] transition-all duration-300 flex-1 min-w-[100px] text-center overflow-hidden group ${isActive ? 'border-primary bg-primary/5 text-primary shadow-[0_0_20px_-5px_rgba(4,217,255,0.3)]' : 'border-base-content/5 bg-base-300/20 text-base-content/60 hover:border-base-content/20 hover:bg-base-300/40'}`}>
                              {isActive && <div className="absolute top-0 right-0 w-6 h-6 bg-primary text-primary-content flex items-center justify-center rounded-bl-lg transform translate-x-1 -translate-y-1 scale-75"><i className="fa-solid fa-check text-[10px]"></i></div>}
                              <span className="relative z-10">{val}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-5 border-t border-base-content/5">
                <div className="flex items-center gap-2 mb-2 text-base-content/30"><i className="fa-solid fa-quote-left text-[10px]"></i><span className="text-[9px] font-black uppercase tracking-[0.2em]">{t('detail.generalVision')}</span></div>
                <p className="text-xs leading-relaxed text-base-content/50 font-medium line-clamp-3 italic pl-3 border-l-2 border-primary/20">{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 mt-6 lg:mt-12">
        <div className="flex flex-wrap md:flex-nowrap bg-base-200 border border-base-content/10 rounded-xl p-1 mb-6 sticky top-20 z-30 shadow-2xl backdrop-blur-md">
          {[
            { id: 'description', label: t('detail.overview'), icon: 'fa-align-left' },
            { id: 'specs', label: t('detail.specifications'), icon: 'fa-microchip' },
            { id: 'ai', label: t('detail.aiInsights'), icon: 'fa-wand-magic-sparkles' },
            { id: 'reviews', label: t('detail.reviewsTab'), icon: 'fa-comments' },
          ].map(tab => (
            <button key={tab.id} className={`flex-1 flex justify-center items-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition-all duration-300 ${activeTab === tab.id ? 'bg-base-100 shadow text-primary' : 'text-base-content/50 hover:bg-base-100/50 hover:text-base-content'}`} onClick={() => { setActiveTab(tab.id as SectionType); if (window.innerWidth < 768) document.getElementById('details-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><i className={`fa-solid ${tab.icon} hidden sm:block`}></i> {tab.label}</button>
          ))}
        </div>

        <div id="details-content" className="bg-base-200/50 rounded-2xl p-5 sm:p-8 border border-base-content/5 min-h-[300px]">
          {renderActiveTab()}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="container mx-auto px-4 lg:px-8 mt-24 pt-12 border-t border-base-content/5">
          <ProductCarousel title={t('detail.suggestedProducts')} products={similarProducts} seeMoreText={t('detail.seeSimilarCatalog')} onSeeMore={navigateCategory} />
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
