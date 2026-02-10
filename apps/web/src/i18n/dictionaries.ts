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
            dailyRecommendation: "Daily Recommendation",
            settings: "Settings",
            downloadLocation: "Download Location",
            downloadDesc: "Select a local folder to prioritize playing downloaded music.",
            defaultFolder: "Default Browser Downloads",
            customFolderSet: "Custom folder active",
            change: "Change",
            localFileNote: "To play offline music, please select the folder where you save your downloads.",
            downloadSuccess: "Download Successful",
            fileSavedTo: "File saved to:",
            dontShowAgain: "Don't show this again",
            gotIt: "Got it",
            rescan: "Rescan",
            rescanDesc: "Check for changes in your local folder (e.g. deleted files).",
            scanning: "Scanning..."
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
            dailyRecommendation: "每日推荐",
            settings: "设置",
            downloadLocation: "下载位置",
            downloadDesc: "选择本地文件夹以优先播放下载的音乐。",
            defaultFolder: "默认浏览器下载",
            customFolderSet: "自定义文件夹已启用",
            change: "更改",
            localFileNote: "要离线播放音乐，请选择您保存下载内容的文件夹。",
            downloadSuccess: "下载成功",
            fileSavedTo: "文件已保存至：",
            dontShowAgain: "不再提示",
            gotIt: "知道了",
            rescan: "重新扫描",
            rescanDesc: "检查本地文件夹的更改（例如已删除的文件）。",
            scanning: "扫描中..."
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
