import React from 'react';
import { Product } from '../../types';
import ProductCard from '../product/ProductCard';
import { useTranslation } from '../../hooks/useTranslation';
import { EmptyState, SectionShell } from './ProfileUI';

export const FavoritesTab: React.FC<{ favoriteProducts: Product[] }> = ({ favoriteProducts }) => {
  const { t } = useTranslation();

  return (
    <SectionShell title={t('profile.tabs.favorites')}>
      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {favoriteProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <EmptyState icon="fa-heart" title={t('profile.favorites.emptyTitle')} text={t('profile.favorites.empty')} />
      )}
    </SectionShell>
  );
};
