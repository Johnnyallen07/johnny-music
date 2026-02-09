
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { MusicInfo } from '@johnny/api';
import { incrementPlayCount, updateMetadata } from '@johnny/api';

export interface Song extends MusicInfo { }

interface PlayerContextType {
    activeSong: Song | null;
    isPlaying: boolean;
    playlist: Song[];
    isShuffle: boolean;
    isRepeat: boolean;
    currentTime: number;
    duration: number;
    playSong: (song: Song, newPlaylist?: Song[]) => void;
    togglePlay: () => void;
    playNext: () => void;
    playPrev: () => void;
    toggleShuffle: () => void;
    toggleRepeat: () => void;
    seek: (time: number) => void;
    setPlaylist: (songs: Song[]) => void;
    volume: number;
    isMuted: boolean;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
    const [activeSong, setActiveSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playlist, setPlaylist] = useState<Song[]>([]);
    const [currentIndex, setCurrentIndex] = useState(-1);
    const [isShuffle, setIsShuffle] = useState(false);
    const [isRepeat, setIsRepeat] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolumeState] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [hasCounted, setHasCounted] = useState(false);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    // Initial configuration for Expo AV
    useEffect(() => {
        Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });
    }, []);

    const unloadSound = async () => {
        if (sound) {
            await sound.unloadAsync();
            setSound(null);
        }
    };

    const loadAndPlaySound = async (uri: string, shouldPlay: boolean = true) => {
        try {
            await unloadSound();

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay, volume: isMuted ? 0 : volume },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            /* Duration is usually available in status update, but createAsync returns initial status too */
        } catch (error) {
            console.error("Error loading sound:", error);
        }
    };

    const onPlaybackStatusUpdate = (status: any) => {
        if (status.isLoaded) {
            setCurrentTime(status.positionMillis / 1000);
            setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
            setIsPlaying(status.isPlaying);

            if (status.didJustFinish) {
                if (isRepeat) {
                    // Loop
                    // isLooping can be set on sound, or handled manually. Manual give more control.
                    sound?.replayAsync();
                } else {
                    playNext();
                }
            }
        } else {
            if (status.error) {
                console.error(`Encountered a fatal error during playback: ${status.error}`);
            }
        }
    };

    // Active Song Change Effect
    useEffect(() => {
        const playCurrentSong = async () => {
            if (activeSong) {
                await loadAndPlaySound(activeSong.path, true);
            }
        };
        playCurrentSong();
        return () => {
            // Cleanup provided by sound replacement logic primarily, 
            // but strict cleanup could be here if we unmount
        };
    }, [activeSong]);

    // Play/Pause Effect
    useEffect(() => {
        const updatePlayState = async () => {
            if (!sound) return;
            if (isPlaying) {
                await sound.playAsync();
            } else {
                await sound.pauseAsync();
            }
        };
        // This effect is tricky because isPlaying is also set by status update.
        // We probably want togglePlay to trigger this, but status update to SYNC this.
        // Actually, better to have togglePlay call sound directly, and status update sync state.
        // But for consistency with web context structure... 

        // Let's rely on togglePlay calling sound methods, and this effect syncing strictly if out of sync?
        // Or remove this effect and put logic in togglePlay. 
        // Web context used audioRef to sync state.
    }, [isPlaying]); // Be careful of loops

    // Volume Effect
    useEffect(() => {
        if (sound) {
            sound.setVolumeAsync(isMuted ? 0 : volume);
        }
    }, [volume, isMuted, sound]);

    // Handle play count (similar logic to web)
    useEffect(() => {
        if (!activeSong || duration === 0 || hasCounted) return;
        if (currentTime / duration > 0.5) {
            setHasCounted(true);
            if (activeSong.id) {
                incrementPlayCount(activeSong.id).catch(err => console.error(err));
            }
        }
    }, [currentTime, duration, activeSong, hasCounted]);

    // Reset hasCounted
    useEffect(() => {
        setHasCounted(false);
    }, [activeSong]);


    const playSong = async (song: Song, newPlaylist?: Song[]) => {
        if (newPlaylist) {
            setPlaylist(newPlaylist);
            // find index
            const idx = newPlaylist.findIndex(s => s.path === song.path);
            setCurrentIndex(idx);
        } else {
            const idx = playlist.findIndex(s => s.path === song.path);
            if (idx !== -1) setCurrentIndex(idx);
        }
        setActiveSong(song);
        // isPlaying will be set to true by loadAndPlaySound -> status update
    };

    const togglePlay = async () => {
        if (sound) {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                if (status.isPlaying) {
                    await sound.pauseAsync();
                    // State update handled by onPlaybackStatusUpdate
                } else {
                    await sound.playAsync();
                }
            }
        }
    };

    // Next/Prev Logic (same as web basically)
    const getNextIndex = () => {
        if (playlist.length === 0) return -1;
        if (isShuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * playlist.length);
            } while (playlist.length > 1 && nextIndex === currentIndex);
            return nextIndex;
        }
        return (currentIndex + 1) % playlist.length;
    };

    const getPrevIndex = () => {
        if (playlist.length === 0) return -1;
        if (isShuffle) {
            let prevIndex;
            do {
                prevIndex = Math.floor(Math.random() * playlist.length);
            } while (playlist.length > 1 && prevIndex === currentIndex);
            return prevIndex;
        }
        return (currentIndex - 1 + playlist.length) % playlist.length;
    };

    const playNext = () => {
        const next = getNextIndex();
        if (next !== -1) {
            setCurrentIndex(next);
            setActiveSong(playlist[next]);
        }
    };

    const playPrev = () => {
        const prev = getPrevIndex();
        if (prev !== -1) {
            setCurrentIndex(prev);
            setActiveSong(playlist[prev]);
        }
    };

    const toggleShuffle = () => setIsShuffle(!isShuffle);
    const toggleRepeat = () => setIsRepeat(!isRepeat);

    const seek = async (time: number) => {
        if (sound) {
            await sound.setPositionAsync(time * 1000);
            setCurrentTime(time);
        }
    };

    const setVolume = (val: number) => setVolumeState(Math.max(0, Math.min(1, val)));
    const toggleMute = () => setIsMuted(!isMuted);


    return (
        <PlayerContext.Provider value={{
            activeSong, isPlaying, playlist, isShuffle, isRepeat, currentTime, duration,
            playSong, togglePlay, playNext, playPrev, toggleShuffle, toggleRepeat,
            seek, setPlaylist, volume, isMuted, setVolume, toggleMute
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) throw new Error('usePlayer must be used within PlayerProvider');
    return context;
}
