import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Modal,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview/lib/WebViewTypes';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  buildLegalWebViewCloseLabelUpdateScript,
  buildLegalWebViewHeaderPatchScript,
  getCloseLabelForLanguage,
  LEGAL_WEBVIEW_EMBED_FLAG_SCRIPT,
} from '@/legal/legalWebViewEmbedScript';
import { parseLegalWebViewMessage } from '@/legal/legalWebViewMessages';
import { getLegalPageUrl, type LegalPage } from '@/legal/openLegalPage';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type LegalWebViewModalProps = {
  page: LegalPage | null;
  onClose: () => void;
};

export default function LegalWebViewModal({ page, onClose }: LegalWebViewModalProps) {
  const { language, setLanguage, t } = useLanguage();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [webSourceUri, setWebSourceUri] = useState<string | null>(null);
  const visible = page !== null;
  const headerPatchScript = buildLegalWebViewHeaderPatchScript(t('common.close'));

  useEffect(() => {
    if (visible && page) {
      setWebSourceUri(getLegalPageUrl(page, language));
      return;
    }

    if (!visible) {
      setWebSourceUri(null);
    }
  }, [visible, page]);

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
        getCloseLabelForLanguage(message.language),
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
        {page && webSourceUri ? (
          <WebView
            ref={webViewRef}
            source={{ uri: webSourceUri }}
            style={styles.webView}
            startInLoadingState
            setSupportMultipleWindows={false}
            injectedJavaScriptBeforeContentLoaded={LEGAL_WEBVIEW_EMBED_FLAG_SCRIPT}
            injectedJavaScript={headerPatchScript}
            onNavigationStateChange={handleNavigationChange}
            onMessage={handleWebViewMessage}
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
});
