
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { usePlayer } from '@/context/MobilePlayerContext';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useLanguage } from '@/context/LanguageContext';

export const MiniPlayer = () => {
    const { activeSong, isPlaying, togglePlay, playNext, currentTime, duration } = usePlayer();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { language } = useLanguage();

    if (!activeSong) return null;

    const progress = duration > 0 ? currentTime / duration : 0;
    const title = language === 'zh' ? (activeSong.title_zh || activeSong.title) : activeSong.title;
    const artist = language === 'zh' ? (activeSong.artist_zh || activeSong.artist) : activeSong.artist;

    const handlePress = () => {
        router.push('/modal'); // Open Full Player
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.9}
            style={[
                styles.container,
                {
                    backgroundColor: theme.card,
                    borderTopColor: theme.border
                }
            ]}
        >
            {/* Simple Progress Bar */}
            <View style={styles.progressBarBackground}>
                <View style={[
                    styles.progressBarFill,
                    {
                        width: `${progress * 100}%`,
                        backgroundColor: theme.tint
                    }
                ]} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.infoContainer}>
                    <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
                        {title}
                    </Text>
                    <Text style={[styles.artist, { color: theme.secondaryText }]} numberOfLines={1}>
                        {artist}
                    </Text>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); togglePlay(); }} style={styles.button}>
                        {isPlaying ?
                            <Pause size={24} stroke={theme.text} /> :
                            <Play size={24} stroke={theme.text} />
                        }
                    </TouchableOpacity>
                    <TouchableOpacity onPress={(e) => { e.stopPropagation(); playNext(); }} style={styles.button}>
                        <SkipForward size={24} stroke={theme.text} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
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
