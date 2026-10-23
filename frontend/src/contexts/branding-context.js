import { createContext } from 'react';

export const DEFAULT_BRANDING = {
  organizationName: 'Pediatric Health Hub',
  shortName: 'Pediatric Hub',
  tagline: 'Pediatric care for every family',
  logoDataUrl: null,
  primaryColor: '#2563EB',
  supportEmail: null,
  supportPhone: null,
  websiteUrl: null,
  address: null,
  country: 'Somalia',
  timezone: 'Africa/Mogadishu',
  currency: 'USD',
  assistantName: 'Pediatric Health Assistant',
  assistantDisclaimer: 'I provide general information, not diagnosis or treatment. For urgent symptoms, contact local emergency services or a nearby health facility. / Waxaan bixiyaa macluumaad guud oo keliya; ma sameeyo ogaansho mana bixiyo daaweyn. Haddii xaalad degdeg ahi jirto, la xiriir adeegga gurmadka caafimaad ee deegaankaaga.'
};

export const BrandingContext = createContext(DEFAULT_BRANDING);
