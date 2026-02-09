import axios from "axios";
import { CategoriesConfig } from "@/types";

// Updated to reflect category.json at the root of the public bucket URL
const CATEGORIES_INFO_URL = `${process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL}/config/category.json`;

export const getCategories = async (): Promise<CategoriesConfig> => {
    // Add timestamp to prevent caching
    const url = `${CATEGORIES_INFO_URL}?t=${new Date().getTime()}`;
    const resp = await axios.get<CategoriesConfig | string[]>(url);

    if (!resp.data) {
        throw new Error("Fetching categories info error");
    }

    // Backward compatibility if it returns an array
    if (Array.isArray(resp.data)) {
        return {
            categories: resp.data.map(c => ({ id: c, en: c, zh: c })),
            musicians: [],
            series: []
        };
    }

    return resp.data;
};
