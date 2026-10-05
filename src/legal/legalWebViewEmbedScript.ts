import type { AppLanguage } from '@/i18n/types';
import { translations } from '@/i18n/locales';
import { DEFAULT_APP_LANGUAGE } from '@/i18n/types';
import { LEGAL_EMBED_CLOSE_MESSAGE } from '@/legal/legalWebViewMessages';

export const LEGAL_WEBVIEW_EMBED_FLAG_SCRIPT = `
  window.__LEGAL_EMBED__ = true;
  true;
`;

export function getCloseLabelForLanguage(language: AppLanguage): string {
  return (
    translations[language]['common.close'] ??
    translations[DEFAULT_APP_LANGUAGE]['common.close']
  );
}

export function buildLegalWebViewCloseLabelUpdateScript(label: string): string {
  return `
    (function () {
      var label = ${JSON.stringify(label)};
      if (window.__updateLegalEmbedCloseLabel) {
        window.__updateLegalEmbedCloseLabel(label);
        return;
      }

      var button = document.querySelector('[data-legal-embed-close="true"]');
      if (button) {
        button.textContent = label;
      }
    })();
    true;
  `;
}

export function buildLegalWebViewHeaderPatchScript(closeLabel: string): string {
  return `
    (function () {
      var closeLabel = ${JSON.stringify(closeLabel)};
      var closeMessage = ${JSON.stringify(LEGAL_EMBED_CLOSE_MESSAGE)};

      window.__updateLegalEmbedCloseLabel = function (label) {
        var button = document.querySelector('[data-legal-embed-close="true"]');
        if (button) {
          button.textContent = label;
        }
      };

      function postClose() {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(closeMessage);
        }
      }

      function patchBrand() {
        var brandLink = document.querySelector('.app-header__brand');
        if (!brandLink || brandLink.tagName !== 'A' || brandLink.getAttribute('data-legal-embed-brand') === 'true') {
          return;
        }

        var brand = document.createElement('div');
        brand.className = brandLink.className + ' app-header__brand--static';
        brand.setAttribute('data-legal-embed-brand', 'true');
        brand.innerHTML = brandLink.innerHTML;
        brandLink.replaceWith(brand);
      }

      function patchHeader() {
        var nav = document.querySelector('.app-header__nav');
        if (!nav) {
          return false;
        }

        var existingClose = nav.querySelector('[data-legal-embed-close="true"]');
        if (existingClose) {
          existingClose.textContent = closeLabel;
          patchBrand();
          return true;
        }

        var reactCloseButton = nav.querySelector('button.app-header__nav-link--button');
        if (reactCloseButton) {
          patchBrand();
          return true;
        }

        var backLink = nav.querySelector('a.app-header__nav-link--back, a.app-header__nav-link--active');
        if (!backLink) {
          return false;
        }

        var closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.setAttribute('data-legal-embed-close', 'true');
        closeButton.className = backLink.className
          .replace('app-header__nav-link--back', '')
          .trim() + ' app-header__nav-link--button app-header__nav-link--active';
        closeButton.textContent = closeLabel;
        closeButton.addEventListener('click', function (event) {
          event.preventDefault();
          postClose();
        });

        backLink.replaceWith(closeButton);
        patchBrand();
        return true;
      }

      if (patchHeader()) {
        return;
      }

      var observer = new MutationObserver(function () {
        if (patchHeader()) {
          observer.disconnect();
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });
    })();
    true;
  `;
}
