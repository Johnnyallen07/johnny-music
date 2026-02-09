export interface MusicInfo {
    title: string;
    artist: string;
    category: string;
    path: string;
    title_zh?: string;
    artist_zh?: string;
    category_zh?: string;
    series?: string;
    series_zh?: string;
    performer?: string;
    id: string;
    count?: number; // Merged from music-count.json
}

export interface CategoryItem {
    id: string;
    en: string;
    zh: string;
}

export interface CategoriesConfig {
    categories: CategoryItem[];
    musicians: CategoryItem[];
    series: CategoryItem[];
}

export type SeriesMap = Record<string, string[]>;

export interface PresignedUrlPayload {
    name: string;
    type: string;
}

export interface PresignedUrlResponse {
    success: boolean;
    url: string;
    path: string;
}
