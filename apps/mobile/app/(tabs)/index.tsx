

import { StyleSheet, View, FlatList, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMusic } from '@johnny/api';
import { SongListItem } from '@/components/SongListItem';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { music, loading, error } = useMusic();
  const insets = useSafeAreaInsets();

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ThemedText>Error loading songs</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title">Johnny Music</ThemedText>
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
    borderBottomColor: '#ccc',
  },
  listContent: {
    paddingBottom: 80, // Space for mini player
  },
});
