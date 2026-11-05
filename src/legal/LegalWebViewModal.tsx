import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { useLanguage } from '@/i18n/LanguageProvider';
import type { TranslationKey } from '@/i18n/locales';
import {
  buildLegalWebViewCloseLabelUpdateScript,
  buildLegalWebViewHeaderPatchScript,
  getCloseLabelForLanguage,
  LEGAL_WEBVIEW_EMBED_FLAG_SCRIPT,
} from '@/legal/legalWebViewEmbedScript';
import { parseLegalWebViewMessage } from '@/legal/legalWebViewMessages';
import {
  getLegalPageUrl,
  getProductionLegalPageUrl,
  type LegalPage,
} from '@/legal/openLegalPage';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type LegalWebViewModalProps = {
  page: LegalPage | null;
  onClose: () => void;
  /** Web legal pages use back-style labels (see privacy.backLogged* in web app). */
  closeLabelKey?: TranslationKey;
};

export default function LegalWebViewModal({
  page,
  onClose,
  closeLabelKey = 'privacy.backLoggedIn',
}: LegalWebViewModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [useProductionAssets, setUseProductionAssets] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const visible = page !== null;
  const closeLabel = t(closeLabelKey);
  const headerPatchScript = buildLegalWebViewHeaderPatchScript(closeLabel);
  const requestedUri = page ? getLegalPageUrl(page, language) : null;
  const productionUri = page ? getProductionLegalPageUrl(page, language) : null;
  const webSourceUri = useProductionAssets ? productionUri : requestedUri;

  useEffect(() => {
    setUseProductionAssets(false);
    setLoadFailed(false);
    setCanGoBack(false);
  }, [page]);

  useEffect(() => {
    if (!visible) {
      return;
    }
    webViewRef.current?.injectJavaScript(
      buildLegalWebViewCloseLabelUpdateScript(closeLabel),
    );
  }, [closeLabel, visible]);

  useEffect(() => {
    if (!visible || Platform.OS !== 'android') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (canGoBack) {
        webViewRef.current?.goBack();
        return true;
      }

      onClose();
      return true;
    });

    return () => {
      subscription.remove();
    };
  }, [canGoBack, onClose, visible]);

  function handleNavigationChange(event: WebViewNavigation) {
    setCanGoBack(event.canGoBack);
  }

  function handleLoadError() {
    if (
      page &&
      !useProductionAssets &&
      requestedUri &&
      productionUri &&
      requestedUri !== productionUri
    ) {
      setUseProductionAssets(true);
      return;
    }

    setLoadFailed(true);
  }

  function handleWebViewMessage(event: { nativeEvent: { data: string } }) {
    const message = parseLegalWebViewMessage(event.nativeEvent.data);
    if (!message) {
      return;
    }

    if (message.type === 'close') {
      onClose();
      return;
    }

    if (message.language !== language) {
      setLanguage(message.language);
    }

    webViewRef.current?.injectJavaScript(
      buildLegalWebViewCloseLabelUpdateScript(
        getCloseLabelForLanguage(message.language, closeLabelKey),
      ),
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {page && webSourceUri && !loadFailed ? (
          <WebView
            key={webSourceUri}
            ref={webViewRef}
            source={{ uri: webSourceUri }}
            style={styles.webView}
            startInLoadingState
            setSupportMultipleWindows={false}
            injectedJavaScriptBeforeContentLoaded={LEGAL_WEBVIEW_EMBED_FLAG_SCRIPT}
            injectedJavaScript={headerPatchScript}
            onNavigationStateChange={handleNavigationChange}
            onMessage={handleWebViewMessage}
            onError={handleLoadError}
            onLoadEnd={() => {
              webViewRef.current?.injectJavaScript(headerPatchScript);
            }}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={recurringTheme.accent} />
              </View>
            )}
          />
        ) : null}

        {loadFailed ? (
          <View style={styles.errorPanel}>
            <Text style={styles.errorText}>{t('legal.webview.loadError')}</Text>
            <Pressable
              style={styles.errorCloseButton}
              accessibilityRole="button"
              onPress={onClose}
            >
              <Text style={styles.errorCloseText}>{closeLabel}</Text>
            </Pressable>
          </View>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webView: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  errorPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  errorText: {
    color: recurringTheme.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  errorCloseButton: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: recurringTheme.accent,
  },
  errorCloseText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
