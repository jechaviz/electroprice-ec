import React from 'react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
    description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, trend, color = 'primary', description }) => {
    const sparkWidth = 75; // Static value for stability
    const colorClasses = {
        primary: 'text-primary bg-primary/10 border-primary/20',
        secondary: 'text-secondary bg-secondary/10 border-secondary/20',
        accent: 'text-accent bg-accent/10 border-accent/20',
        success: 'text-success bg-success/10 border-success/20',
        warning: 'text-warning bg-warning/10 border-warning/20',
        error: 'text-error bg-error/10 border-error/20',
    };

    return (
        <div className="relative overflow-hidden rounded-3xl border border-base-content/5 bg-base-200/50 p-6 shadow-sm transition-all hover:shadow-xl hover:border-base-content/10 group">
            {/* Ambient Background Glow */}
            <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-20 ${color === 'primary' ? 'bg-primary' : color === 'secondary' ? 'bg-secondary' : 'bg-accent'}`}></div>
            
            <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-base-content/40">{title}</p>
                    <h3 className="text-3xl font-black tracking-tight text-base-content">{value}</h3>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colorClasses[color]} shadow-lg transition-transform group-hover:scale-110`}>
                    <i className={`fa-solid ${icon} text-xl`}></i>
                </div>
            </div>

            <div className="mt-6 flex items-end justify-between relative z-10">
                {trend && (
                    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${trend.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        <i className={`fa-solid ${trend.isPositive ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down'}`}></i>
                        {trend.isPositive ? '+' : '-'}{trend.value}%
                    </div>
                )}
                {description && (
                    <p className="text-[10px] font-bold text-base-content/30 uppercase tracking-widest ml-auto">{description}</p>
                )}
            </div>

            {/* Simulated Sparkline (CSS-based) */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-base-content/5 overflow-hidden">
                <div 
                    className={`h-full opacity-30 ${color === 'primary' ? 'bg-primary' : color === 'secondary' ? 'bg-secondary' : 'bg-accent'} transition-all duration-1000`} 
                    style={{ width: `${sparkWidth}%` }}
                ></div>
            </div>
        </div>
    );
};

export default MetricCard;
