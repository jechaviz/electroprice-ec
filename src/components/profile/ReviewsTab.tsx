import React, { useContext } from 'react';
import { AppContext } from '../../contexts/AppContext';
import { useTranslation } from '../../hooks/useTranslation';
import StarRating from '../common/StarRating';
import { EmptyState, SectionShell, formatDate } from './ProfileUI';

export const ReviewsTab: React.FC = () => {
  const { user, products, reviews } = useContext(AppContext);
  const { t } = useTranslation();

  const userReviews = reviews.filter(review => review.authorId === user?.id);
  const getReviewStatusLabel = (status?: string) => (status ? t(`review.statuses.${status}`) : '');

  return (
    <SectionShell title={t('profile.tabs.reviews')}>
      {userReviews.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {userReviews.map(review => {
            const reviewedProduct = products.find(product => product.id === review.productId);
            return (
              <div key={review.id} className="rounded-lg border border-base-content/10 bg-base-100 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black">{reviewedProduct?.name || t('profile.reviews.unknownProduct')}</h3>
                    <div className="mt-2"><StarRating rating={review.rating} /></div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${review.status === 'approved' ? 'bg-success/15 text-success' : review.status === 'rejected' ? 'bg-error/15 text-error' : 'bg-warning/15 text-warning'}`}>
                    {getReviewStatusLabel(review.status)}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-base-content/70">"{review.comment}"</p>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-base-content/35">{formatDate(review.date)}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="fa-star" title={t('profile.reviews.emptyTitle')} text={t('profile.reviews.empty')} />
      )}
    </SectionShell>
  );
};
