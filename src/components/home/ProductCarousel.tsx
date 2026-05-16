
import React from 'react';
import type { Product } from '../../types';
import ProductCard from '../product/ProductCard';

interface ProductCarouselProps {
  title: string;
  seeMoreText: string;
  onSeeMore: () => void;
  products: Product[];
}

const ProductCarousel: React.FC<ProductCarouselProps> = ({ title, seeMoreText, onSeeMore, products }) => {
  return (
    <section className="animate-fade-in-up">
      <div className="mb-8 flex items-baseline justify-between gap-4">
        <h2 className="heading text-2xl lg:text-3xl font-bold border-l-4 border-primary pl-4">
          {title}
        </h2>
        <button 
          type="button"
          onClick={onSeeMore} 
          className="group flex items-center gap-2 text-primary font-semibold text-sm hover:text-secondary transition-colors duration-300"
        >
          {seeMoreText}
          <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1.5 transition-transform duration-300" aria-hidden="true"></i>
        </button>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
        {products.map(product => (
          <div key={product.id} className="w-72 flex-shrink-0">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductCarousel;
