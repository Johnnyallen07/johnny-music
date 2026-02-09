import { useQuery } from "@tanstack/react-query";
import { getCategories, getSeriesMap } from "../api/categories";
import { CategoriesConfig } from "../types";

export const useCategories = () => {
  const { data: config, isFetching: configLoading } = useQuery<CategoriesConfig>({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: seriesMap, isFetching: seriesLoading } = useQuery<Record<string, string[]>>({
    queryKey: ["seriesMap"],
    queryFn: getSeriesMap,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    config: config ?? { categories: [], musicians: [], series: [] },
    seriesMap: seriesMap ?? {},
    loading: configLoading || seriesLoading,
  };
};
