import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useColorScheme,
  Appearance,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';

// ─── Constants ───────────────────────────────────────────────────────────
const STORAGE_KEY = '@homelabarr_server';
const API_KEY_STORAGE = '@homelabarr_apikey';

// ─── Theme ───────────────────────────────────────────────────────────────
const themes = {
  dark: {
    bg: '#0a0a1a',
    card: '#1a1a2e',
    cardBorder: '#2a2a4e',
    primary: '#6366f1',
    primaryGradientEnd: '#818cf8',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    input: '#1e1e3a',
    inputBorder: '#3a3a5e',
    error: '#ef4444',
    success: '#22c55e',
    statusBar: 'light' as const,
  },
  light: {
    bg: '#f8fafc',
    card: '#ffffff',
    cardBorder: '#e2e8f0',
    primary: '#4f46e5',
    primaryGradientEnd: '#6366f1',
    text: '#0f172a',
    textSecondary: '#64748b',
    input: '#f1f5f9',
    inputBorder: '#cbd5e1',
    error: '#dc2626',
    success: '#16a34a',
    statusBar: 'dark' as const,
  },
};

// ─── Setup Screen ────────────────────────────────────────────────────────
function SetupScreen({
  onConnect,
  theme,
}: {
  onConnect: (url: string, apiKey: string) => void;
  theme: typeof themes.dark;
}) {
  const [serverUrl, setServerUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');

  const testAndConnect = async () => {
    let url = serverUrl.trim();
    if (!url) {
      setError('Please enter your server URL');
      return;
    }

    // Normalize URL
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    url = url.replace(/\/+$/, '');

    setTesting(true);
    setError('');

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey.trim()) {
        headers['X-API-Key'] = apiKey.trim();
      }

      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onConnect(url, apiKey.trim());
      } else if (response.status === 401 || response.status === 403) {
        setError('Authentication failed. Check your API key.');
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } else {
        // Server responded but health endpoint might not exist — still usable
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onConnect(url, apiKey.trim());
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        setError('Connection timed out. Check the URL and try again.');
      } else {
        // Network error but URL might still be valid (CORS, etc.)
        // Let the user connect anyway
        Alert.alert(
          'Connection Warning',
          'Could not verify the server. Connect anyway?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Connect',
              onPress: () => onConnect(url, apiKey.trim()),
            },
          ]
        );
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } finally {
      setTesting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.setupContainer}
      >
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🐙</Text>
          <Text style={[styles.title, { color: theme.text }]}>HomelabARR</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Mobile Companion
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>
            Server URL
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="https://homelabarr.example.com"
            placeholderTextColor={theme.textSecondary}
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="next"
          />

          <Text style={[styles.label, { color: theme.textSecondary, marginTop: 16 }]}>
            API Key (optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.input,
                borderColor: theme.inputBorder,
                color: theme.text,
              },
            ]}
            placeholder="Your API key"
            placeholderTextColor={theme.textSecondary}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            returnKeyType="go"
            onSubmitEditing={testAndConnect}
          />

          {error ? (
            <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
          ) : null}

          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: theme.primary }]}
            onPress={testAndConnect}
            disabled={testing}
            activeOpacity={0.8}
          >
            {testing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.connectButtonText}>Connect</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Enter the URL of your HomelabARR CE instance.{'\n'}
          Supports local IPs, Tailscale, and public domains.
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────
export default function App() {
  const systemScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<'dark' | 'light'>(
    systemScheme === 'light' ? 'light' : 'dark'
  );
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [webViewError, setWebViewError] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const theme = themes[colorScheme] as typeof themes.dark;

  // Listen for system theme changes
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      if (newScheme === 'light' || newScheme === 'dark') setColorScheme(newScheme);
    });
    return () => sub.remove();
  }, []);

  // Load saved server on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedUrl, savedKey] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(API_KEY_STORAGE),
        ]);
        if (savedUrl) {
          setServerUrl(savedUrl);
          setApiKey(savedKey || '');
        }
      } catch {} finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleConnect = useCallback(async (url: string, key: string) => {
    await AsyncStorage.setItem(STORAGE_KEY, url);
    await AsyncStorage.setItem(API_KEY_STORAGE, key);
    setServerUrl(url);
    setApiKey(key);
  }, []);

  const handleDisconnect = useCallback(async () => {
    Alert.alert(
      'Disconnect',
      'Remove this server and return to setup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([STORAGE_KEY, API_KEY_STORAGE]);
            setServerUrl(null);
            setApiKey('');
            setWebViewError(false);
          },
        },
      ]
    );
  }, []);

  const handleRefresh = useCallback(() => {
    setWebViewError(false);
    webViewRef.current?.reload();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Inject API key header and theme preference
  const injectedJS = `
    (function() {
      // Store API key for fetch intercepting
      window.__HOMELABARR_API_KEY = ${JSON.stringify(apiKey)};
      
      // Try to match mobile theme with app theme
      const prefersDark = ${colorScheme === 'dark'};
      const themeToggle = document.querySelector('[data-theme-toggle]') || 
                          document.querySelector('button[title*="theme"]') ||
                          document.querySelector('button[title*="Theme"]');
      if (themeToggle) {
        const currentIsDark = document.documentElement.classList.contains('dark') ||
                              document.body.classList.contains('dark');
        if (prefersDark !== currentIsDark) {
          themeToggle.click();
        }
      }
      
      // Add mobile-specific viewport meta if missing
      if (!document.querySelector('meta[name="viewport"]')) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
        document.head.appendChild(meta);
      }
      
      true;
    })();
  `;

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.bg }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!serverUrl) {
    return (
      <>
        <StatusBar style={theme.statusBar} />
        <SetupScreen onConnect={handleConnect} theme={theme} />
      </>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={theme.statusBar} />

      {/* Header bar */}
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.cardBorder }]}>
        {canGoBack ? (
          <TouchableOpacity onPress={() => webViewRef.current?.goBack()} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerButton} />
        )}

        <TouchableOpacity onPress={handleRefresh} style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            🐙 HomelabARR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDisconnect} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: theme.textSecondary }]}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* WebView */}
      {webViewError ? (
        <View style={[styles.container, styles.center, { backgroundColor: theme.bg }]}>
          <Text style={[styles.errorEmoji]}>🔌</Text>
          <Text style={[styles.errorTitle, { color: theme.text }]}>
            Can't reach server
          </Text>
          <Text style={[styles.errorMessage, { color: theme.textSecondary }]}>
            {serverUrl}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={handleRefresh}
          >
            <Text style={styles.connectButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.disconnectLink]}
            onPress={handleDisconnect}
          >
            <Text style={[styles.disconnectLinkText, { color: theme.textSecondary }]}>
              Change Server
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: serverUrl }}
          style={{ flex: 1, backgroundColor: theme.bg }}
          injectedJavaScript={injectedJS}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
          }}
          onError={() => setWebViewError(true)}
          onHttpError={(syntheticEvent) => {
            const { statusCode } = syntheticEvent.nativeEvent;
            if (statusCode >= 500) setWebViewError(true);
          }}
          pullToRefreshEnabled={true}
          allowsBackForwardNavigationGestures={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={[styles.loadingOverlay, { backgroundColor: theme.bg }]}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Connecting to server...
              </Text>
            </View>
          )}
          onShouldStartLoadWithRequest={(request) => {
            // Open external links in system browser
            if (
              request.url.startsWith(serverUrl) ||
              request.url.startsWith('about:') ||
              request.url === 'about:blank'
            ) {
              return true;
            }
            Linking.openURL(request.url);
            return false;
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  connectButton: {
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },

  // Error state
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    marginBottom: 24,
  },
  retryButton: {
    height: 44,
    paddingHorizontal: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  disconnectLink: {
    padding: 12,
  },
  disconnectLinkText: {
    fontSize: 14,
  },

  // Loading
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
});
