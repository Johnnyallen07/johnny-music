
import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMusic } from '@johnny/api';
import { SongListItem } from '@/components/SongListItem';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeScreen() {
  const { music, loading, error } = useMusic();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const { t } = useLanguage();

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>{t('common.errorLoadingSongs')}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <ThemedText type="title">{t('common.appName')}</ThemedText>
      </View>

      <FlatList
        data={music}
        keyExtractor={(item) => item.path}
        renderItem={({ item }) => <SongListItem song={item} />}
        contentContainerStyle={styles.listContent}
      />

      <MiniPlayer />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listContent: {
    paddingBottom: 80, // Space for mini player
  },
});
