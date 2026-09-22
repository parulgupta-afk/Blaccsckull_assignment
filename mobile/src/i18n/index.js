import en from './en.json';
import hi from './hi.json';

const dictionaries = { en, hi };

// Minimal {placeholder} interpolation -- enough for this screen without
// pulling in a full i18n library for a single-screen assignment.
export function t(locale, key, vars = {}) {
  const dict = dictionaries[locale] || dictionaries.en;
  const template = dict[key] ?? dictionaries.en[key] ?? key;
  return template.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? ''));
}
