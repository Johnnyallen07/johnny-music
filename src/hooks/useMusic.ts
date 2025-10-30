import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface MusicInfo {
    title: string;
    artist: string;
    category: string;
    path: string;
}

// Updated to reflect music-info.json at the root of the public bucket URL
const MUSIC_INFO_URL = `${process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL}/config/music-info.json`;

export const useMusic = () => {
  const { data, error, isFetching } = useQuery<MusicInfo[]>({
    queryKey: ["music"],
    queryFn: async () => {
      const resp = await axios.get<MusicInfo[]>(MUSIC_INFO_URL);

      if (!resp.data) {
        throw new Error("Fetching music info error");
      }
      return resp.data.map(song => ({
        ...song,
        path: `${process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL}${song.path}`
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    music: data ?? [],
    loading: isFetching,
    error,
  };
};
