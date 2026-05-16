import React from 'react';

interface AITabProps {
  isSummaryLoading: boolean;
  aiSummary: string;
  t: (key: string) => string;
}

export const AITab: React.FC<AITabProps> = ({ isSummaryLoading, aiSummary, t }) => {
  return (
    <div className="animate-fade-in-up max-w-4xl mx-auto">
      <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 lg:p-10 border border-accent/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex items-center gap-4 mb-6 border-b border-base-content/10 pb-6">
          <div className="w-12 h-12 rounded-full bg-accent text-accent-content flex items-center justify-center shadow-[0_0_15px_rgba(4,217,255,0.3)]">
            <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
          </div>
          <div>
            <h3 className="text-2xl font-black text-base-content">{t('detail.aiStudies')}</h3>
            <p className="text-xs font-bold uppercase tracking-widest text-base-content/40 mt-1">{t('detail.aiDeepAnalysis')}</p>
          </div>
        </div>
        {isSummaryLoading && (
          <div className="space-y-4">
            <div className="skeleton h-4 w-full bg-base-300"></div>
            <div className="skeleton h-4 w-11/12 bg-base-300"></div>
            <div className="skeleton h-4 w-9/12 bg-base-300"></div>
            <div className="skeleton h-4 w-full bg-base-300"></div>
          </div>
        )}
        {aiSummary && !isSummaryLoading && (
          <p className="text-lg lg:text-xl leading-relaxed text-base-content/80 relative z-10 font-medium">{aiSummary}</p>
        )}
      </div>
    </div>
  );
};
