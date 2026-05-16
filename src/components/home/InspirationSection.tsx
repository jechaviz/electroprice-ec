import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

const InspirationSection: React.FC = () => {
  const { t } = useTranslation();

  const inspirationCards = [
    {
      titleKey: 'home.inspiration.card1.title',
      textKey: 'home.inspiration.card1.text',
      imageUrl: 'https://images.pexels.com/photos/3224164/pexels-photo-3224164.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      titleKey: 'home.inspiration.card2.title',
      textKey: 'home.inspiration.card2.text',
      imageUrl: 'https://images.pexels.com/photos/3727513/pexels-photo-3727513.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
      titleKey: 'home.inspiration.card3.title',
      textKey: 'home.inspiration.card3.text',
      imageUrl: 'https://images.pexels.com/photos/5797991/pexels-photo-5797991.jpeg?auto=compress&cs=tinysrgb&w=600',
    }
  ];

  return (
    <section>
      <h2 className="text-3xl font-bold mb-6">{t('home.inspiration.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {inspirationCards.map((card, index) => (
          <div key={index} className="card card-compact bg-base-200 shadow-xl group cursor-pointer">
            <figure className="h-56">
                <img src={card.imageUrl} alt={t(card.titleKey)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </figure>
            <div className="card-body">
              <h3 className="card-title">{t(card.titleKey)}</h3>
              <p className="text-base-content/70 text-sm">{t(card.textKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default InspirationSection;