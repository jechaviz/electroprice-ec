import React, { useContext, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { AppContext } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { getCategoryUrl } from '../../utils/slugify';

const mainCategories = [
  { id: 'black-friday', icon: 'fa-solid fa-star', labelKey: 'categories.black-friday' },
  { id: 'gaming', icon: 'fa-solid fa-gamepad', labelKey: 'categories.gaming' },
  { id: 'tvs', icon: 'fa-solid fa-tv', labelKey: 'categories.tvs' },
  { id: 'smartphones', icon: 'fa-solid fa-mobile-screen-button', labelKey: 'categories.smartphones' },
  { id: 'laptops', icon: 'fa-solid fa-laptop', labelKey: 'categories.laptops' },
  { id: 'headphones', icon: 'fa-solid fa-headphones', labelKey: 'categories.headphones' },
  { id: 'cameras', icon: 'fa-solid fa-camera-retro', labelKey: 'categories.cameras' },
];

const megaMenuData: Record<string, { subcats: string[]; brands: string[]; promoImage: string; promoTextKey: string }> = {
  gaming: {
    subcats: ['PC Gaming', 'Consolas', 'Accesorios', 'Juegos fisicos', 'Sillas gamer', 'Monitores 144Hz+'],
    brands: ['Razer', 'Logitech G', 'Nintendo', 'PlayStation', 'Xbox', 'Corsair'],
    promoImage: 'https://images.unsplash.com/photo-1600861194942-f883de0dfe96?auto=format&fit=crop&q=80&w=400',
    promoTextKey: 'categoryNav.promo.gaming',
  },
  tvs: {
    subcats: ['OLED & QLED', '4K UHD', '8K Premium', 'Proyectores', 'Soportes', 'Barras de sonido'],
    brands: ['Samsung', 'LG', 'Sony', 'Hisense', 'TCL'],
    promoImage: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400',
    promoTextKey: 'categoryNav.promo.tvs',
  },
  smartphones: {
    subcats: ['Gama alta', 'Gama media', 'Economicos', 'Fundas', 'Micas', 'Cargadores rapidos'],
    brands: ['Apple', 'Samsung', 'Xiaomi', 'Motorola', 'Google Pixel'],
    promoImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&q=80&w=400',
    promoTextKey: 'categoryNav.promo.smartphones',
  },
  laptops: {
    subcats: ['Ultrabooks', 'MacBooks', 'Gaming', 'Para estudiantes', 'Workstations'],
    brands: ['Apple', 'Dell', 'Lenovo', 'HP', 'Asus', 'Acer'],
    promoImage: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400',
    promoTextKey: 'categoryNav.promo.laptops',
  },
  headphones: {
    subcats: ['In-Ear', 'Over-Ear', 'Noise Cancelling', 'Deportivos', 'DACs y amplificadores'],
    brands: ['Sony', 'Bose', 'Sennheiser', 'Apple', 'Jabra'],
    promoImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400',
    promoTextKey: 'categoryNav.promo.headphones',
  },
  cameras: {
    subcats: ['Mirrorless', 'DSLR', 'Deportivas', 'Drones', 'Lentes', 'Iluminacion'],
    brands: ['Sony', 'Canon', 'Nikon', 'GoPro', 'DJI'],
    promoImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
    promoTextKey: 'categoryNav.promo.cameras',
  },
};

interface MegaMenuCardProps {
  activeMenu: string | null;
  onViewList: (term: string) => void;
  onActiveCategoryChange: (id: string) => void;
}

const MegaMenuCard: React.FC<MegaMenuCardProps> = ({ activeMenu, onViewList, onActiveCategoryChange }) => {
  const { t } = useTranslation();
  const data = activeMenu && megaMenuData[activeMenu] ? megaMenuData[activeMenu] : megaMenuData.gaming;

  return (
    <div className="invisible absolute left-0 top-full z-50 mt-2 flex w-[850px] origin-top translate-y-[-10px] overflow-hidden rounded-2xl border border-base-content/10 bg-base-200/95 opacity-0 shadow-2xl shadow-primary/10 backdrop-blur-3xl transition-all duration-300 group-hover/dropdown:visible group-hover/dropdown:translate-y-0 group-hover/dropdown:opacity-100 group-focus-within/dropdown:visible group-focus-within/dropdown:translate-y-0 group-focus-within/dropdown:opacity-100">
      <div className="w-64 border-r border-base-content/5 bg-base-300/40 py-4">
        <div className="px-6 pb-2 text-[10px] font-bold uppercase tracking-widest text-base-content/40">
          {t('categoryNav.sections')}
        </div>
        <ul>
          {mainCategories.filter((category) => category.id !== 'black-friday').map((category) => (
            <li key={category.id}>
              <button
                type="button"
                onFocus={() => onActiveCategoryChange(category.id)}
                onClick={() => onViewList(category.id)}
                aria-label={t(category.labelKey)}
                data-hover-id={category.id}
                className={`flex w-full items-center justify-between px-6 py-2.5 text-left text-sm font-semibold transition-colors group/item ${
                  activeMenu === category.id ? 'bg-primary/10 text-primary' : 'text-base-content/70 hover:bg-base-300/50 hover:text-base-content'
                }`}
              >
                <span className="flex items-center gap-3">
                  <i
                    className={`${category.icon} w-4 text-center ${activeMenu === category.id ? 'text-primary' : 'text-base-content/40 group-hover/item:text-primary/70'}`}
                    aria-hidden="true"
                  ></i>
                  {t(category.labelKey)}
                </span>
                <i className="fa-solid fa-chevron-right text-[10px] opacity-30" aria-hidden="true"></i>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid flex-1 grid-cols-2 gap-8 p-8">
        <div>
          <h3 className="mb-4 inline-block border-b border-primary/20 pb-2 text-lg font-bold text-base-content/90">
            {t('categoryNav.subcategories')}
          </h3>
          <ul className="space-y-3">
            {data.subcats.map((subcategory) => (
              <li key={subcategory}>
                <button
                  type="button"
                  onClick={() => onViewList(subcategory)}
                  aria-label={subcategory}
                  className="group/link flex items-center gap-2 text-sm font-medium text-base-content/60 transition-colors hover:text-primary"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/30 transition-all group-hover/link:scale-150 group-hover/link:bg-primary" aria-hidden="true"></span>
                  {subcategory}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 inline-block border-b border-secondary/20 pb-2 text-lg font-bold text-base-content/90">
            {t('categoryNav.topBrands')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => onViewList(brand)}
                aria-label={brand}
                className="badge badge-outline border-base-content/20 py-3 text-xs font-semibold transition-colors hover:border-primary hover:bg-primary/5"
              >
                {brand}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="group/promo relative mt-8 inline-block overflow-hidden rounded-xl text-left shadow-md"
            onClick={() => onViewList(activeMenu || 'promo')}
            aria-label={t(data.promoTextKey)}
          >
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 to-black/20 transition-opacity group-hover/promo:opacity-80"></div>
            <img src={data.promoImage} alt="" className="h-32 w-full object-cover transition-transform duration-500 group-hover/promo:scale-105" />
            <div className="absolute bottom-0 left-0 z-20 w-full p-4">
              <span className="badge badge-error mb-1 border-0 text-[9px] font-bold uppercase tracking-wider shadow-sm">
                <i className="fa-solid fa-bolt mr-1" aria-hidden="true"></i>
                {t('categoryNav.flashOffer')}
              </span>
              <p className="text-sm font-bold leading-tight text-white">{t(data.promoTextKey)}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const CategoryNav: React.FC = () => {
  const { t } = useTranslation();
  const { setCategory, setSearchTerm, category } = useContext(AppContext);
  const [activeMegaCategory, setActiveMegaCategory] = useState<string | null>('gaming');
  const navigate = useNavigate();

  const handleCategoryClick = (id: string) => {
    if (id === 'black-friday') {
      setSearchTerm('Black Friday');
      setCategory(null);
      navigate('/catalog?q=Black%20Friday');
      return;
    }

    setCategory(id);
    setSearchTerm('');
    navigate(getCategoryUrl(id));
  };

  const handleViewList = (term: string) => {
    setSearchTerm(term);
    setCategory(null);
    navigate(`/catalog?q=${encodeURIComponent(term)}`);
  };

  const handleMegaMenuHover = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const button = target.closest('button[data-hover-id]');
    if (!button) {
      return;
    }

    const id = button.getAttribute('data-hover-id');
    if (id) {
      setActiveMegaCategory(id);
    }
  };

  return (
    <nav className="relative border-t border-base-content/5 bg-base-200/50 backdrop-blur-md" aria-label={t('header.nav.categories')}>
      <div className="container mx-auto px-4">
        <div className="relative flex items-center gap-0 lg:gap-4">
          <div className="group/dropdown relative hidden py-2.5 md:block">
            <button
              type="button"
              className="btn btn-sm flex h-12 items-center gap-3 rounded-2xl border-0 bg-gradient-to-r from-primary to-secondary px-6 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30"
              aria-haspopup="true"
            >
              <i className="fa-solid fa-bars-staggered text-lg" aria-hidden="true"></i>
              <span>{t('header.nav.categories')}</span>
              <i className="fa-solid fa-chevron-down ml-2 text-[10px] transition-transform duration-300 group-hover/dropdown:rotate-180 group-focus-within/dropdown:rotate-180" aria-hidden="true"></i>
            </button>
            <div onMouseOver={handleMegaMenuHover}>
              <MegaMenuCard activeMenu={activeMegaCategory} onViewList={handleViewList} onActiveCategoryChange={setActiveMegaCategory} />
            </div>
          </div>
          <div className="mx-2 hidden h-8 w-[1px] bg-base-content/10 md:block"></div>
          <div className="scrollbar-hide flex flex-1 items-center justify-start gap-2 overflow-x-auto py-2.5">
            {mainCategories.map((cat) => {
              const isActive = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  aria-pressed={isActive}
                  className={`group flex flex-shrink-0 cursor-pointer flex-col items-center gap-1.5 rounded-2xl px-4 py-2 transition-all duration-300 ${
                    isActive ? 'bg-primary/15 text-primary' : 'text-base-content/50 hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <span className={`text-lg transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`}>
                    <i className={`${cat.icon} fa-fw`} aria-hidden="true"></i>
                  </span>
                  <span className={`text-[11px] font-semibold tracking-wide ${isActive ? 'text-primary' : ''}`}>
                    {t(cat.labelKey)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CategoryNav;
