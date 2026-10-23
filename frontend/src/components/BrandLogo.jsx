import { Heart } from 'lucide-react';
import { useBranding } from '../contexts/useBranding';

export const BrandLogo = ({ className = 'w-9 h-9', iconSize = 20, onImageLoad }) => {
  const branding = useBranding();
  return (
    <div className={`${className} rounded-[var(--radius-sm)] flex items-center justify-center overflow-hidden shrink-0 shadow-sm`} style={{ backgroundColor: branding.primaryColor }} aria-label={`${branding.organizationName} logo`}>
      {branding.logoDataUrl
        ? <img src={branding.logoDataUrl} alt="" onLoad={event => onImageLoad?.(event.currentTarget.naturalWidth / event.currentTarget.naturalHeight)} className="w-full h-full object-contain bg-white" />
        : <Heart size={iconSize} className="text-white" fill="currentColor" />}
    </div>
  );
};
