'use client';

import { useState, useMemo } from 'react';
import { useMusic } from '@johnny/api';
import { useCategories } from '@johnny/api';
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
  Clock,
  MoreHorizontal,
  ArrowDownToLine,
  Menu as MenuIcon,
  Check,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useMusicCache } from '@johnny/api';
import { getDailyRecommendation } from '@/utils/recommendation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"

const ITEMS_PER_PAGE = 20;

export default function Home() {
  const { music: songs, loading: songsLoading } = useMusic();
  const { config, seriesMap, loading: categoriesLoading } = useCategories();
  const { activeSong, isPlaying, playSong, togglePlay } = usePlayer();
  const { t, language, setLanguage } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('daily-recommendation');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filters change (State adjustment during render)
  const [prevFilterState, setPrevFilterState] = useState({ selectedCategory, searchQuery });
  if (prevFilterState.selectedCategory !== selectedCategory || prevFilterState.searchQuery !== searchQuery) {
    setPrevFilterState({ selectedCategory, searchQuery });
    setCurrentPage(1);
  }

  // Caching integration
  const { cachedSongs, cacheSong } = useMusicCache(songs);

  const dailyRecommendations = useMemo(() => {
    return getDailyRecommendation(songs, config.categories);
  }, [songs, config.categories]);

  const filteredSongs = useMemo(() => {
    if (selectedCategory === 'daily-recommendation' && !searchQuery) {
      return dailyRecommendations;
    }
    let result = songs;

    // Treat 'daily-recommendation' as 'All Music' for the list below, 
    // or if we want to filter specifically, we might need to adjust. 
    // But per req, "put all music under recommendation", so we likely want All Music list always.

    if (selectedCategory !== 'All Music' && selectedCategory !== 'daily-recommendation') {
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

  const totalPages = Math.ceil(filteredSongs.length / ITEMS_PER_PAGE);
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the list
    const scrollArea = document.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollArea) {
      scrollArea.scrollTop = 0;
    }
  };

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
    return (
      <div className="flex h-full w-full">
        {/* Sidebar Skeleton */}
        <div className="hidden md:block w-64 flex-shrink-0 border-r bg-background p-4 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col min-w-0 bg-secondary/10">
          <div className="h-16 border-b bg-background/50 backdrop-blur" />
          <div className="flex-1 p-6 space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="space-y-2">
              {/* Match the table header height */}
              <Skeleton className="h-10 w-full" />
              {/* List items */}
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
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

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

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
          {/* Daily Recommendation Section */}


          {/* Main List Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              {selectedCategory === 'All Music'
                ? t('common.allMusic')
                : (selectedCategory === 'daily-recommendation'
                  ? t('common.dailyRecommendation')
                  : (config.categories.find(c => c.id === selectedCategory)
                    ? (language === 'zh' ? config.categories.find(c => c.id === selectedCategory)?.zh : config.categories.find(c => c.id === selectedCategory)?.en)
                    : selectedCategory)
                )
              }
            </h1>
            {selectedCategory === 'All Music' && <p className="text-muted-foreground">{t('common.welcomeBack')}</p>}
          </div>

          <div className="space-y-1 pb-48">
            <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-2 md:gap-4 px-2 md:px-4 py-2 text-sm font-medium text-muted-foreground border-b mb-2">
              <span className="w-8 text-center">{t('common.index')}</span>
              <span>{t('common.title')}</span>
              <span className="hidden md:block">{t('common.artist')}</span>
              <span className="text-right w-12 md:w-20">{t('common.playCount')}</span>
              <span className="w-8 md:w-12 text-center"><Clock className="h-4 w-4 mx-auto" /></span>
            </div>

            {paginatedSongs.map((song, i) => {
              const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + i;
              const isActive = activeSong?.path === song.path;
              const isCached = cachedSongs.has(song.path);

              return (
                <div
                  key={i}
                  className={cn(
                    "group grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_1fr_auto_auto] gap-2 md:gap-4 px-2 md:px-4 py-3 rounded-md items-center cursor-pointer transition-colors hover:bg-secondary/50",
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
                      globalIndex + 1
                    )}
                  </span>
                  <span className="w-8 text-center hidden group-hover:flex items-center justify-center">
                    <Play className="h-4 w-4 fill-current" />
                  </span>

                  {/* Title Column with Cached Indicator */}
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
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

                  <div className="flex items-center justify-end w-12 md:w-20">
                    <span className="text-xs md:text-sm text-muted-foreground tabular-nums">{song.count || 0}</span>
                  </div>

                  <div className="w-8 md:w-12 flex items-center justify-center gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          {/* Changed opacity logic: always visible on mobile (md:hidden reverse), hover on desktop */}
                          <Button variant="ghost" size="icon" className="h-8 w-8 transition-opacity opacity-100 md:opacity-0 md:group-hover:opacity-100 data-[state=open]:opacity-100">
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
            {paginatedSongs.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                {t('common.noSongsFound')}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 mb-8 pb-32">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>

                    {/* First Page */}
                    {currentPage > 3 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(1)}>
                            1
                          </PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      </>
                    )}

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => Math.abs(page - currentPage) <= 2)
                      .map(page => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={page === currentPage}
                            onClick={() => handlePageChange(page)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                    {/* Last Page */}
                    {currentPage < totalPages - 2 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(totalPages)}>
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
