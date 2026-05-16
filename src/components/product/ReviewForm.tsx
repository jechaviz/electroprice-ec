
import React, { useState, useContext } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { AppContext } from '../../contexts/AppContext';
import { sanitizeInputAsync } from '../../utils/deferredSanitize';

interface ReviewFormProps {
    productId: string;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId }) => {
    const { addReview } = useContext(AppContext);
    const { t } = useTranslation();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const sanitizedComment = await sanitizeInputAsync(comment);

        if (rating === 0) {
            setError('Please select a rating.');
            return;
        }
        if (sanitizedComment.length < 10) {
            setError('Please write a comment of at least 10 characters.');
            return;
        }
        
        await addReview({ productId, rating, comment: sanitizedComment });

        // Reset form
        setRating(0);
        setComment('');
        setError('');
    };
    
    return (
        <section id="write-review" className="card bg-base-200 shadow-xl">
            <div className="card-body">
                <h3 className="card-title text-2xl">{t('detail.userReviews.writeTitle')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="label"><span className="label-text">{t('detail.userReviews.ratingLabel')}</span></label>
                         <div className="rating rating-lg">
                            {[...Array(5)].map((_, i) => (
                                <input 
                                    key={i} 
                                    type="radio" 
                                    name="rating-2" 
                                    className="mask mask-star-2 bg-yellow-400" 
                                    checked={rating === i + 1}
                                    onChange={() => setRating(i+1)}
                                />
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="label"><span className="label-text">{t('detail.userReviews.commentLabel')}</span></label>
                        <textarea 
                            className="textarea textarea-bordered w-full" 
                            rows={4}
                            placeholder={t('detail.userReviews.commentPlaceholder')}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        ></textarea>
                    </div>
                    {error && <div className="text-error text-sm">{error}</div>}
                    <div className="card-actions justify-end">
                        <button type="submit" className="btn btn-primary">{t('detail.userReviews.submitButton')}</button>
                    </div>
                </form>
            </div>
        </section>
    )
}

export default ReviewForm;
