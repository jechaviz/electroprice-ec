import React from 'react';
import StarRating from '../../common/StarRating';
import ReviewForm from '../ReviewForm';
import type { Review, User } from '../../../types';

interface ReviewsTabProps {
   product: { id: string; avgRating: number };
   approvedReviews: Review[];
   isAuthenticated: boolean;
   user: User | null;
   handleLoginPrompt: () => void;
   t: (key: string) => string;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
   product,
   approvedReviews,
   isAuthenticated,
   user,
   handleLoginPrompt,
   t
}) => {
   return (
      <div id="reviews-section" className="animate-fade-in-up">
         <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
            
            <div className="lg:w-2/3 w-full">
               <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                  <span className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-xl text-lg">{product.avgRating.toFixed(1)}</span>
                  {t('detail.verifiedReviews')}
               </h3>
               <div className="space-y-4">
                  {approvedReviews.map(review => (
                     <div key={review.id} className="bg-base-100 rounded-3xl p-8 border border-base-content/10 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-primary/20"></div>
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-base-300 rounded-full flex items-center justify-center font-black text-primary text-xl">
                                 {review.author[0].toUpperCase()}
                              </div>
                              <div>
                                 <p className="font-extrabold text-lg">{review.author}</p>
                                 <p className="text-xs uppercase font-bold tracking-widest text-base-content/40 mt-1">{new Date(review.date).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="mt-4 sm:mt-0 text-xl text-warning bg-warning/10 px-4 py-2 rounded-xl">
                              <StarRating rating={review.rating} />
                           </div>
                        </div>
                        <p className="text-lg text-base-content/80 font-medium leading-relaxed bg-base-200/50 p-6 rounded-2xl">
                           "{review.comment}"
                        </p>
                     </div>
                  ))}
                  {approvedReviews.length === 0 && (
                     <div className="text-center py-20 bg-base-100 rounded-3xl border border-dashed border-base-content/20">
                        <i className="fa-regular fa-comment-slash text-5xl text-base-content/20 mb-4 block"></i>
                        <p className="text-base-content/50 font-bold text-xl">{t('detail.noReviews')}</p>
                     </div>
                  )}
               </div>
            </div>

            <div className="lg:w-1/3 w-full sticky top-36">
               <h3 className="text-2xl font-black mb-6">{t('detail.writeOpinion')}</h3>
               {isAuthenticated && user?.role === 'user' ? (
                  <div className="bg-base-100 rounded-3xl p-8 border-2 border-primary/20 shadow-xl shadow-primary/5">
                     <ReviewForm productId={product.id} />
                  </div>
               ) : (
                  <div className="bg-base-200 rounded-3xl p-10 border border-base-content/10 text-center shadow-inner">
                     <div className="w-20 h-20 bg-base-300 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl opacity-50">
                        <i className="fa-solid fa-lock"></i>
                     </div>
                     <p className="font-bold text-lg mb-6 leading-relaxed">{t('detail.loginToReview')}</p>
                     <button type="button" onClick={handleLoginPrompt} className="btn btn-primary w-full uppercase font-bold tracking-widest rounded-xl">{t('detail.loginButton')}</button>
                  </div>
               )}
            </div>

         </div>
      </div>
   );
};
