
import { get, set } from 'idb-keyval';

const DIR_HANDLE_KEY = 'music_dir_handle';

export interface LocalFileStatus {
    isAvailable: boolean;
    file?: File;
    url?: string;
}

/**
 * Persist the directory handle to IndexedDB.
 */
export const setMusicDirectoryHandle = async (handle: FileSystemDirectoryHandle) => {
    await set(DIR_HANDLE_KEY, handle);
};

/**
 * Retrieve the directory handle from IndexedDB.
 */
export const getMusicDirectoryHandle = async (): Promise<FileSystemDirectoryHandle | undefined> => {
    return await get<FileSystemDirectoryHandle>(DIR_HANDLE_KEY);
};

/**
 * Request user to select a directory and store the handle.
 */
export const selectMusicDirectory = async (): Promise<FileSystemDirectoryHandle | null> => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handle = await (window as any).showDirectoryPicker({
            id: 'music_download_dir',
            mode: 'readwrite',
        });
        await setMusicDirectoryHandle(handle);
        return handle;
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((error as any).name === 'AbortError') {
            // User cancelled, ignore
            return null;
        }
        console.error('Error selecting directory:', error);
        return null;
    }
};

/**
 * Verify permission for the handle.
 */
export const verifyPermission = async (handle: FileSystemDirectoryHandle, readWrite: boolean = false) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
        mode: readWrite ? 'readwrite' : 'read',
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((await (handle as any).queryPermission(options)) === 'granted') {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((await (handle as any).requestPermission(options)) === 'granted') {
        return true;
    }
    return false;
};

/**
 * Try to find a file in the directory handle.
 * We try exact items first, then maybe some logic if needed.
 */
export const findLocalMusicFile = async (
    filename: string,
    handle?: FileSystemDirectoryHandle
): Promise<File | null> => {
    if (!handle) {
        handle = await getMusicDirectoryHandle();
        if (!handle) return null;
    }

    // Verify permission first, might prompt user
    const hasPermission = await verifyPermission(handle);
    if (!hasPermission) return null;

    try {
        // Try to get the file handle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileHandle = await (handle as any).getFileHandle(filename);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const file = await (fileHandle as any).getFile();
        return file;
    } catch (error) {
        // File not found or other error
        return null;
    }
};

/**
 * Generate a blob URL for a local file if it exists.
 */
export const getLocalAudioUrl = async (filename: string): Promise<string | null> => {
    // We expect filename to be the full filename including extension (e.g., "song.mp3")

    const file = await findLocalMusicFile(filename);
    if (file) {
        return URL.createObjectURL(file);
    }
    return null;
}

/**
 * Save a file to the local directory handle.
 */
export const saveFileToLocalDir = async (
    blob: Blob,
    filename: string
): Promise<boolean> => {
    const handle = await getMusicDirectoryHandle();
    if (!handle) return false;

    // Verify readwrite permission
    const hasPermission = await verifyPermission(handle, true);
    if (!hasPermission) return false;

    try {
        // Create or Get file handle
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fileHandle = await (handle as any).getFileHandle(filename, { create: true });

        // Create writable stream
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const writable = await (fileHandle as any).createWritable();

        // Write the blob
        await writable.write(blob);

        // Close the file
        await writable.close();

        return true;
    } catch (error) {
        console.error('Error saving file to local dir:', error);
        return false;
    }
};
