import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext';
import { productSlugMatchesId } from '../utils/slugify';
import { generateProductSummary } from '../services/geminiService';
import { preloadLoginModal } from '../utils/deferredOverlays';
import { getProductGalleryImages } from '../utils/productGallery';
import { getProductDisplayPrice, getLowestWholesalerPrice } from '../utils/pricing';

export type SectionType = 'description' | 'specs' | 'reviews' | 'ai';

export const useProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { products, user, isAuthenticated, toggleFavorite, setIsLoginModalOpen, setCategory, setView } = useContext(AppContext);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<SectionType>('description');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

  const product = useMemo(() => {
    if (!slug) return null;
    return products.find(p => productSlugMatchesId(slug, p.id)) ?? null;
  }, [slug, products]);

  const isLiked = useMemo(() => {
    return product ? user?.favorites.includes(product.id) ?? false : false;
  }, [product, user]);

  const bestPrice = useMemo(() => product ? getProductDisplayPrice(product) : null, [product]);
  const internalBestPrice = useMemo(() => product ? getLowestWholesalerPrice(product) : null, [product]);
  
  const totalStock = useMemo(() => 
    product?.wholesalerStock.reduce((sum, ws) => sum + ws.stock, 0) ?? 0, 
  [product]);
  
  const inStock = totalStock > 0;
  const isOutOfStock = !inStock;

  const galleryImages = useMemo(() => 
    product ? getProductGalleryImages(product) : [], 
  [product]);

  const approvedReviews = useMemo(() => 
    product ? product.reviews.filter(r => r.status === 'approved' || !r.status) : [], 
  [product]);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 10);
  }, [product, products]);

  useEffect(() => {
    if (slug) {
      window.scrollTo(0, 0);
      const loadProduct = async () => {
        setIsSummaryLoading(true);
        setAiSummary('');
        setCurrentImageIndex(0);
        setSelectedOptions({});
        if (product) {
          if (product.options) {
             const defaults: Record<string, string> = {};
             product.options.forEach(opt => { defaults[opt.name] = opt.values[0] ?? ''; });
             setSelectedOptions(defaults);
          }
          if (product.reviews.filter(r => r.status !== 'rejected').length > 0) {
            const summary = await generateProductSummary(product);
            setAiSummary(summary);
          } else {
            setAiSummary('Insuficientes estudios o reseñas verificadas para generar un análisis de Inteligencia Artificial.');
          }
        }
        setIsSummaryLoading(false);
      };
      void loadProduct();
    }
  }, [slug, product]);

  const handleFavoriteToggle = useCallback(() => {
    if (!product) return;
    if (!isAuthenticated) {
      preloadLoginModal();
      setIsLoginModalOpen(true);
      return;
    }
    void toggleFavorite(product.id);
  }, [product, isAuthenticated, toggleFavorite, setIsLoginModalOpen]);

  const navigateCategory = useCallback(() => {
    if (product) setCategory(product.category);
    setView('list');
  }, [product, setCategory, setView]);

  return {
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
    inStock,
    isOutOfStock,
    galleryImages,
    approvedReviews,
    similarProducts,
  };
};
