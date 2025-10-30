import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the Category interface to match the structure needed in page.tsx
interface Category {
  id: string;
  name: string;
}

const CATEGORIES_INFO_URL = `${process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL}/config/category.json`;

export const useCategories = () => {
  const { data, error, isFetching } = useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const resp = await axios.get<string[]>(CATEGORIES_INFO_URL);

      if (!resp.data) {
        throw new Error("Fetching categories info error");
      }
      return resp.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Transform the array of strings into an array of Category objects
  const categories: Category[] = (data ?? []).map(catName => ({
    id: catName,
    name: catName,
  }));

  return {
    categories,
    loading: isFetching,
    error,
  };
};
