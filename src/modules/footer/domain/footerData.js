import { FOOTER_TEXT } from '../../../core/constants/navigation/footerText.js';

export const FOOTER_NAVIGATION = FOOTER_TEXT.navigation;
export const FOOTER_SYSTEMS = FOOTER_TEXT.systems;
export const FOOTER_CONTACT_CHANNELS = FOOTER_TEXT.connect;
export const FOOTER_SOCIALS = FOOTER_TEXT.socials;
export const FOOTER_CONNECT = Object.freeze([
  ...FOOTER_CONTACT_CHANNELS,
  ...FOOTER_SOCIALS.map((social) => Object.freeze({
    id: social.id,
    label: social.name,
    action: social.handle,
    url: social.url,
  })),
]);
export const FOOTER_COLOPHON = FOOTER_TEXT.colophon;
export { FOOTER_TEXT };