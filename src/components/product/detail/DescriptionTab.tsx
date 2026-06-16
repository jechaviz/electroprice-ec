import React from 'react';
import type { Product, User } from '../../../types';

interface DescriptionTabProps {
   product: Product;
   user: User | null;
   formatPrice: (price: number) => string;
   internalBestPrice: number | null;
   t: (key: string) => string;
}

const ASSURANCES: ReadonlyArray<readonly [string, string]> = [
   ['fa-truck-fast', 'detail.assurance.shipping'],
   ['fa-shield-halved', 'detail.assurance.secure'],
   ['fa-rotate-left', 'detail.assurance.returns'],
   ['fa-award', 'detail.assurance.warranty'],
];

export const DescriptionTab: React.FC<DescriptionTabProps> = ({
   product,
   user,
   formatPrice,
   internalBestPrice,
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
                  <i className="fa-solid fa-circle-check text-primary"></i> {t('detail.assurance.title')}
               </h4>
               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ASSURANCES.map(([icon, key]) => (
                     <li key={key} className="flex items-center gap-3 rounded-xl border border-base-content/5 bg-base-200/60 p-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                           <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
                        </span>
                        <span className="text-xs font-semibold text-base-content/75">{t(key)}</span>
                     </li>
                  ))}
               </ul>
               {user?.role === 'admin' && (
                  <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-2">{t('admin.internalComparison')}</h4>
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
