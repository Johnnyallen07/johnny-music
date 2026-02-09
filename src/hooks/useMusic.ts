import { useQuery } from "@tanstack/react-query";
import { getMusicList } from "@/api/music";
import { MusicInfo } from "@/types";

const EMPTY_MUSIC_LIST: MusicInfo[] = [];

export const useMusic = () => {
  const { data, error, isFetching } = useQuery<MusicInfo[]>({
    queryKey: ["music"],
    queryFn: getMusicList,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    music: data ?? EMPTY_MUSIC_LIST,
    loading: isFetching,
    error,
  };
};
