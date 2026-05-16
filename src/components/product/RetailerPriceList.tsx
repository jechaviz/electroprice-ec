
import React from 'react';
import type { RetailerPrice } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import { useCurrency } from '../../contexts/CurrencyContext';

interface RetailerPriceListProps {
  prices: RetailerPrice[];
}

const RetailerPriceList: React.FC<RetailerPriceListProps> = ({ prices }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  
  if (!prices || prices.length === 0) {
    return (
        <div className="alert">
            <i className="fa-solid fa-circle-info"></i>
            <span>{t('retailerList.noOffers')}</span>
        </div>
    );
  }

  const sortedPrices = [...prices].sort((a, b) => a.price - b.price);

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold mb-4">{t('retailerList.title')}</h3>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>{t('retailerList.header.retailer')}</th>
              <th>{t('retailerList.header.stock')}</th>
              <th>{t('retailerList.header.price')}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sortedPrices.map((item) => (
              <tr key={item.retailerId} className="hover">
                <td>
                  <img src={item.logoUrl} alt={item.name} className="h-6 object-contain" />
                </td>
                <td>
                  {item.stock > 0 ? (
                    <span className="badge badge-success gap-2">
                        <i className="fa-solid fa-check"></i>
                        {t('retailerList.inStock')}
                    </span>
                  ) : (
                    <span className="badge badge-error gap-2">
                        <i className="fa-solid fa-times"></i>
                        {t('retailerList.outOfStock')}
                    </span>
                  )}
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg">{formatPrice(item.price)}</span>
                    <span className="text-xs text-base-content/70">+ {formatPrice(item.shippingCost)} {t('retailerList.shipping')}</span>
                  </div>
                </td>
                <td className="text-right">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    {t('retailerList.goToStore')}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetailerPriceList;