import React, { createContext, useEffect, ReactNode, useContext } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import type { Currency, Rates } from '../types';
import { currencySignal, ratesSignal, currencyErrorSignal, isCurrencyLoadingSignal } from '../signals/config.signals';
import { CurrencyService } from '../services/CurrencyService';

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  rates: Rates | null;
  loading: boolean;
  error: string | null;
  formatPrice: (priceInUsd: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType>({} as CurrencyContextType);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useSignals();

  useEffect(() => {
    void CurrencyService.fetchRates();
  }, []);

  const value = {
    currency: currencySignal.value,
    setCurrency: (curr: Currency) => CurrencyService.setCurrency(curr),
    rates: ratesSignal.value,
    loading: isCurrencyLoadingSignal.value,
    error: currencyErrorSignal.value,
    formatPrice: (priceInUsd: number) => CurrencyService.formatPrice(priceInUsd),
  };
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
