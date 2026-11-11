import i18next from 'i18next';
import ptPT from '../locales/pt-PT.json';
import ptBR from '../locales/pt-BR.json';
import en from '../locales/en.json';
import es from '../locales/es.json';

export const SUPPORTED_LOCALES = ['pt-PT', 'pt-BR', 'en', 'es'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'pt-PT';

export const LOCALE_LABELS: Record<Locale, string> = {
  'pt-PT': 'Português (PT)',
  'pt-BR': 'Português (BR)',
  en: 'English',
  es: 'Español'
};

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export async function initI18n(locale: Locale): Promise<void> {
  await i18next.init({
    lng: locale,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: [...SUPPORTED_LOCALES],
    resources: {
      'pt-PT': { translation: ptPT },
      'pt-BR': { translation: ptBR },
      en: { translation: en },
      es: { translation: es }
    },
    interpolation: { escapeValue: false },
    returnNull: false
  });
  document.documentElement.lang = locale;
}

export async function setLocale(locale: Locale): Promise<void> {
  await i18next.changeLanguage(locale);
  document.documentElement.lang = locale;
}

export function getLocale(): Locale {
  const language = i18next.language;
  return isLocale(language) ? language : DEFAULT_LOCALE;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return String(i18next.t(key, options));
}

export function formatEuro(centimos: number): string {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: 'EUR'
  }).format(centimos / 100);
}