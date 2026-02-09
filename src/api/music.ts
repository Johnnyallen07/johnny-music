import axios from "axios";
import { MusicInfo } from "@/types";

// Updated to reflect music-info.json at the root of the public bucket URL
const MUSIC_INFO_URL = `${process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL}/config/music-info.json`;
const MUSIC_COUNT_URL = `${process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL}/config/music-count.json`;

export const getMusicList = async (): Promise<MusicInfo[]> => {
    // Add timestamp to prevent caching
    const t = new Date().getTime();
    const infoUrl = `${MUSIC_INFO_URL}?t=${t}`;
    const countUrl = `${MUSIC_COUNT_URL}?t=${t}`;

    try {
        const [infoResp, countResp] = await Promise.all([
            axios.get<MusicInfo[]>(infoUrl),
            axios.get<Record<string, number>>(countUrl).catch(() => ({ data: {} })) // Handle missing count file gracefully
        ]);

        if (!infoResp.data) {
            throw new Error("Fetching music info error");
        }

        const countData = (countResp.data || {}) as Record<string, number>;

        return infoResp.data.map((song) => ({
            ...song,
            path: `${process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL}${song.path}`,
            count: countData[song.id] || 0
        }));
    } catch (error) {
        console.error("Error fetching music list:", error);
        return [];
    }
};

export const updateMetadata = async (payload: MusicInfo) => {
    const { data } = await axios.patch("/api/music-metadata", payload);
    return data;
};

export const incrementPlayCount = async (id: string) => {
    const { data } = await axios.post("/api/play-count", { id });
    return data;
};
