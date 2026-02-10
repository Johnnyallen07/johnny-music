'use client';

import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';

import { MusicInfo } from '@johnny/api';
import { updateMetadata, incrementPlayCount } from '@johnny/api';

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

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const audio = audioRef.current;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);
        // We will handle 'ended' in the separate useEffect via stateRef to access latest state

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
        }
    }, []);

    // Sync isPlaying state with audio element
    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Play error:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying]);

    // Sync activeSong with audio element
    useEffect(() => {
        const setAudioSrc = async () => {
            if (audioRef.current && activeSong) {
                let src = activeSong.path;

                // 1. Check Local File System first
                // Use the filename from the path
                const filename = activeSong.path.split('/').pop();
                if (filename) {
                    const { getLocalAudioUrl } = await import('@/utils/localFileManager');
                    const decodedFilename = decodeURIComponent(filename);
                    const localUrl = await getLocalAudioUrl(decodedFilename);

                    if (localUrl) {
                        src = localUrl;
                        console.log("Playing from local file system:", src);
                    } else {
                        // 2. Fallback to Service Worker Cache
                        const { getCachedUrl } = await import('@johnny/api');
                        const cachedUrl = await getCachedUrl(activeSong.path);

                        if (cachedUrl) {
                            src = cachedUrl;
                            console.log("Playing from cache:", src);
                        }
                    }
                } else {
                    // Fallback to Service Worker Cache if no filename extraction
                    const { getCachedUrl } = await import('@johnny/api');
                    const cachedUrl = await getCachedUrl(activeSong.path);

                    if (cachedUrl) {
                        src = cachedUrl;
                        console.log("Playing from cache:", src);
                    }
                }

                if (audioRef.current.src !== src && audioRef.current.src !== window.location.origin + src) { // Check both relative/absolute match loosely
                    // Note: blob URLs are unique so strict check is fine, but for initial path...
                    // Actually, if we switch from cloud URL to blob URL, it should update.

                    // Check if current src is already the resolved one to avoid double set
                    if (audioRef.current.src !== src) {
                        audioRef.current.src = src;
                        if (isPlaying) audioRef.current.play();
                    }
                } else {
                    if (isPlaying) audioRef.current.play();
                }
            }
        };

        setAudioSrc();
    }, [activeSong, isPlaying]);

    // Reset hasCounted when activeSong changes
    useEffect(() => {
        setHasCounted(false);
    }, [activeSong]);

    // Handle play count
    useEffect(() => {
        if (!activeSong || duration === 0 || hasCounted) return;

        if (currentTime / duration > 0.5) {
            setHasCounted(true);

            if (activeSong.id) {
                incrementPlayCount(activeSong.id).catch(err => {
                    console.error("Failed to update play count:", err);
                });
            } else {
                console.warn("Song has no ID, skipping play count update:", activeSong.title);
            }
        }
    }, [currentTime, duration, activeSong, hasCounted]);

    // Sync volume and mute with audio element
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    // State Ref to allow event listener to access latest state without re-binding
    const stateRef = useRef({ isRepeat, isShuffle, playlist, currentIndex });
    useEffect(() => {
        stateRef.current = { isRepeat, isShuffle, playlist, currentIndex };
    }, [isRepeat, isShuffle, playlist, currentIndex]);

    // Handle 'ended' event
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            const { isRepeat, isShuffle, playlist, currentIndex } = stateRef.current;
            if (isRepeat) {
                audio.currentTime = 0;
                audio.play();
            } else {
                if (playlist.length === 0) return;

                let nextIndex = (currentIndex + 1);

                if (isShuffle) {
                    // Logic to find random next index
                    let attempts = 0;
                    do {
                        nextIndex = Math.floor(Math.random() * playlist.length);
                        attempts++;
                    } while (playlist.length > 1 && nextIndex === currentIndex && attempts < 10);
                } else if (nextIndex >= playlist.length) {
                    nextIndex = 0; // Loop back to start
                }

                // We calculate next song but we need to update state
                // Since we can't call playSong directly easily without causing excessive re-renders/dep loops if we put it in ref,
                // we'll just set state similar to playNext logic.

                // Duplicate logic from playNext somewhat but safe here
                // To be DRY, we could move playNext/playPrev logic to be pure functions dependent on state
                // But for now, inline calculation is fine.

                // IMPORTANT: We must update currentIndex and activeSong
                // This will trigger re-renders that update the Player
                // and the other useEffect will ensure audio syncs (activeSong change -> src change)

                // Wait, if we just update state, activeSong effect will trigger.
                // If playlist is same, we just change index and song.

                const nextSong = playlist[nextIndex];
                if (nextSong) {
                    setCurrentIndex(nextIndex);
                    setActiveSong(nextSong);
                    setIsPlaying(true);
                }
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    const playSong = (song: Song, newPlaylist?: Song[]) => {
        if (newPlaylist) {
            setPlaylist(newPlaylist);
            const index = newPlaylist.findIndex(s => s.path === song.path);
            setCurrentIndex(index);
        } else {
            const index = playlist.findIndex(s => s.path === song.path);
            if (index !== -1) setCurrentIndex(index);
        }
        setActiveSong(song);
        setIsPlaying(true);
    };

    const togglePlay = () => setIsPlaying(!isPlaying);

    const getNextIndex = () => {
        if (playlist.length === 0) return -1;
        if (isShuffle) {
            let nextIndex;
            let attempts = 0;
            do {
                nextIndex = Math.floor(Math.random() * playlist.length);
                attempts++;
            } while (playlist.length > 1 && nextIndex === currentIndex && attempts < 10);
            return nextIndex;
        }
        return (currentIndex + 1) % playlist.length;
    };

    const getPrevIndex = () => {
        if (playlist.length === 0) return -1;
        if (isShuffle) {
            let prevIndex;
            let attempts = 0;
            do {
                prevIndex = Math.floor(Math.random() * playlist.length);
                attempts++;
            } while (playlist.length > 1 && prevIndex === currentIndex && attempts < 10);
            return prevIndex;
        }
        return (currentIndex - 1 + playlist.length) % playlist.length;
    };

    const playNext = () => {
        const nextIndex = getNextIndex();
        if (nextIndex !== -1) {
            setCurrentIndex(nextIndex);
            setActiveSong(playlist[nextIndex]);
            setIsPlaying(true);
        }
    };

    const playPrev = () => {
        const prevIndex = getPrevIndex();
        if (prevIndex !== -1) {
            setCurrentIndex(prevIndex);
            setActiveSong(playlist[prevIndex]);
            setIsPlaying(true);
        }
    };

    const toggleShuffle = () => setIsShuffle(!isShuffle);
    const toggleRepeat = () => setIsRepeat(!isRepeat);

    const seek = (time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const setVolume = (value: number) => {
        const newVolume = Math.max(0, Math.min(1, value));
        setVolumeState(newVolume);
        if (newVolume > 0 && isMuted) setIsMuted(false);
    };

    const toggleMute = () => setIsMuted(!isMuted);



    return (
        <PlayerContext.Provider value={{
            activeSong,
            isPlaying,
            playlist,
            isShuffle,
            isRepeat,
            currentTime,
            duration,
            playSong,
            togglePlay,
            playNext,
            playPrev,
            toggleShuffle,
            toggleRepeat,
            seek,
            setPlaylist,
            volume,
            isMuted,
            setVolume,
            toggleMute
        }}>
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
