import React from 'react';
import Spinner from '../../common/Spinner';
import { useTranslation } from '../../../hooks/useTranslation';

export const PriceHistoryChartFallback: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" aria-label={t('priceHistory.title')} className="bg-base-200 rounded-lg shadow-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="space-y-2">
          <div className="skeleton h-5 w-40 bg-base-300"></div>
          <div className="skeleton h-3 w-24 bg-base-300"></div>
        </div>
        <Spinner />
      </div>
      <div className="flex-1 flex items-end gap-2 overflow-hidden">
        {[40, 72, 50, 86, 62, 94, 68].map((height, index) => (
          <div key={index} className="skeleton flex-1 rounded-t-lg bg-base-300/80" style={{ height: `${height}%` }} />
        ))}
      </div>
    </div>
  );
};
