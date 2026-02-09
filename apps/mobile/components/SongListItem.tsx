
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MusicInfo } from '@johnny/api';
import { getSongIcon } from '@/utils/iconMapping';
import { usePlayer } from '@/context/MobilePlayerContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SongListItemProps {
    song: MusicInfo;
}

export const SongListItem: React.FC<SongListItemProps> = ({ song }) => {
    const { playSong, activeSong } = usePlayer();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const Icon = getSongIcon(song);
    const isActive = activeSong?.path === song.path;

    return (
        <TouchableOpacity
            style={[styles.container, isActive && { backgroundColor: isDark ? '#333' : '#e0e0e0' }]}
            onPress={() => playSong(song)}
        >
            <View style={styles.iconContainer}>
                <Icon size={24} color={isDark ? '#fff' : '#000'} />
            </View>
            <View style={styles.infoContainer}>
                <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]} numberOfLines={1}>{song.title}</Text>
                <Text style={[styles.artist, { color: isDark ? '#aaa' : '#666' }]} numberOfLines={1}>{song.artist}</Text>
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
        borderBottomColor: '#ccc',
    },
    iconContainer: {
        width: 40,
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
