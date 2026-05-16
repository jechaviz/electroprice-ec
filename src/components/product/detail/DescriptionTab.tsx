import React from 'react';
import type { Product, User } from '../../../types';
import { calculateRetailPrice } from '../../../utils/pricing';

const PriceHistoryChart = React.lazy(() => import('../PriceHistoryChart'));

interface DescriptionTabProps {
   product: Product;
   user: User | null;
   calculateRetailPrice: (price: number) => number;
   formatPrice: (price: number) => string;
   internalBestPrice: number | null;
   PriceHistoryChartFallback: React.FC;
   t: (key: string) => string;
}

export const DescriptionTab: React.FC<DescriptionTabProps> = ({
   product,
   user,
   formatPrice,
   internalBestPrice,
   PriceHistoryChartFallback,
   t
}) => {
   return (
      <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
         <div>
            <h3 className="text-2xl font-black mb-4">{t('detail.productDescription')}</h3>
            <p className="text-base lg:text-lg leading-relaxed text-base-content/70 font-medium whitespace-pre-wrap">
               {product.description}
            </p>
         </div>
         <div>
            <div className="bg-base-100/80 rounded-2xl p-6 border border-base-content/5 shadow-inner">
               <h4 className="font-bold text-sm text-base-content/50 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fa-solid fa-chart-line text-primary"></i> {t('detail.priceTrend')}
               </h4>
               <div className="h-[260px] min-w-0 overflow-hidden">
                  <React.Suspense fallback={<PriceHistoryChartFallback />}>
                     <PriceHistoryChart 
                        data={product.priceHistory.map(h => ({ ...h, price: calculateRetailPrice(h.price) }))} 
                        compact 
                     />
                  </React.Suspense>
               </div>
               {user?.role === 'admin' && (
                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Internal Comparison (Admin Only)</h4>
                     <div className="space-y-2">
                        {product.wholesalerStock.map(ws => (
                           <div key={ws.wholesalerId} className="flex justify-between text-xs font-mono text-base-content/70">
                              <span>{ws.wholesalerId}:</span>
                              <span className="font-bold">{formatPrice(ws.price)}</span>
                           </div>
                        ))}
                        <div className="border-t border-primary/20 pt-2 flex justify-between text-xs font-bold text-primary">
                           <span>Best Internal:</span>
                           <span>{internalBestPrice ? formatPrice(internalBestPrice) : 'N/A'}</span>
                        </div>
                     </div>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
};
