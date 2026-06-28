import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from './src/theme/tokens';
import { validateEnv } from './src/config/env';

type ErrorBoundaryState = {
  hasError: boolean;
  message: string;
};

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unknown runtime error',
    };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error('Luna29 mobile runtime crash:', error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }
    return (
      <View style={styles.errorWrap}>
        <Text style={styles.errorTitle}>Luna29 encountered an issue</Text>
        <Text style={styles.errorText}>Please reload Expo Go once. If this repeats, share this message:</Text>
        <Text style={styles.errorCode}>{this.state.message}</Text>
      </View>
    );
  }
}

export default function App() {
  validateEnv();
  const [bootKey, setBootKey] = useState(0);
  const navLoad = useMemo(() => {
    try {
      // Use runtime require to prevent hard crash if module init fails on device.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Component = require('./src/navigation/AppNavigator').AppNavigator as React.ComponentType;
      return { Component, error: '' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load AppNavigator';
      // eslint-disable-next-line no-console
      console.error('Luna29 mobile boot error:', error);
      return { Component: null, error: message };
    }
  }, [bootKey]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      {navLoad.Component ? (
        <AppErrorBoundary>
          <navLoad.Component />
        </AppErrorBoundary>
      ) : (
        <View style={styles.errorWrap}>
          <Text style={styles.errorTitle}>Luna29 safe boot mode</Text>
          <Text style={styles.errorText}>The app could not load full navigation on this device.</Text>
          {navLoad.error ? <Text style={styles.errorCode}>{navLoad.error}</Text> : null}
          <Pressable onPress={() => setBootKey((v) => v + 1)} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry launch</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
  },
  errorWrap: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 24,
    gap: 10,
    justifyContent: 'center',
    backgroundColor: colors.page,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  errorCode: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.accentStrong,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop: 14,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.accentStrong,
    backgroundColor: colors.accentStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
