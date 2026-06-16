import React, { useContext, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { AppContext } from '../../contexts/AppContext';

const Hero: React.FC = () => {
  const { t } = useTranslation();
  const { setView, setSearchTerm, setCategory, navigateToCategory, products } = useContext(AppContext);

  const handleCtaClick = () => {
    setSearchTerm('');
    setCategory(null);
    setView('list');
  };

  const handleCategoryClick = (categoryId: string) => {
    setSearchTerm('');
    navigateToCategory(categoryId);
  };

  const productCount = products.length;
  const brandCount = useMemo(
    () => new Set(products.map((product) => (product.brand || '').trim()).filter(Boolean)).size,
    [products],
  );
  const categoryCount = useMemo(
    () => new Set(products.map((product) => product.category).filter(Boolean)).size,
    [products],
  );

  return (
    <section className="relative overflow-hidden border-b border-base-content/5 bg-base-100">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.86fr)]">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-success">
              <i className="fa-solid fa-circle-check" aria-hidden="true"></i>
              {t('hero.liveDeals')}
            </div>
            <h1 className="display mb-5 text-4xl font-extrabold leading-tight lg:text-6xl">
              {t('home.hero.title')}
            </h1>
            <p className="body mb-8 max-w-2xl text-lg text-base-content/70">
              {t('home.hero.subtitle')}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCtaClick}
                className="btn btn-primary h-12 rounded-full px-8 text-base font-bold shadow-lg shadow-primary/20"
              >
                {t('home.hero.cta')}
                <i className="fa-solid fa-arrow-right ml-2" aria-hidden="true"></i>
              </button>
              <button
                type="button"
                onClick={() => handleCategoryClick('laptops')}
                className="btn btn-outline h-12 rounded-full border-base-content/20 px-8 font-bold"
              >
                {t('home.hero.secondaryCta')}
              </button>
            </div>

            <dl className="mt-9 grid max-w-xl grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-base-content/40">{t('home.hero.products')}</dt>
                <dd className="font-mono text-2xl font-black text-primary">{productCount || '16'}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-base-content/40">{t('home.hero.offers')}</dt>
                <dd className="font-mono text-2xl font-black text-secondary">{brandCount || '40'}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-widest text-base-content/40">{t('home.hero.signals')}</dt>
                <dd className="font-mono text-2xl font-black text-success">{categoryCount || '18'}</dd>
              </div>
            </dl>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-3xl border border-base-content/10 bg-base-200 shadow-2xl shadow-black/20">
            <img
              src="https://images.pexels.com/photos/5082567/pexels-photo-5082567.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt={t('home.hero.visualAlt')}
              className="absolute inset-0 h-full w-full object-cover opacity-55"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-base-200 via-base-200/70 to-base-200/20"></div>
            <div className="relative flex h-full min-h-[360px] flex-col justify-end p-6">
              <div className="mb-5 max-w-md">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">{t('home.hero.panelEyebrow')}</p>
                <h2 className="heading text-2xl font-bold text-base-content">{t('home.hero.panelTitle')}</h2>
              </div>
              <div className="grid gap-3">
                {[
                  ['fa-truck-fast', 'home.hero.signal.price'],
                  ['fa-shield-halved', 'home.hero.signal.stock'],
                  ['fa-award', 'home.hero.signal.reviews'],
                ].map(([icon, key]) => (
                  <div key={key} className="flex items-center gap-3 rounded-2xl border border-base-content/10 bg-base-100/80 p-4 backdrop-blur">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
                    </span>
                    <span className="text-sm font-semibold text-base-content/80">{t(key)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
