import { Component, type ErrorInfo, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { recurringTheme } from '@/pages/recurring-tasks/recurringTheme';

type SubscriptionPanelErrorBoundaryProps = {
  children: ReactNode;
  title: string;
  fallbackMessage: string;
};

type SubscriptionPanelErrorBoundaryState = {
  hasError: boolean;
};

export default class SubscriptionPanelErrorBoundary extends Component<
  SubscriptionPanelErrorBoundaryProps,
  SubscriptionPanelErrorBoundaryState
> {
  state: SubscriptionPanelErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): SubscriptionPanelErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (__DEV__) {
      console.warn('[SubscriptionPanel] render failed — showing fallback UI', error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.title}>{this.props.title}</Text>
          <Text style={styles.message}>{this.props.fallbackMessage}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  fallback: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 14,
    backgroundColor: recurringTheme.surfaceCard,
    borderWidth: 1,
    borderColor: recurringTheme.cardBorder,
  },
  title: {
    color: recurringTheme.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    color: recurringTheme.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
