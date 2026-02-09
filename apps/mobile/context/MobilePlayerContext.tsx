
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { Audio } from 'expo-av';
import { MusicInfo } from '@johnny/api';
import { incrementPlayCount, updateMetadata } from '@johnny/api';
import { API_CONFIG } from '@johnny/api';

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
    const soundRef = useRef<Audio.Sound | null>(null);

    // Refs to avoid stale closures in onPlaybackStatusUpdate
    const isRepeatRef = useRef(isRepeat);
    const isShuffleRef = useRef(isShuffle);
    const currentIndexRef = useRef(currentIndex);
    const playlistRef = useRef(playlist);

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

    // Keep refs in sync with state
    useEffect(() => {
        isRepeatRef.current = isRepeat;
    }, [isRepeat]);

    useEffect(() => {
        isShuffleRef.current = isShuffle;
    }, [isShuffle]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        playlistRef.current = playlist;
    }, [playlist]);

    const unloadSound = async () => {
        if (sound) {
            await sound.unloadAsync();
            setSound(null);
            soundRef.current = null;
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
            soundRef.current = newSound;
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
                console.log('[Playback] Song finished');
                console.log('[Playback] isRepeat:', isRepeatRef.current);
                console.log('[Playback] isShuffle:', isShuffleRef.current);
                console.log('[Playback] playlist length:', playlistRef.current.length);
                console.log('[Playback] currentIndex:', currentIndexRef.current);

                if (isRepeatRef.current) {
                    // Loop using soundRef to ensure we have the latest sound instance
                    console.log('[Playback] Replaying current song');
                    soundRef.current?.replayAsync();
                } else {
                    // Play next song
                    console.log('[Playback] Playing next song');
                    const nextIndex = getNextIndexFromRefs();
                    console.log('[Playback] Next index calculated:', nextIndex);
                    if (nextIndex !== -1 && playlistRef.current[nextIndex]) {
                        console.log('[Playback] Setting next song:', playlistRef.current[nextIndex].title);
                        setCurrentIndex(nextIndex);
                        setActiveSong(playlistRef.current[nextIndex]);
                    } else {
                        console.log('[Playback] No valid next track found');
                    }
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
        const updateVolume = async () => {
            if (sound) {
                try {
                    const status = await sound.getStatusAsync();
                    if (status.isLoaded) {
                        await sound.setVolumeAsync(isMuted ? 0 : volume);
                    }
                } catch (error) {
                    // Ignore errors if sound is being unloaded
                    if (__DEV__) {
                        console.warn('Failed to set volume:', error);
                    }
                }
            }
        };
        updateVolume();
    }, [volume, isMuted, sound]);

    // Handle play count (similar logic to web)
    // This is best-effort and should not block playback
    useEffect(() => {
        if (!activeSong || duration === 0 || hasCounted) return;
        if (currentTime / duration > 0.5) {
            setHasCounted(true);
            // Only try to increment if we have an API endpoint configured
            if (activeSong.id && API_CONFIG.apiBaseUrl) {
                incrementPlayCount(activeSong.id).catch(err => {
                    // Only log in development, don't throw or alert
                    if (__DEV__) {
                        console.warn('Failed to increment play count:', err.message);
                    }
                });
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

    // Helper function to get next index using refs (for callback context)
    const getNextIndexFromRefs = () => {
        const list = playlistRef.current;
        const index = currentIndexRef.current;
        const shuffle = isShuffleRef.current;

        if (list.length === 0) return -1;
        if (shuffle) {
            let nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * list.length);
            } while (list.length > 1 && nextIndex === index);
            return nextIndex;
        }
        return (index + 1) % list.length;
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
