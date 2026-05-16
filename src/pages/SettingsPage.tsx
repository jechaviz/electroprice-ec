import React, { useState } from 'react';
import { services } from '../services/ServiceContainer';
import { siteNameSignal, siteTaglineSignal, primaryColorSignal, logoUrlSignal } from '../signals/branding.signals';
import { taxRateSignal, baseShippingFeeSignal, platformCommissionSignal, apiStatusSignal } from '../signals/config.signals';

type SettingsTab = 'branding' | 'financial' | 'system';

const settingsTabs: { id: SettingsTab; label: string; icon: string }[] = [
    { id: 'branding', label: 'Identity & Branding', icon: 'fa-palette' },
    { id: 'financial', label: 'Financial Controls', icon: 'fa-money-bill-trend-up' },
    { id: 'system', label: 'System & API Health', icon: 'fa-server' }
];

const SettingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('branding');

    // Local form states
    const [localBranding, setLocalBranding] = useState({
        siteName: siteNameSignal.value,
        tagline: siteTaglineSignal.value,
        primaryColor: primaryColorSignal.value,
        logoUrl: logoUrlSignal.value || ''
    });

    const [localFinancial, setLocalFinancial] = useState({
        taxRate: taxRateSignal.value * 100,
        baseShippingFee: baseShippingFeeSignal.value,
        platformCommission: platformCommissionSignal.value * 100
    });

    const handleSaveBranding = (e: React.FormEvent) => {
        e.preventDefault();
        services.branding.updateBranding(localBranding);
    };

    const handleSaveFinancial = (e: React.FormEvent) => {
        e.preventDefault();
        services.config.updateConfig({
            taxRate: localFinancial.taxRate / 100,
            baseShippingFee: localFinancial.baseShippingFee,
            platformCommission: localFinancial.platformCommission / 100
        });
        services.notification.success("Financial settings saved successfully.");
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-6xl animate-fade-in-up">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">System Control Center</h1>
                    <p className="text-base-content/50 font-medium mt-1">Manage global parameters, branding identity, and financial logic.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => services.branding.resetToDefaults()} className="btn btn-ghost btn-sm rounded-xl font-black uppercase tracking-widest text-[10px]">Reset to Factory</button>
                    <button onClick={() => window.location.reload()} className="btn btn-primary btn-sm rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Apply All Changes</button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
                {/* Sidebar Navigation */}
                <aside className="space-y-2">
                    {settingsTabs.map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${activeTab === tab.id ? 'bg-primary text-primary-content shadow-xl shadow-primary/20' : 'bg-base-200/50 hover:bg-base-200 border border-transparent hover:border-base-content/10'}`}
                        >
                            <i className={`fa-solid ${tab.icon} text-sm`}></i>
                            {tab.label}
                        </button>
                    ))}
                </aside>

                {/* Main Content Area */}
                <main className="bg-base-200/50 rounded-[2.5rem] border border-base-content/5 p-8 md:p-12 backdrop-blur-md">
                    {activeTab === 'branding' && (
                        <form onSubmit={handleSaveBranding} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-black uppercase tracking-widest text-[10px] opacity-40">Site Name</span></label>
                                    <input 
                                        type="text" 
                                        value={localBranding.siteName}
                                        onChange={(e) => setLocalBranding({...localBranding, siteName: e.target.value})}
                                        className="input bg-base-100 border-base-content/10 rounded-2xl font-bold" 
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-black uppercase tracking-widest text-[10px] opacity-40">Tagline</span></label>
                                    <input 
                                        type="text" 
                                        value={localBranding.tagline}
                                        onChange={(e) => setLocalBranding({...localBranding, tagline: e.target.value})}
                                        className="input bg-base-100 border-base-content/10 rounded-2xl font-bold" 
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-black uppercase tracking-widest text-[10px] opacity-40">Primary Color</span></label>
                                    <div className="flex gap-4">
                                        <input 
                                            type="color" 
                                            value={localBranding.primaryColor}
                                            onChange={(e) => setLocalBranding({...localBranding, primaryColor: e.target.value})}
                                            className="h-12 w-20 rounded-xl overflow-hidden cursor-pointer border-0"
                                        />
                                        <input 
                                            type="text" 
                                            value={localBranding.primaryColor}
                                            onChange={(e) => setLocalBranding({...localBranding, primaryColor: e.target.value})}
                                            className="input flex-1 bg-base-100 border-base-content/10 rounded-2xl font-mono text-xs" 
                                        />
                                    </div>
                                </div>
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-black uppercase tracking-widest text-[10px] opacity-40">Logo URL (Mock)</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="https://..."
                                        value={localBranding.logoUrl}
                                        onChange={(e) => setLocalBranding({...localBranding, logoUrl: e.target.value})}
                                        className="input bg-base-100 border-base-content/10 rounded-2xl font-mono text-xs" 
                                    />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-base-content/5">
                                <button type="submit" className="btn btn-primary rounded-2xl px-10 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20">Save Branding Identity</button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'financial' && (
                        <form onSubmit={handleSaveFinancial} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-black uppercase tracking-widest text-[10px] opacity-40">Tax Rate (%)</span></label>
                                    <input 
                                        type="number" 
                                        value={localFinancial.taxRate}
                                        onChange={(e) => setLocalFinancial({...localFinancial, taxRate: Number(e.target.value)})}
                                        className="input bg-base-100 border-base-content/10 rounded-2xl font-black text-xl" 
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-black uppercase tracking-widest text-[10px] opacity-40">Shipping Fee ($)</span></label>
                                    <input 
                                        type="number" 
                                        value={localFinancial.baseShippingFee}
                                        onChange={(e) => setLocalFinancial({...localFinancial, baseShippingFee: Number(e.target.value)})}
                                        className="input bg-base-100 border-base-content/10 rounded-2xl font-black text-xl" 
                                    />
                                </div>
                                <div className="form-control w-full">
                                    <label className="label"><span className="label-text font-black uppercase tracking-widest text-[10px] opacity-40">Platform Commission (%)</span></label>
                                    <input 
                                        type="number" 
                                        value={localFinancial.platformCommission}
                                        onChange={(e) => setLocalFinancial({...localFinancial, platformCommission: Number(e.target.value)})}
                                        className="input bg-base-100 border-base-content/10 rounded-2xl font-black text-xl" 
                                    />
                                </div>
                            </div>
                            <div className="pt-6 border-t border-base-content/5">
                                <button type="submit" className="btn btn-primary rounded-2xl px-10 font-black uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20">Apply Financial Parameters</button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'system' && (
                        <div className="space-y-10">
                            <section>
                                <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-6">Service Connectivity</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(apiStatusSignal.value).map(([service, status]) => (
                                        <div key={service} className="bg-base-100 p-6 rounded-[2rem] border border-base-content/5 flex items-center justify-between shadow-inner">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-3 w-3 rounded-full ${status === 'online' ? 'bg-success shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-error'}`}></div>
                                                <span className="font-black uppercase tracking-widest text-xs">{service}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${status === 'online' ? 'text-success' : 'text-error'}`}>{status}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-error/5 border border-error/20 p-8 rounded-[2rem]">
                                <div className="flex items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-error">Danger Zone</h3>
                                        <p className="text-xs font-medium text-error/60 mt-1">Actions here can significantly impact live production users.</p>
                                    </div>
                                    <button 
                                        onClick={() => services.config.toggleMaintenanceMode()}
                                        className="btn btn-error btn-outline btn-sm rounded-xl font-black uppercase tracking-widest text-[10px]"
                                    >
                                        Toggle Maintenance Mode
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default SettingsPage;
