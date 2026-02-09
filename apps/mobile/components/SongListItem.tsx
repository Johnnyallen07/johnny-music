
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MusicInfo } from '@johnny/api';
import { getCategoryIcon } from '@/utils/iconMapping';
import { usePlayer } from '@/context/MobilePlayerContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useLanguage } from '@/context/LanguageContext';

interface SongListItemProps {
    song: MusicInfo;
    playlist?: MusicInfo[]; // The full playlist for sequential/shuffle playback
}

export const SongListItem: React.FC<SongListItemProps> = ({ song, playlist }) => {
    const { playSong, activeSong } = usePlayer();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const { language } = useLanguage();

    const Icon = getCategoryIcon(song.category || '');
    const isActive = activeSong?.path === song.path;

    const title = language === 'zh' ? (song.title_zh || song.title) : song.title;
    const artist = language === 'zh' ? (song.artist_zh || song.artist) : song.artist;

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { borderBottomColor: theme.border },
                isActive && { backgroundColor: theme.card }
            ]}
            onPress={() => playSong(song, playlist)}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.sectionBackground }]}>
                <Icon size={20} stroke={theme.tint} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{title}</Text>
                <Text style={[styles.artist, { color: theme.secondaryText }]} numberOfLines={1}>{artist}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '500',
    },
    artist: {
        fontSize: 14,
        marginTop: 4,
    },
});
