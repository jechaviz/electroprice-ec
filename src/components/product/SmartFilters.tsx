
import React from 'react';
import type { SmartFilter } from '../../types';
import { useTranslation } from '../../hooks/useTranslation';

interface SmartFiltersProps {
  category: string;
  config: SmartFilter[];
  values: Record<string, number | string[]>;
  onChange: (newValues: Record<string, number | string[]>) => void;
}

const SmartFilters: React.FC<SmartFiltersProps> = ({ config, values, onChange }) => {
  const { t } = useTranslation();

  const handleSliderChange = (key: string, value: number) => {
    onChange({ ...values, [key]: value });
  };
  
  const handleCheckboxChange = (key: string, option: string) => {
    const currentSelection = (values[key] as string[] | undefined) || [];
    const newSelection = currentSelection.includes(option)
      ? currentSelection.filter(item => item !== option)
      : [...currentSelection, option];
    onChange({ ...values, [key]: newSelection });
  };
  
  if (!config || config.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 border-t pt-6 border-base-300">
      <h3 className="text-lg font-bold mb-4">{t('smartFilters.title')}</h3>
      <div className="form-control gap-6">
        {config.map((filter) => {
          if (filter.type === 'slider') {
            const currentValue = (values[filter.key] as number | undefined) || filter.min;
            return (
              <div key={filter.key}>
                <label className="label">
                  <span className="label-text">{t(filter.labelKey)}</span>
                  <span className="label-text-alt">{currentValue}+ {filter.unit}</span>
                </label>
                <input
                  type="range"
                  min={filter.min}
                  max={filter.max}
                  step={filter.step}
                  value={currentValue}
                  onChange={(e) => handleSliderChange(filter.key, Number(e.target.value))}
                  className="range range-primary"
                />
                 <div className="w-full flex justify-between text-xs px-2">
                    <span>{filter.min} {filter.unit}</span>
                    <span>{filter.max} {filter.unit}</span>
                  </div>
              </div>
            );
          }
          if (filter.type === 'checkbox') {
            const currentSelection = (values[filter.key] as string[] | undefined) || [];
            return (
                <div key={filter.key}>
                    <label className="label">
                        <span className="label-text">{t(filter.labelKey)}</span>
                    </label>
                    <div className="flex flex-col gap-2">
                        {filter.options.map(option => (
                             <label key={option} className="cursor-pointer flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    className="checkbox checkbox-primary" 
                                    checked={currentSelection.includes(option)}
                                    onChange={() => handleCheckboxChange(filter.key, option)}
                                />
                                <span className="label-text">{option}</span> 
                            </label>
                        ))}
                    </div>
                </div>
            )
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default SmartFilters;
