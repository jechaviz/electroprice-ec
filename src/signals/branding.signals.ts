import { signal } from "@preact/signals-react";

// Load defaults from localStorage if available
const savedBranding = JSON.parse(localStorage.getItem('ep_branding') || '{}');

export const siteNameSignal = signal<string>(savedBranding.siteName || "ElectroPrice");
export const siteTaglineSignal = signal<string>(savedBranding.tagline || "Premium Tech Marketplace");
export const primaryColorSignal = signal<string>(savedBranding.primaryColor || "#7C3AED");
export const logoUrlSignal = signal<string | null>(savedBranding.logoUrl || null);


