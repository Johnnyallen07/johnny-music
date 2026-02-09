export type Locale = 'en' | 'zh';

export const dictionaries = {
    en: {
        common: {
            appName: "Johnny Music",
            loading: "Loading...",
            errorLoadingSongs: "Error loading songs",
            noSongsFound: "No songs found",
            active_library: "Library",
            allMusic: "All Music",
            musicians: "Musicians",
            series: "Series",
            title: "Title",
            artist: "Artist",
            performer: "Performer",
            category: "Category",
            playCount: "Play Count",
            plays: "plays",
        },
        library: {
            noSongsInCategory: "No songs found for this category.",
            category: "Category",
        },
        player: {
            nowPlaying: "Now Playing",
            songDetails: "Song Details",
            noSongPlaying: "No song playing",
            dateAdded: "Date Added",
            fileType: "File Type",
        },
        settings: {
            settings: "Settings",
            appearance: "Appearance",
            darkMode: "Dark Mode",
            darkModeHint: "Switch between Dark and Light mode.",
            language: "Language",
            comingSoon: "Coming Soon",
            english: "English",
            chinese: "中文",
        }
    },
    zh: {
        common: {
            appName: "Johnny 音乐",
            loading: "加载中...",
            errorLoadingSongs: "加载歌曲失败",
            noSongsFound: "未找到歌曲",
            active_library: "库",
            allMusic: "所有音乐",
            musicians: "音乐家",
            series: "系列",
            title: "标题",
            artist: "艺术家",
            performer: "演奏者",
            category: "分类",
            playCount: "播放次数",
            plays: "次播放",
        },
        library: {
            noSongsInCategory: "此分类中未找到歌曲。",
            category: "分类",
        },
        player: {
            nowPlaying: "正在播放",
            songDetails: "歌曲详情",
            noSongPlaying: "没有正在播放的歌曲",
            dateAdded: "添加日期",
            fileType: "文件类型",
        },
        settings: {
            settings: "设置",
            appearance: "外观",
            darkMode: "深色模式",
            darkModeHint: "在深色和浅色模式之间切换。",
            language: "语言",
            comingSoon: "即将推出",
            english: "English",
            chinese: "中文",
        }
    }
};

export const getDictionary = (locale: Locale) => dictionaries[locale];
