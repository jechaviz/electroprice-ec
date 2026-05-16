import React, { useState } from 'react';
import { services } from '../../services/ServiceContainer';
import { useTranslation } from '../../hooks/useTranslation';

interface AIGrowthAssistantProps {
    productName: string;
    description: string;
    brand: string;
}

const AIGrowthAssistant: React.FC<AIGrowthAssistantProps> = ({ productName, description, brand }) => {
    const { t } = useTranslation();
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<{ slogan: string; copy: string; tags: string[] } | null>(null);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const data = await services.campaign.generateProductCampaign(productName, description, brand);
            setResult(data);
            services.analytics.trackEvent('ai_action', { action: 'generate_campaign', productName });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-[2rem] p-8 border border-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className="fa-solid fa-wand-magic-sparkles text-6xl text-primary"></i>
            </div>

            <h3 className="text-xl font-black mb-2 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm shadow-lg shadow-primary/30">
                    <i className="fa-solid fa-robot"></i>
                </span>
                {t('retailerDashboard.aiAssistant.title') || 'AI Growth Assistant'}
            </h3>
            <p className="text-sm text-base-content/50 font-medium mb-6">
                {t('retailerDashboard.aiAssistant.subtitle') || 'Let our AI generate high-converting marketing copy for your listing.'}
            </p>

            {result ? (
                <div className="space-y-4 animate-fade-in">
                    <div className="bg-base-100/50 p-4 rounded-2xl border border-base-content/5 shadow-inner">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Generated Slogan</p>
                        <p className="text-lg font-black italic">"{result.slogan}"</p>
                    </div>
                    <div className="bg-base-100/50 p-4 rounded-2xl border border-base-content/5 shadow-inner">
                        <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Marketing Copy</p>
                        <p className="text-sm font-medium leading-relaxed">{result.copy}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {result.tags.map(tag => (
                            <span key={tag} className="badge badge-outline border-base-content/10 text-[10px] font-bold uppercase tracking-widest px-3 py-2.5">#{tag}</span>
                        ))}
                    </div>
                    <button 
                        onClick={() => setResult(null)} 
                        className="btn btn-ghost btn-xs rounded-full text-base-content/40 hover:text-primary transition-colors"
                    >
                        {t('common.clear')}
                    </button>
                </div>
            ) : (
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={`btn btn-primary btn-md rounded-xl shadow-xl shadow-primary/20 w-full sm:w-auto px-8 font-black uppercase tracking-widest text-xs h-14 ${isGenerating ? 'loading' : ''}`}
                >
                    {!isGenerating && <i className="fa-solid fa-sparkles mr-2"></i>}
                    {isGenerating ? t('common.generating') : t('retailerDashboard.aiAssistant.generateAction') || 'Generate Campaign'}
                </button>
            )}
        </div>
    );
};

export default AIGrowthAssistant;
