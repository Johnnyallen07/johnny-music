import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/api/categories";
import { CategoriesConfig } from "@/types";

export const useCategories = () => {
  const { data, error, isFetching } = useQuery<CategoriesConfig>({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    config: data ?? { categories: [], musicians: [], series: [] },
    loading: isFetching,
    error,
  };
};
