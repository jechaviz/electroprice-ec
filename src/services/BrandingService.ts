import { siteNameSignal, siteTaglineSignal, primaryColorSignal, logoUrlSignal } from "../signals/branding.signals";

export class BrandingService {
    /**
     * Updates the global branding settings and persists them.
     */
    updateBranding(config: { 
        siteName?: string, 
        tagline?: string, 
        primaryColor?: string, 
        logoUrl?: string 
    }) {
        if (config.siteName) siteNameSignal.value = config.siteName;
        if (config.tagline) siteTaglineSignal.value = config.tagline;
        if (config.primaryColor) primaryColorSignal.value = config.primaryColor;
        if (config.logoUrl) logoUrlSignal.value = config.logoUrl;

        // Persist
        localStorage.setItem('ep_branding', JSON.stringify({
            siteName: siteNameSignal.value,
            tagline: siteTaglineSignal.value,
            primaryColor: primaryColorSignal.value,
            logoUrl: logoUrlSignal.value
        }));

        // Dynamically update CSS variables
        if (config.primaryColor) {
            document.documentElement.style.setProperty('--primary', config.primaryColor);
        }
    }

    resetToDefaults() {
        localStorage.removeItem('ep_branding');
        window.location.reload();
    }
}
