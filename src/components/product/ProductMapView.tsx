
import React, { useContext } from 'react';
import type { Product } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';
import StarRating from '../common/StarRating';
import { useCurrency } from '../../contexts/CurrencyContext';
import { AppContext } from '../../contexts/AppContext';

interface ProductMapViewProps {
    products: Product[];
}

const ProductMapView: React.FC<ProductMapViewProps> = ({ products }) => {
    const { t } = useTranslation();
    const { formatPrice } = useCurrency();
    const { highlightedProductId } = useContext(AppContext);

    const getPriceColor = (price: number, min: number, max: number) => {
        if (min === max) return 'bg-blue-500/20';
        const ratio = (price - min) / (max - min);
        if (ratio < 0.33) return 'bg-green-500/20';
        if (ratio < 0.66) return 'bg-yellow-500/20';
        return 'bg-red-500/20';
    };
    
    const getRatingColor = (rating: number) => {
        if (rating >= 4.5) return 'bg-green-500/20';
        if (rating >= 3.5) return 'bg-yellow-500/20';
        return 'bg-red-500/20';
    };

    const allPrices = products
        // FIX: Changed p.prices to p.wholesalerStock
        .map(p => p.wholesalerStock.length > 0 ? Math.min(...p.wholesalerStock.map(px => px.price)) : Infinity)
        .filter(p => p !== Infinity);
    
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

    const specKeys = [...new Set(products.flatMap(p => Object.keys(p.specs)))].slice(0, 4);

    return (
        <div className="overflow-x-auto bg-base-200 p-4 rounded-box">
            <table className="table-fixed w-full border-separate" style={{borderSpacing: '0.5rem'}}>
                <thead>
                    <tr className="text-left">
                        <th className="w-32 font-semibold align-bottom"></th>
                        {products.map(p => (
                            <th key={p.id} className={`w-48 align-bottom transition-all duration-300 ${highlightedProductId === p.id ? 'bg-primary/20 rounded-lg' : ''}`}>
                                <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                                <p className="text-sm font-bold h-10 overflow-hidden p-1">{p.name}</p>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    <tr className="text-center h-12">
                        <td className="font-bold text-left align-middle">{t('tableView.price')}</td>
                        {products.map(p => {
                            // FIX: Changed p.prices to p.wholesalerStock
                            const bestPrice = p.wholesalerStock.length > 0 ? Math.min(...p.wholesalerStock.map(px => px.price)) : null;
                            const highlightClass = highlightedProductId === p.id ? 'bg-primary/20' : '';
                            const priceClass = bestPrice ? getPriceColor(bestPrice, minPrice, maxPrice) : '';
                            return (
                                <td key={p.id} className={`rounded-lg align-middle transition-all duration-300 ${highlightClass} ${priceClass}`}>
                                    {bestPrice ? formatPrice(bestPrice) : 'N/A'}
                                </td>
                            );
                        })}
                    </tr>
                    <tr className="text-center h-12">
                        <td className="font-bold text-left align-middle">{t('tableView.rating')}</td>
                        {products.map(p => {
                            const highlightClass = highlightedProductId === p.id ? 'bg-primary/20' : '';
                            const ratingClass = getRatingColor(p.avgRating);
                            return (
                                <td key={p.id} className={`rounded-lg align-middle transition-all duration-300 ${highlightClass} ${ratingClass}`}>
                                     <div className="flex justify-center"><StarRating rating={p.avgRating} /></div>
                                </td>
                            );
                        })}
                    </tr>
                    {specKeys.map((key: string) => (
                        <tr key={key} className="text-center h-12">
                            <td className="font-bold text-left align-middle">{key}</td>
                            {products.map(p => {
                                const highlightClass = highlightedProductId === p.id ? 'bg-primary/20' : '';
                                return (
                                    <td key={p.id} className={`truncate text-sm align-middle rounded-lg transition-all duration-300 ${highlightClass}`}>{p.specs[key] || '-'}</td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductMapView;
