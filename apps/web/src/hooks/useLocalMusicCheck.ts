import { useState, useEffect, useCallback } from 'react';
import { MusicInfo } from '@johnny/api';
import { getMusicDirectoryHandle } from '@/utils/localFileManager';

export const useLocalMusicCheck = (songs: MusicInfo[]) => {
    const [localSongs, setLocalSongs] = useState<Set<string>>(new Set());

    const checkLocalAvailability = useCallback(async () => {
        const handle = await getMusicDirectoryHandle();
        if (!handle) {
            setLocalSongs(new Set());
            return;
        }

        const newLocalSet = new Set<string>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options: any = { mode: 'read' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((await (handle as any).queryPermission(options)) !== 'granted') {
            return;
        }

        for (const song of songs) {
            const filename = song.path.split('/').pop();
            if (filename) {
                const decodedFilename = decodeURIComponent(filename);
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const fileHandle = await (handle as any).getFileHandle(decodedFilename).catch(() => null);
                    if (fileHandle) {
                        newLocalSet.add(song.path);
                    }
                } catch (e) {
                    // ignore
                }
            }
        }
        setLocalSongs(newLocalSet);
    }, [songs]);

    useEffect(() => {
        checkLocalAvailability();
    }, [checkLocalAvailability]);

    return { localSongs, checkLocalAvailability };
};
