import { en } from './en';
import type { TranslationKey } from './de';

export const fr: Record<TranslationKey, string> = {
  ...en,
  'language.sr': 'Serbe',
  'language.de': 'Allemand',
  'language.fr': 'Français',
  'language.en': 'Anglais',
  'language.switch': 'Choisir la langue',
  'login.title': 'Bon retour',
  'login.titleOtp': 'Vérifie ton e-mail',
  'login.subtitle':
    'Atteins tes objectifs. Connecte-toi et reste concentré.',
  'login.hero.title': 'La discipline bat la motivation.',
  'login.hero.subtitle': 'Grandis chaque jour.',
  'login.sendCode': 'Envoyer le code',
  'login.submit': 'Se connecter',
  'login.checking': 'Vérification…',
  'header.logout': 'Se déconnecter',
};
