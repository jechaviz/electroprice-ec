import React, { useContext, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import Hero from '../components/home/Hero';
import SponsoredShops from '../components/home/SponsoredShops';
import { AppContext } from '../contexts/AppContext';
import ProductCarousel from '../components/home/ProductCarousel';
import InspirationSection from '../components/home/InspirationSection';
import Spinner from '../components/common/Spinner';
import { useSEO } from '../hooks/useSEO';
import { getIndexedTotalStock } from '../utils/productIndex';

import { useNavigate } from 'react-router-dom';
import { getCategoryUrl } from '../utils/slugify';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { setSearchTerm, setCategory, products, loading } = useContext(AppContext);
  const navigate = useNavigate();

  useSEO({
    title: undefined,
    description: 'Tienda en línea de electrónica: smartphones, laptops, audífonos, cámaras, TVs y gaming de las mejores marcas, con envío a todo México.',
    keywords: ['electrónica', 'smartphones', 'laptops', 'gaming', 'ofertas', 'tecnología', 'México'],
    jsonLd: {
      '@type': 'WebSite',
      name: 'ElectroPrice',
      url: 'https://electroprice.appniverse.com',
    },
  });

  const handleNavigateToList = (term: string, categoryId: string | null = null) => {
    setSearchTerm(term);
    setCategory(categoryId);
    
    if (categoryId) {
        navigate(getCategoryUrl(categoryId));
    } else if (term) {
        navigate(`/catalog?q=${encodeURIComponent(term)}`);
    } else {
        navigate('/catalog');
    }
  };

  const [
    dealsOfTheDay,
    buenFinDeals,
    popularProducts,
    popularPhones,
    popularLaptops,
  ] = useMemo(() => {
      const availableProducts = products.filter(product => getIndexedTotalStock(product) > 0);
      return [
        availableProducts.filter(p => p.dealTag || p.oldPrice).slice(0, 5),
        availableProducts.filter(p => p.dealTag?.includes('Buen Fin')).slice(0, 5),
        availableProducts.slice(0, 10),
        availableProducts.filter(p => p.category === 'smartphones').slice(0,5),
        availableProducts.filter(p => p.category === 'laptops').slice(0,5),
      ] as const;
  }, [products]);

  if (loading && products.length === 0) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <>
      <Hero />

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-16">
          <SponsoredShops />

          {dealsOfTheDay.length > 0 && (
              <ProductCarousel 
                title={t('home.topDeals.title')}
                products={dealsOfTheDay}
                seeMoreText={t('home.topDeals.seeMore')}
                onSeeMore={() => handleNavigateToList('')}
              />
          )}

          {buenFinDeals.length > 0 && (
            <ProductCarousel 
              title={t('home.buenFin.title')}
              products={buenFinDeals}
              seeMoreText={t('home.buenFin.seeMore')}
              onSeeMore={() => handleNavigateToList('Buen Fin')}
            />
          )}
          
          {popularProducts.length > 0 && (
              <ProductCarousel 
                title={t('home.popularNow.title')}
                products={popularProducts}
                seeMoreText={t('home.popularNow.seeMore')}
                onSeeMore={() => handleNavigateToList('Popular')}
              />
          )}
          
          {popularPhones.length > 0 && (
              <ProductCarousel 
                title={t('home.popularPhones.title')}
                products={popularPhones}
                seeMoreText={t('home.popularPhones.seeMore')}
                onSeeMore={() => handleNavigateToList('', 'smartphones')}
              />
          )}

          {popularLaptops.length > 0 && (
              <ProductCarousel 
                title={t('home.popularLaptops.title')}
                products={popularLaptops}
                seeMoreText={t('home.popularLaptops.seeMore')}
                onSeeMore={() => handleNavigateToList('', 'laptops')}
              />
          )}

          <InspirationSection />

        </div>
      </div>
    </>
  );
};

export default HomePage;
