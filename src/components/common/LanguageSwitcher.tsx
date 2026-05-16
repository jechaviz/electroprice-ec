import React, { useContext } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import NativeSelect from './NativeSelect';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useContext(LanguageContext);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'es');
  };

  return (
    <NativeSelect value={language} onChange={handleLanguageChange} size="sm" aria-label="Select language">
      <option value="en">English</option>
      <option value="es">Espa\u00f1ol</option>
    </NativeSelect>
  );
};

export default LanguageSwitcher;
