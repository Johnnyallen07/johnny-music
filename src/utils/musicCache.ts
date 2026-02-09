export const CACHE_NAME = 'music-cache-v1';

export const checkCached = async (url: string): Promise<boolean> => {
    if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        const match = await cache.match(url);
        return !!match;
    }
    return false;
};

export const cacheMusic = async (url: string): Promise<void> => {
    if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        await cache.add(url);
    }
};

export const getCachedUrl = async (url: string): Promise<string | null> => {
    if ('caches' in window) {
        const cache = await caches.open(CACHE_NAME);
        const response = await cache.match(url);
        if (response) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }
    }
    return null;
};
