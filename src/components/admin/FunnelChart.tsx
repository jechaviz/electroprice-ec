import React from 'react';

interface FunnelChartProps {
    data: {
        views: number;
        addToCart: number;
        checkout: number;
        success: number;
    };
}

const FunnelChart: React.FC<FunnelChartProps> = ({ data }) => {
    const steps = [
        { label: 'Product Views', value: data.views, color: 'bg-primary' },
        { label: 'Add to Cart', value: data.addToCart, color: 'bg-secondary' },
        { label: 'Checkout Start', value: data.checkout, color: 'bg-accent' },
        { label: 'Purchase Success', value: data.success, color: 'bg-success' },
    ];

    const max = data.views || 1;

    return (
        <div className="space-y-8 p-4">
            <div className="flex flex-col gap-6">
                {steps.map((step, index) => {
                    const percentage = Math.round((step.value / max) * 100);
                    const dropoff = index > 0 ? Math.round((1 - (step.value / (steps[index - 1].value || 1))) * 100) : 0;

                    return (
                        <div key={step.label} className="relative">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40">{step.label}</span>
                                <span className="text-sm font-black text-base-content">{step.value.toLocaleString()} <span className="text-[10px] opacity-40">({percentage}%)</span></span>
                            </div>
                            <div className="h-4 w-full bg-base-300 rounded-full overflow-hidden flex shadow-inner">
                                <div 
                                    className={`h-full ${step.color} transition-all duration-1000 shadow-lg`} 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            {index > 0 && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center gap-1 text-[9px] font-black text-error bg-error/10 px-2 py-0.5 rounded-full border border-error/5">
                                    <i className="fa-solid fa-arrow-down"></i>
                                    {dropoff}% Drop-off
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FunnelChart;
