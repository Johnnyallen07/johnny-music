
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { usePlayer } from '@/context/MobilePlayerContext';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const MiniPlayer = () => {
    const { activeSong, isPlaying, togglePlay, playNext, currentTime, duration } = usePlayer();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    if (!activeSong) return null;

    const progress = duration > 0 ? currentTime / duration : 0;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#222' : '#f0f0f0', borderTopColor: isDark ? '#444' : '#ddd' }]}>
            {/* Simple Progress Bar */}
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progress * 100}%`, backgroundColor: isDark ? '#fff' : '#007AFF' }]} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.infoContainer}>
                    <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>
                        {activeSong.title}
                    </Text>
                    <Text style={[styles.artist, { color: isDark ? '#aaa' : '#666' }]} numberOfLines={1}>
                        {activeSong.artist}
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={togglePlay} style={styles.button}>
                        {isPlaying ?
                            <Pause size={24} color={isDark ? '#fff' : '#000'} /> :
                            <Play size={24} color={isDark ? '#fff' : '#000'} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={playNext} style={styles.button}>
                        <SkipForward size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderTopWidth: 1,
        paddingBottom: Platform.OS === 'ios' ? 20 : 0, // Safe area roughly
    },
    progressBarBackground: {
        height: 2,
        width: '100%',
        backgroundColor: 'transparent',
    },
    progressBarFill: {
        height: 100, // Thick enough? No, height 2 is fine for container
        flex: 1,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
    },
    artist: {
        fontSize: 12,
        marginTop: 2,
    },
    controls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    button: {
        padding: 4,
    }
});
