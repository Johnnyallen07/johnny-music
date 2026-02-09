import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setApiConfig } from '@johnny/api';
import { useEffect } from 'react';
import { PlayerProvider } from '@/context/MobilePlayerContext';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    setApiConfig({
      bucketUrl: process.env.EXPO_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL || '',
      apiBaseUrl: '', // Mobile might need absolute URL for API routes if targeting Next.js backend
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PlayerProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </PlayerProvider>
    </QueryClientProvider>
  );
}
