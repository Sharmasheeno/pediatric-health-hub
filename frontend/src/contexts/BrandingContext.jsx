import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/axios';
import { BrandingContext, DEFAULT_BRANDING } from './branding-context';

const mix = (hex, other, amount) => {
  const rgb = hex.match(/[0-9a-f]{2}/gi)?.map(value => parseInt(value, 16)) || [37, 99, 235];
  const target = other.match(/[0-9a-f]{2}/gi).map(value => parseInt(value, 16));
  return `#${rgb.map((channel, index) => Math.round(channel + (target[index] - channel) * amount).toString(16).padStart(2, '0')).join('')}`;
};

const applyBrandColor = (hex) => {
  const root = document.documentElement;
  const rgb = hex.match(/[0-9a-f]{2}/gi)?.map(value => parseInt(value, 16)) || [37, 99, 235];
  const linear = rgb.map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
  const whiteContrast = 1.05 / (luminance + 0.05);
  const inkContrast = (luminance + 0.05) / (0.008 + 0.05);
  root.style.setProperty('--color-primary-foreground', whiteContrast >= inkContrast ? '#FFFFFF' : '#142238');
  root.style.setProperty('--color-teal', hex);
  root.style.setProperty('--color-violet', hex);
  const shades = { 50: [255, 255, 255, 0.95], 100: [255, 255, 255, 0.88], 200: [255, 255, 255, 0.75], 300: [255, 255, 255, 0.58], 400: [255, 255, 255, 0.32], 500: [255, 255, 255, 0.15], 600: [0, 0, 0, 0], 700: [0, 0, 0, 0.14], 800: [0, 0, 0, 0.27], 900: [0, 0, 0, 0.4], 950: [0, 0, 0, 0.55] };
  Object.entries(shades).forEach(([shade, [r, g, b, amount]]) => {
    const target = `#${[r, g, b].map(value => value.toString(16).padStart(2, '0')).join('')}`;
    root.style.setProperty(`--color-primary-${shade}`, amount === 0 ? hex : mix(hex, target, amount));
  });
};

export const BrandingProvider = ({ children }) => {
  const { data } = useQuery({
    queryKey: ['system-branding'],
    queryFn: async () => (await api.get('/system/branding')).data.data,
    staleTime: 60_000,
    retry: 1
  });
  const branding = { ...DEFAULT_BRANDING, ...data };

  useEffect(() => {
    applyBrandColor(branding.primaryColor);
    document.title = branding.organizationName;
  }, [branding.organizationName, branding.primaryColor]);

  return <BrandingContext.Provider value={branding}>{children}</BrandingContext.Provider>;
};
