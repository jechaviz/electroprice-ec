import React from 'react';

interface SpecsTabProps {
  specs: Record<string, string | number>;
  t: (key: string) => string;
}

export const SpecsTab: React.FC<SpecsTabProps> = ({ specs, t }) => {
  return (
    <div className="animate-fade-in-up">
      <h3 className="text-2xl font-black mb-6 text-center">{t('detail.techSpecs')}</h3>
      <div className="max-w-4xl mx-auto bg-base-100 rounded-2xl border border-base-content/10 overflow-hidden shadow-sm">
        {Object.entries(specs).map(([key, value], index) => (
          <div key={key} className={`flex flex-col sm:flex-row border-b border-base-content/5 last:border-0 ${index % 2 === 0 ? 'bg-base-100' : 'bg-base-200/30'}`}>
            <div className="sm:w-1/3 p-4 sm:px-6 border-b sm:border-b-0 sm:border-r border-base-content/5 bg-base-200/20 font-bold text-xs text-base-content/60 uppercase tracking-widest sm:text-right">{key}</div>
            <div className="sm:w-2/3 p-4 sm:px-6 font-black text-base text-base-content/90 flex items-center">{value as React.ReactNode}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
