import {
    Music,
    Music2,
    Music4,
    Mic2,
    Guitar,
    Disc3,
    Disc2,
    FileMusic,
    ListMusic,
    Users,
    AudioLines
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { MusicInfo } from '@/types';

export const getCategoryIcon = (category: string): LucideIcon => {
    const lower = category.toLowerCase();

    // Specific Combinations first
    if (lower.includes('duet') || lower.includes('couple') || lower.includes('collabor') || lower.includes('+')) return Users;

    // Piano
    if (lower.includes('piano') || lower.includes('钢琴')) {
        if (lower.includes('concerto') || lower.includes('协奏')) return Disc2; // Piano Concerto -> Disc (Orchestral)
        if (lower.includes('trio') || lower.includes('quartet') || lower.includes('quintet')) return Users; // Chamber
        return Music4; // Piano Solo / Generic Piano -> Music4
    }

    // Violin
    if (lower.includes('violin') || lower.includes('小提琴')) {
        if (lower.includes('concerto') || lower.includes('协奏')) return AudioLines; // Violin Concerto -> AudioLines (Complex)
        return Music; // Violin Solo -> Music (Single note)
    }

    // Cello
    if (lower.includes('cello') || lower.includes('大提琴')) {
        if (lower.includes('concerto') || lower.includes('协奏')) return AudioLines;
        return Music;
    }

    // Large Works
    if (lower.includes('symphony') || lower.includes('交响')) return Disc3;
    if (lower.includes('concerto') || lower.includes('协奏')) return Disc2; // Generic Concerto

    // Forms
    if (lower.includes('sonata') || lower.includes('奏鸣')) return FileMusic;
    if (lower.includes('chamber') || lower.includes('室内')) return Users;
    if (lower.includes('opera') || lower.includes('歌剧') || lower.includes('vocal') || lower.includes('声乐')) return Mic2;

    // Guitar
    if (lower.includes('guitar') || lower.includes('吉他')) return Guitar;

    // General
    if (lower.includes('all music') || lower.includes('所有音乐')) return ListMusic;

    return Music2; // Default
};

export const getSongIcon = (song: MusicInfo): LucideIcon => {
    // Use category + title for better matching
    const category = (song.category || '').toLowerCase();
    const title = (song.title || '').toLowerCase();
    const combined = `${category} ${title}`;

    if (combined.includes('duet') || combined.includes('+')) return Users;

    if (combined.includes('piano') || combined.includes('钢琴')) {
        if (combined.includes('concerto') || combined.includes('协奏')) return Disc2;
        return Music4;
    }

    if (combined.includes('violin') || combined.includes('小提琴')) {
        if (combined.includes('concerto') || combined.includes('协奏')) return AudioLines;
        return Music;
    }

    if (combined.includes('cello') || combined.includes('大提琴')) {
        if (combined.includes('concerto') || combined.includes('协奏')) return AudioLines;
        return Music;
    }

    if (combined.includes('symphony') || combined.includes('交响')) return Disc3;
    if (combined.includes('concerto') || combined.includes('协奏')) return Disc2;
    if (combined.includes('sonata') || combined.includes('奏鸣')) return FileMusic;
    if (combined.includes('guitar') || combined.includes('吉他')) return Guitar;
    if (combined.includes('opera') || combined.includes('歌剧') || combined.includes('vocal') || combined.includes('声乐')) return Mic2;

    return Music2;
};
