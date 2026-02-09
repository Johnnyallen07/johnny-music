
import React, { useEffect } from 'react';
import { StyleSheet, FlatList, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useMusic } from '@johnny/api';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SongListItem } from '@/components/SongListItem';
import { MiniPlayer } from '@/components/MiniPlayer';
import { useLanguage } from '@/context/LanguageContext';

export default function CategoryScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
    const navigation = useNavigation();
    const { music, loading } = useMusic();
    const { t } = useLanguage();

    useEffect(() => {
        if (name) {
            navigation.setOptions({ title: name });
        } else {
            navigation.setOptions({ title: id });
        }
    }, [name, id, navigation]);

    if (loading) {
        return (
            <ThemedView style={[styles.container, styles.centered]}>
                <ActivityIndicator size="large" />
            </ThemedView>
        );
    }

    // Filter music based on ID
    // ID could be a Category ID, Musician ID, or 'All Music'
    const filteredMusic = music.filter(song => {
        if (id === 'All Music') return true;

        // Exact match check (simplify for now, can be improved with regex if needed)
        // Check Category
        if (song.category === id) return true;

        // Check Musician (Artist)
        if (song.artist === id) return true;

        // Check Series
        if (song.series === id) return true;

        return false;
    });

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={filteredMusic}
                keyExtractor={(item) => item.path}
                renderItem={({ item }) => <SongListItem song={item} playlist={filteredMusic} />}
                contentContainerStyle={styles.content}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <ThemedText>{t('library.noSongsInCategory')}</ThemedText>
                    </View>
                }
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
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    content: {
        paddingBottom: 100, // Space for MiniPlayer
    },
});
