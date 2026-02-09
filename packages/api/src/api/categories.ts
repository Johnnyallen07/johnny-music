import axios from "axios";
import { CategoriesConfig } from "../types";

// Updated to reflect category.json at the root of the public bucket URL
import { API_CONFIG } from "../config";

const getCategoriesInfoUrl = () => `${API_CONFIG.bucketUrl}/config/category.json`;

export const getCategories = async (): Promise<CategoriesConfig> => {
    // Add timestamp to prevent caching
    const url = `${getCategoriesInfoUrl()}?t=${new Date().getTime()}`;
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

// New function to fetch series mapping
const getSeriesMapUrl = () => `${API_CONFIG.bucketUrl}/config/music-series.json`;

export const getSeriesMap = async (): Promise<Record<string, string[]>> => {
    // Add timestamp to prevent caching
    const url = `${getSeriesMapUrl()}?t=${new Date().getTime()}`;
    const resp = await axios.get<Record<string, string[]>>(url);

    if (!resp.data) {
        // Return empty object if failed, to avoid breaking the app
        console.error("Fetching series map error");
        return {};
    }

    return resp.data;
};
