
import React, { useContext } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { AppContext } from '../../contexts/AppContext';

// Custom SVG Chip Icon (matching Header)
const ChipIcon: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="6" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" opacity="0.6"/>
    <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="8" y1="18" x2="8" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="16" y1="18" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="8" x2="6" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="2" y1="16" x2="6" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="8" x2="22" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// Circuit grid SVG for footer background
const FooterCircuitPattern: React.FC = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none text-primary" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="footer-circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <line x1="0" y1="40" x2="80" y2="40" stroke="currentColor" strokeWidth="0.3" opacity="0.04"/>
        <line x1="40" y1="0" x2="40" y2="80" stroke="currentColor" strokeWidth="0.3" opacity="0.04"/>
        <circle cx="40" cy="40" r="1.5" fill="currentColor" opacity="0.06"/>
        <circle cx="0" cy="0" r="0.8" fill="currentColor" opacity="0.04"/>
        <circle cx="80" cy="0" r="0.8" fill="currentColor" opacity="0.04"/>
        <circle cx="0" cy="80" r="0.8" fill="currentColor" opacity="0.04"/>
        <circle cx="80" cy="80" r="0.8" fill="currentColor" opacity="0.04"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#footer-circuit)"/>
  </svg>
);

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { setView } = useContext(AppContext);

  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    setView('home');
  }

  return (
    <footer className="relative bg-base-300/80 text-base-content mt-16 overflow-hidden">
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Circuit pattern overlay */}
      <FooterCircuitPattern />

      <div className="relative container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <a onClick={goHome} className="flex items-center gap-2.5 mb-5 cursor-pointer group">
              <ChipIcon className="w-8 h-8 text-primary drop-shadow-[0_0_8px_rgba(124,58,237,0.5)] group-hover:drop-shadow-[0_0_12px_rgba(124,58,237,0.7)] transition-all duration-300" />
              <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Electro<span className="gradient-text">Price</span>
              </span>
            </a>
            <p className="text-sm text-base-content/50 body max-w-xs leading-relaxed">{t('footer.description')}</p>
            <p className="mt-5 text-xs font-semibold text-base-content/60 uppercase tracking-wider">{t('footer.countriesTitle')}</p>
            <p className="text-xs text-base-content/40 mt-1">{t('footer.countriesList')}</p>
          </div>

          {/* Links */}
          {[
            { title: t('footer.nav.priceRunner'), links: [t('footer.nav.about'), t('footer.nav.contact'), t('footer.nav.pressRoom'), t('footer.nav.jobs')] },
            { title: t('footer.nav.moreInfo'), links: [t('footer.nav.getStarted'), t('footer.nav.secureShopping'), t('footer.nav.faq'), t('footer.nav.privacy')] },
            { title: t('footer.nav.partners'), links: [t('footer.nav.whyPriceRunner'), t('footer.nav.registerStore'), t('footer.nav.merchantDashboard'), t('footer.nav.api')] },
          ].map(section => (
            <div key={section.title}>
              <h6 className="heading text-sm font-bold uppercase tracking-wider text-base-content/70 mb-4">{section.title}</h6>
              <ul className="space-y-2.5">
                {section.links.map(link => (
                  <li key={link}>
                    <a className="text-sm text-base-content/40 hover:text-primary transition-colors duration-200 cursor-pointer">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-base-content/5 mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-base-content/30">&copy; {new Date().getFullYear()} ElectroPrice Technologies AB — {t('footer.rightsReserved')}</p>
          <div className="flex gap-5">
            {['twitter', 'youtube', 'facebook'].map(social => (
              <a key={social} className="text-base-content/30 hover:text-primary hover:scale-110 transition-all duration-300 cursor-pointer">
                <i className={`fa-brands fa-${social} text-xl`}></i>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;