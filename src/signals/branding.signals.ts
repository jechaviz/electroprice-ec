import { signal } from "@preact/signals-react";

// Load defaults from localStorage if available
const readStoredBranding = (): Record<string, string> => {
    try {
        const parsed = JSON.parse(localStorage.getItem('ep_branding') || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        localStorage.removeItem('ep_branding');
        return {};
    }
};

const savedBranding = readStoredBranding();

export const siteNameSignal = signal<string>(savedBranding.siteName || "ElectroPrice");
export const siteTaglineSignal = signal<string>(savedBranding.tagline || "Electrónica y tecnología");
export const primaryColorSignal = signal<string>(savedBranding.primaryColor || "#7C3AED");
export const logoUrlSignal = signal<string | null>(savedBranding.logoUrl || null);

