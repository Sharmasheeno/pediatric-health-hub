const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const DEFAULT_SETTINGS = {
  id: 1,
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

const getSettings = async () => prisma.systemSettings.upsert({
  where: { id: 1 },
  update: {},
  create: DEFAULT_SETTINGS
});

const updateSettings = async (data, userId) => prisma.systemSettings.upsert({
  where: { id: 1 },
  update: { ...data, updatedByUserId: userId },
  create: { ...DEFAULT_SETTINGS, ...data, updatedByUserId: userId }
});

const getPublicBranding = async () => {
  const settings = await getSettings();
  const { organizationName, shortName, tagline, logoDataUrl, primaryColor, supportEmail, supportPhone, websiteUrl, address, country, timezone, currency, assistantName, assistantDisclaimer } = settings;
  return { organizationName, shortName, tagline, logoDataUrl, primaryColor, supportEmail, supportPhone, websiteUrl, address, country, timezone, currency, assistantName, assistantDisclaimer };
};

module.exports = { DEFAULT_SETTINGS, getSettings, updateSettings, getPublicBranding };
