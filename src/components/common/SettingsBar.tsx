import React, { useContext } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { useCurrency } from '../../contexts/CurrencyContext';

const SettingsBar: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);
  const { currency, setCurrency, loading } = useCurrency();

  return (
    <div className="flex items-center gap-2">
      {/* Language Selector */}
      <div className="dropdown dropdown-end">
        <div 
          tabIndex={0} 
          role="button" 
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-300/40 border border-base-content/10 text-xs font-semibold text-base-content/70 hover:bg-base-300/80 hover:text-primary hover:border-primary/30 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-earth-americas text-primary/70"></i>
          <span className="uppercase">{language}</span>
          <i className="fa-solid fa-chevron-down text-[10px] opacity-50 ml-0.5"></i>
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] mt-2 flex w-32 list-none flex-col gap-1 rounded-2xl border border-base-content/5 bg-base-200/95 p-2 shadow-xl backdrop-blur-xl">
          <li>
            <button 
              className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${language === 'en' ? 'bg-primary/20 text-primary' : 'hover:bg-primary/5 hover:text-primary'}`} 
              onClick={() => { setLanguage('en'); (document.activeElement as HTMLElement)?.blur(); }}
            >
              English
            </button>
          </li>
          <li>
            <button 
              className={`w-full rounded-xl px-3 py-2 text-left text-xs font-semibold transition-colors ${language === 'es' ? 'bg-primary/20 text-primary' : 'hover:bg-primary/5 hover:text-primary'}`} 
              onClick={() => { setLanguage('es'); (document.activeElement as HTMLElement)?.blur(); }}
            >
              Español
            </button>
          </li>
        </ul>
      </div>

      {/* Currency Selector */}
      <div className="dropdown dropdown-end">
        <div 
          tabIndex={0} 
          role="button" 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-base-300/40 border border-base-content/10 text-xs font-semibold text-base-content/70 hover:bg-base-300/80 hover:text-primary hover:border-primary/30 transition-all cursor-pointer ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <i className="fa-solid fa-money-bill-wave text-secondary/70"></i>
          <span className="uppercase">{currency}</span>
          <i className="fa-solid fa-chevron-down text-[10px] opacity-50 ml-0.5"></i>
        </div>
        <ul tabIndex={0} className="dropdown-content z-[1] mt-2 flex w-28 list-none flex-col gap-1 rounded-2xl border border-base-content/5 bg-base-200/95 p-2 shadow-xl backdrop-blur-xl">
           <li>
            <button 
              className={`flex w-full justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${currency === 'USD' ? 'bg-secondary/20 text-secondary' : 'hover:bg-secondary/5 hover:text-secondary'}`} 
              onClick={() => { setCurrency('USD'); (document.activeElement as HTMLElement)?.blur(); }}
            >
              <span>USD</span>
              <span className="opacity-50">$</span>
            </button>
          </li>
          <li>
            <button 
              className={`flex w-full justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${currency === 'MXN' ? 'bg-secondary/20 text-secondary' : 'hover:bg-secondary/5 hover:text-secondary'}`} 
              onClick={() => { setCurrency('MXN'); (document.activeElement as HTMLElement)?.blur(); }}
            >
              <span>MXN</span>
              <span className="opacity-50">$</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SettingsBar;
