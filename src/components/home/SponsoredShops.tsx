
import React, { useContext } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { MOCK_SHOPS } from '../../constants';
import { AppContext } from '../../contexts/AppContext';

const SponsoredShops: React.FC = () => {
    const { t } = useTranslation();
    const { setView, setSearchTerm, setCategory } = useContext(AppContext);

    const handleSeeAll = () => {
        setSearchTerm('');
        setCategory(null);
        setView('list');
    }

    return (
        <section aria-labelledby="verified-shops-title">
            <div className="flex justify-between items-baseline mb-6">
                <h2 id="verified-shops-title" className="text-3xl font-bold">{t('home.sponsored.title')}</h2>
                <button type="button" onClick={handleSeeAll} className="btn btn-link text-primary no-underline hover:underline">
                    {t('home.sponsored.seeAll')} <i className="fa-solid fa-arrow-right ml-1" aria-hidden="true"></i>
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {MOCK_SHOPS.slice(0, 4).map(shop => (
                    <article key={shop.id} className="card bg-base-200 image-full shadow-xl group h-52">
                        <figure><img src={shop.promoImageUrl} alt={shop.name} className="group-hover:scale-105 transition-transform duration-300" /></figure>
                        <div className="card-body justify-start p-4">
                             <div className='flex items-center gap-3'>
                                <img src={shop.logoUrl} alt={`${shop.name} logo`} className="h-10 w-10 rounded-full border-2 border-white bg-white" />
                                <h2 className="card-title text-white">{shop.name}</h2>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default SponsoredShops;
