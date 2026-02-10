export type Locale = 'en' | 'zh';

export const dictionaries = {
    en: {
        common: {
            searchPlaceholder: "Search songs, artists...",
            welcomeBack: "Welcome Back",
            todaysMusic: "Here's your music for today.",
            allMusic: "All Music",
            noSongsFound: "No songs found.",
            loading: "Loading...",
            theme: "Theme",
            language: "Language",
            download: "Download",
            active_library: "Library",
            play: "Play",
            musicians: "Musicians",
            series: "Series",
            welcome_slogan: "This is today's music recommended for you.",
            title: "Title",
            artist: "Artist",
            performer: "Performer",
            index: "#",
            playCount: "Plays",
            dailyRecommendation: "Daily Recommendation"
        },
        sidebar: {
            menu: "Menu"
        },
        player: {
            // Add player specific dicts if needed
        }
    },
    zh: {
        common: {
            searchPlaceholder: "搜索歌曲、艺术家...",
            welcomeBack: "欢迎回来",
            todaysMusic: "这是为您推荐的今日音乐。",
            allMusic: "所有音乐",
            noSongsFound: "未找到歌曲。",
            loading: "加载中...",
            theme: "主题",
            language: "语言",
            download: "下载",
            active_library: "库",
            play: "播放",
            musicians: "音乐家",
            series: "系列",
            welcome_slogan: "这是为您推荐的今日音乐。",
            title: "标题",
            artist: "艺术家",
            performer: "演奏者",
            index: "序号",
            playCount: "播放次数",
            dailyRecommendation: "每日推荐"
        },
        sidebar: {
            menu: "菜单"
        },
        player: {
            // Add player specific dicts if needed
        }
    }
};

export const getDictionary = (locale: Locale) => dictionaries[locale];
