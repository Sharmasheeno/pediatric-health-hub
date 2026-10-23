import { useContext } from 'react';
import { BrandingContext } from './branding-context';

export const useBranding = () => useContext(BrandingContext);
