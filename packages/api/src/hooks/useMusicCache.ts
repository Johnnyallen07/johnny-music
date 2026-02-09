import { useState, useEffect } from 'react';
import { checkCached, cacheMusic } from '../utils/musicCache';
import { MusicInfo } from "../types";

export const useMusicCache = (songs: MusicInfo[]) => {
    const [cachedSongs, setCachedSongs] = useState<Set<string>>(new Set());

    useEffect(() => {
        const checkCacheStatus = async () => {
            const newCachedSet = new Set<string>();
            for (const song of songs) {
                const isCached = await checkCached(song.path);
                if (isCached) {
                    newCachedSet.add(song.path);
                }
            }
            setCachedSongs(newCachedSet);
        };

        checkCacheStatus();
    }, [songs]); // Re-run when songs list changes

    const cacheSong = async (song: MusicInfo) => {
        try {
            await cacheMusic(song.path);
            setCachedSongs(prev => new Set(prev).add(song.path));
        } catch (error) {
            console.error("Failed to cache song:", error);
        }
    };

    return { cachedSongs, cacheSong };
};
