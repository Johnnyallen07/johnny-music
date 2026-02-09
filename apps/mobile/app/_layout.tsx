import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setApiConfig } from '@johnny/api';
import { PlayerProvider } from '@/context/MobilePlayerContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { LanguageProvider } from '@/context/LanguageContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

setApiConfig({
  bucketUrl: process.env.EXPO_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL || 'https://pub-5aaf5c7e890140ef9a862fd8ba4860ef.r2.dev',
  apiBaseUrl: '', // Mobile might need absolute URL for API routes if targeting Next.js backend
});

function RootLayoutNav() {
  const { theme } = useTheme();

  return (
    <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen
          name="library/[id]"
          options={{
            title: '',
            headerBackTitle: 'Back',
            headerShown: true
          }}
        />
      </Stack>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <PlayerProvider>
            <RootLayoutNav />
          </PlayerProvider>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
