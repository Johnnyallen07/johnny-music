'use client';

import { useState, useMemo } from 'react';
import { useMusic } from '@/hooks/useMusic';
import { useCategories } from '@/hooks/useCategories';
import { usePlayer, Song } from '@/context/PlayerContext';
import Sidebar from '@/components/Sidebar';
import { getSongIcon } from '@/utils/iconMapping';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLanguage } from '@/context/LanguageContext';
import {
  Play,
  Search,
  Music2,
  Clock,
  MoreHorizontal,
  ArrowDownToLine,
  Menu as MenuIcon,
  Check
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useMusicCache } from '@/hooks/useMusicCache';

export default function Home() {
  const { music: songs, loading: songsLoading } = useMusic();
  const { config, seriesMap, loading: categoriesLoading } = useCategories();
  const { activeSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { t, language, setLanguage } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Music');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Caching integration
  const { cachedSongs, cacheSong } = useMusicCache(songs);

  // We no longer need the effect to sync selectedCategory string

  const filteredSongs = useMemo(() => {
    let result = songs;
    if (selectedCategory !== 'All Music') {
      result = result.filter(song => {
        // 1. Check if selectedCategory matches a Musician ID
        const musicianItem = config.musicians.find(m => m.id === selectedCategory);
        if (musicianItem) {
          return (song.artist && song.artist.includes(musicianItem.en)) ||
            (song.artist_zh && song.artist_zh.includes(musicianItem.zh));
        }

        // 2. Check Series
        const seriesItem = config.series.find(s => s.id === selectedCategory);
        if (seriesItem) {
          // If we have a series map and this series is in it, use the IDs to filter
          if (seriesMap && seriesMap[selectedCategory]) {
            const seriesIds = seriesMap[selectedCategory];
            return seriesIds.includes(song.id);
          }

          // Fallback to old logic if no map data (though map should exist per plan)
          return (song.category === seriesItem.en) ||
            (song.category_zh === seriesItem.zh) ||
            (song.title.includes(seriesItem.en)) ||
            (song.title_zh && song.title_zh.includes(seriesItem.zh));
        }

        // 3. Standard Category Match
        const catItem = config.categories.find(c => c.id === selectedCategory);
        if (catItem) {
          return song.category === catItem.en || song.category_zh === catItem.zh;
        }

        // Fallback
        return song.category === selectedCategory || song.category_zh === selectedCategory;
      });
    }
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(song => {
        const title = language === 'zh' ? (song.title_zh || song.title) : song.title;
        const artist = language === 'zh' ? (song.artist_zh || song.artist) : song.artist;
        return title.toLowerCase().includes(lowerQuery) || artist.toLowerCase().includes(lowerQuery);
      });
    }
    return result;
  }, [songs, selectedCategory, searchQuery, language, config, seriesMap]);

  const handleSongClick = (song: Song) => {
    if (activeSong?.path === song.path) {
      togglePlay();
    } else {
      playSong(song, filteredSongs);
    }
  };

  const handleDownload = (song: Song) => {
    // 1. Trigger actual download
    const link = document.createElement('a');
    link.href = `/api/download?key=${encodeURIComponent(song.path.replace(`${process.env.NEXT_PUBLIC_CLOUDFLARE_BUCKET_PUBLIC_URL}/`, ''))}`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Cache the song
    cacheSong(song);
  };

  if (songsLoading || categoriesLoading) {
    return <div className="flex h-full items-center justify-center">{t('common.loading')}</div>;
  }

  return (
    <div className="flex h-full w-full">
      {/* Sidebar */}
      <div className={cn(
        "w-64 flex-shrink-0 border-r bg-background transition-all duration-300 ease-in-out md:block",
        isSidebarOpen ? "absolute z-50 h-full shadow-xl" : "hidden"
      )}>
        <Sidebar
          config={config}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setIsOpen={setIsSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-secondary/10">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-background/50 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <MenuIcon />
            </Button>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder={t('common.searchPlaceholder')}
                className="w-full bg-secondary rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}>
              {language === 'en' ? '中文' : 'English'}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <span className="sr-only">User menu</span>
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">J</span>
              </div>
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">{t('common.welcomeBack')}</h1>
            <p className="text-muted-foreground">{t('common.welcome_slogan')}</p>
          </div>

          {/* Song List */}
          <div className="space-y-1">
            <div className="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b mb-2">
              <span className="w-8 text-center">{t('common.index')}</span>
              <span>{t('common.title')}</span>
              <span className="hidden md:block">{t('common.artist')}</span>
              <span className="hidden md:block text-right w-20">{t('common.playCount')}</span>
              <span className="w-12 text-center"><Clock className="h-4 w-4 mx-auto" /></span>
            </div>

            {filteredSongs.map((song, i) => {
              const isActive = activeSong?.path === song.path;
              const isCached = cachedSongs.has(song.path);

              return (
                <div
                  key={i}
                  className={cn(
                    "group grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 px-4 py-3 rounded-md items-center cursor-pointer transition-colors hover:bg-secondary/50",
                    isActive && "bg-secondary text-primary"
                  )}
                  onClick={() => handleSongClick(song)}
                >
                  <span className="w-8 text-center text-sm font-medium text-muted-foreground group-hover:hidden">
                    {isActive && isPlaying ? (
                      <div className="flex gap-[2px] justify-center items-end h-3">
                        <span className="w-[3px] h-3 bg-primary animate-[bounce_1s_infinite]" />
                        <span className="w-[3px] h-2 bg-primary animate-[bounce_1.2s_infinite]" />
                        <span className="w-[3px] h-3 bg-primary animate-[bounce_0.8s_infinite]" />
                      </div>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="w-8 text-center hidden group-hover:flex items-center justify-center">
                    <Play className="h-4 w-4 fill-current" />
                  </span>

                  {/* Title Column with Cached Indicator */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={cn("h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0", isActive ? "bg-primary/10" : "bg-muted")}>
                      {(() => {
                        const Icon = getSongIcon(song);
                        return <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />;
                      })()}
                    </div>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium truncate", isActive && "text-primary")}>{language === 'zh' ? (song.title_zh || song.title) : song.title}</span>
                        {isCached && (
                          <span title="Cached">
                            <Check className="h-4 w-4 text-green-500" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground md:hidden truncate">{language === 'zh' ? (song.artist_zh || song.artist) : song.artist}</span>
                      <span className="text-xs text-muted-foreground md:hidden truncate">{song.performer}</span>
                    </div>
                  </div>

                  <div className="hidden md:flex flex-col truncate">
                    <span className="text-sm text-muted-foreground truncate">{language === 'zh' ? (song.artist_zh || song.artist) : song.artist}</span>
                    {song.performer && <span className="text-xs text-muted-foreground truncate">{song.performer}</span>}
                  </div>

                  <div className="hidden md:flex items-center justify-end w-20">
                    <span className="text-sm text-muted-foreground tabular-nums">{song.count || 0}</span>
                  </div>

                  <div className="w-12 flex items-center justify-center gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSongClick(song)}>
                            <Play className="mr-2 h-4 w-4" />
                            <span>{t('common.play') || 'Play'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(song)}>
                            <ArrowDownToLine className="mr-2 h-4 w-4" />
                            <span>{t('common.download') || 'Download'}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredSongs.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                {t('common.noSongsFound')}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
