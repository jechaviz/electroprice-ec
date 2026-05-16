
import React, { useId } from 'react';

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, reviewCount }) => {
  const totalStars = 5;
  const ratingName = useId();

  return (
    <div className="flex items-center gap-1">
      <div className="rating rating-sm rating-half">
        {[...Array(totalStars * 2)].map((_, i) => (
           <input 
             key={i} 
             type="radio" 
             name={`rating-${ratingName}`} 
             className={`bg-yellow-400 cursor-default mask mask-star-2 ${i % 2 === 0 ? 'mask-half-1' : 'mask-half-2'}`}
             disabled
             checked={Math.round(rating * 2) === i + 1}
           />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="ml-2 text-sm text-base-content/70">({reviewCount})</span>
      )}
    </div>
  );
};

export default StarRating;
