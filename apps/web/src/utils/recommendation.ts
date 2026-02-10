
import { MusicInfo, CategoryItem } from '@johnny/api';

/**
 * A simple seeded pseudo-random number generator.
 * This ensures that for a given seed (the date), we get the same sequence of random numbers.
 */
class SeededRNG {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    // Linear Congruential Generator
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

const calculateScore = (song: MusicInfo, rng: SeededRNG): number => {
    const playCount = song.count || 0;
    // Logarithmic scaling for play count impact
    const popularityScore = Math.log10(playCount + 1);
    // Random factor between 0 and 2. This gives randomness a significant weight.
    // Adjust the multiplier to tune the balance between popularity and randomness.
    // Higher random factor means more variety in recommendations
    const randomFactor = rng.next() * 2;

    return popularityScore + randomFactor;
};

/**
 * Gets a list of recommended songs for the day.
 * 
 * @param songs - The full list of available songs.
 * @param categories - The list of available categories to rotate through.
 * @returns A list of 20 recommended songs.
 */
export const getDailyRecommendation = (songs: MusicInfo[], categories: CategoryItem[]): MusicInfo[] => {
    console.log('getDailyRecommendation called with:', { songsCount: songs.length, categoriesCount: categories.length });
    if (!songs.length || !categories.length) {
        return [];
    }

    // 1. Determine the category based on days since a fixed epoch
    // This ensures a consistent rotation through categories every day
    const today = new Date();
    const epoch = new Date(2024, 0, 1).getTime(); // Jan 1, 2024
    const msPerDay = 24 * 60 * 60 * 1000;
    // Use UTC to avoid timezone issues affecting the "day" boundary if possible, 
    // but client-side it's better to use local time for user expectation
    const daysSinceEpoch = Math.floor((today.getTime() - epoch) / msPerDay);

    // Create a seed based on the date string (YYYY-MM-DD) to ensure consistency within the day
    // Using local date components ensures it stays the same throughout the user's day
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

    // Simple hash of the date string to get an initial seed integer
    let seed = 0;
    for (let i = 0; i < dateString.length; i++) {
        seed = ((seed << 5) - seed) + dateString.charCodeAt(i);
        seed |= 0; // Convert to 32bit integer
    }

    const rng = new SeededRNG(Math.abs(seed));

    const categoryIndex = daysSinceEpoch % categories.length;
    // Use 'en' as the ID for consistency with how categories are stored in music info
    // The 'categories' input from config usually has { id, en, zh }
    // The 'categories' input from config usually has { id, en, zh }
    const targetCategory = categories[categoryIndex];
    console.log('Target Category:', targetCategory);

    if (!targetCategory) return [];

    // 2. Filter songs by this category
    // Make sure we handle both old and new category structures if needed, 
    // but assuming standard structure from MusicInfo type: category, category_zh
    const genreSongs = songs.filter(song =>
        song.category === targetCategory.en || song.category_zh === targetCategory.zh
    );
    console.log('Genre Songs found:', genreSongs.length);

    // If the category has few enough songs, return all of them
    if (genreSongs.length <= 20) {
        return genreSongs;
    }

    // 3. Score and sort songs
    // Format: { song, score }
    const scoredSongs = genreSongs.map(song => ({
        song,
        score: calculateScore(song, rng)
    }));

    // Sort by score descending to get the "best" recommendations at the top
    scoredSongs.sort((a, b) => b.score - a.score);

    // 4. Return top 20
    return scoredSongs.slice(0, 20).map(item => item.song);
};
