import React from 'react';
import StarRating from '../common/StarRating';
import ImageWithFallback from '../common/ImageWithFallback';

interface TooltipCardProps {
  product: {
    name: string;
    imageUrl: string;
    formattedPrice: string;
    avgRating: number;
    reviewCount: number;
    featureScore: number;
  };
  featureScoreLabel: string;
}

export const TooltipCard: React.FC<TooltipCardProps> = ({ product, featureScoreLabel }) => (
  <div className="card card-compact w-64 bg-base-200 shadow-xl border border-primary">
    <figure>
      <ImageWithFallback src={product.imageUrl} alt={product.name} className="h-32 w-full object-cover" />
    </figure>
    <div className="card-body">
      <h2 className="card-title text-sm">{product.name}</h2>
      <p className="font-bold text-lg">{product.formattedPrice}</p>
      <div className="flex items-center">
        <StarRating rating={product.avgRating} />
        <span className="text-xs ml-1">({product.reviewCount})</span>
      </div>
      <p className="text-xs mt-1">{featureScoreLabel}: {product.featureScore}</p>
    </div>
  </div>
);
