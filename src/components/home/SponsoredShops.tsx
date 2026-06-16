
import React, { useContext, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { AppContext } from '../../contexts/AppContext';

// Unified brand presence: instead of naming external stores/providers, the
// storefront features the product brands it carries, each rendered with the
// same monogram + wordmark treatment so presence stays consistent without
// depending on third-party logo assets.
const BRAND_ACCENTS = [
    'from-primary/25 to-secondary/25',
    'from-secondary/25 to-accent/25',
    'from-accent/25 to-primary/25',
    'from-info/25 to-primary/25',
];

const brandMonogram = (brand: string) => brand.trim().slice(0, 2).toUpperCase();

const SponsoredShops: React.FC = () => {
    const { t } = useTranslation();
    const { products, setView, setSearchTerm, setCategory } = useContext(AppContext);

    const topBrands = useMemo(() => {
        const counts = new Map<string, number>();
        for (const product of products) {
            const brand = (product.brand || '').trim();
            if (!brand) continue;
            counts.set(brand, (counts.get(brand) || 0) + 1);
        }
        return [...counts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([brand]) => brand);
    }, [products]);

    const goToBrand = (brand: string) => {
        setCategory(null);
        setSearchTerm(brand);
        setView('list');
    };

    const handleSeeAll = () => {
        setSearchTerm('');
        setCategory(null);
        setView('list');
    };

    if (topBrands.length === 0) {
        return null;
    }

    return (
        <section aria-labelledby="featured-brands-title">
            <div className="flex justify-between items-baseline mb-6">
                <h2 id="featured-brands-title" className="text-3xl font-bold">{t('home.sponsored.title')}</h2>
                <button type="button" onClick={handleSeeAll} className="btn btn-link text-primary no-underline hover:underline">
                    {t('home.sponsored.seeAll')} <i className="fa-solid fa-arrow-right ml-1" aria-hidden="true"></i>
                </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {topBrands.map((brand, index) => (
                    <button
                        key={brand}
                        type="button"
                        onClick={() => goToBrand(brand)}
                        aria-label={t('productCard.compare', { product: brand })}
                        className="group flex items-center gap-3 rounded-2xl border border-base-content/10 bg-base-200/80 p-4 text-left transition-all hover:border-primary/30 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                    >
                        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${BRAND_ACCENTS[index % BRAND_ACCENTS.length]} text-sm font-black uppercase tracking-tight text-base-content`}>
                            {brandMonogram(brand)}
                        </span>
                        <span className="min-w-0">
                            <span className="block truncate font-bold text-base-content group-hover:text-primary">{brand}</span>
                            <span className="block text-xs text-base-content/60">{t('categoryNav.topBrands')}</span>
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default SponsoredShops;
