'use client';
import { useState, useEffect, useMemo, MouseEvent, useRef } from 'react';
import {
  Play,
  Pause,
  Download,
  Menu,
  CheckCircle2,
  Search,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Player from '../components/Player';

interface Song {
  title: string;
  artist: string;
  path: string;
  category: string;
}

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [userOrderedPlaylist, setUserOrderedPlaylist] = useState<Song[] | null>(
    null
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('所有音乐');
  const [activeSong, setActiveSong] = useState<Song | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [cachedSongs, setCachedSongs] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const playlistRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    fetch('/music-info.json')
      .then((res) => res.json())
      .then((data: Song[]) => {
        setSongs(data);
        if (data.length > 0) {
          setActiveSong(data[0]);
          setCurrentSongIndex(0);
        }
      });
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => console.log('Service Worker registered:', registration))
        .catch((error) => console.error('Service Worker registration failed:', error));
    }
  }, []);

  const playlist = useMemo(() => {
    const filtered = songs.filter(
      (song) =>
        selectedCategory === '所有音乐' || song.category === selectedCategory
    );
    return userOrderedPlaylist || filtered;
  }, [songs, selectedCategory, userOrderedPlaylist]);

  useEffect(() => {
    const checkCachedStatus = async () => {
      if (!('caches' in window)) return;

      const newCachedSongs = new Set<string>();
      const cache = await caches.open('audio-cache-v1');
      for (const song of playlist) {
        const response = await cache.match(song.path);
        if (response) {
          newCachedSongs.add(song.path);
        }
      }
      setCachedSongs(newCachedSongs);
    };

    if (playlist.length > 0) {
      checkCachedStatus();
    }
  }, [playlist, activeSong]);

  useEffect(() => {
    setUserOrderedPlaylist(null);
  }, [selectedCategory]);

  useEffect(() => {
    if (activeSong) {
      const newIndex = playlist.findIndex((song) => song.path === activeSong.path);
      if (newIndex === -1) {
        if (playlist.length > 0) {
          setActiveSong(playlist[0]);
          setCurrentSongIndex(0);
        }
      } else {
        setCurrentSongIndex(newIndex);
      }
    } else if (playlist.length > 0) {
      setActiveSong(playlist[0]);
      setCurrentSongIndex(0);
    } else {
      setActiveSong(null);
      setCurrentSongIndex(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playlist]);

  useEffect(() => {
    if (searchQuery) {
      const results = playlist.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setHighlightedIndex(-1); // Reset highlighted index on new search
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, playlist]);

  const playPause = () => {
    if (activeSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayNext = () => {
    if (playlist.length === 0) return;

    let nextIndex = -1;

    if (isShuffle) {
      if (playlist.length > 1) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * playlist.length);
        } while (randomIndex === currentSongIndex);
        nextIndex = randomIndex;
      } else {
        setIsPlaying(false);
        return;
      }
    } else {
      const potentialNextIndex = currentSongIndex + 1;
      if (potentialNextIndex < playlist.length) {
        nextIndex = potentialNextIndex;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    if (nextIndex !== -1) {
      setActiveSong(playlist[nextIndex]);
      setCurrentSongIndex(nextIndex);
      setIsPlaying(true);
    }
  };
  
  const handlePlayPrev = () => {
    if (playlist.length === 0) return;

    let prevIndex = -1;

    if (isShuffle) {
      if (playlist.length > 1) {
        let randomIndex;
        do {
          randomIndex = Math.floor(Math.random() * playlist.length);
        } while (randomIndex === currentSongIndex);
        prevIndex = randomIndex;
      } else {
        setIsPlaying(false);
        return;
      }
    } else {
      const potentialPrevIndex = currentSongIndex - 1;
      if (potentialPrevIndex >= 0) {
        prevIndex = potentialPrevIndex;
      } else {
        setIsPlaying(false);
        return;
      }
    }

    if (prevIndex !== -1) {
      setActiveSong(playlist[prevIndex]);
      setCurrentSongIndex(prevIndex);
      setIsPlaying(true);
    }
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (activeSong) {
        setActiveSong({ ...activeSong });
        setIsPlaying(true);
      }
    } else {
      handlePlayNext();
    }
  };

  const handleShuffleToggle = () => {
    setIsShuffle((prev) => !prev);
    if (isRepeat) {
      setIsRepeat(false);
    }
  };

  const handleRepeatToggle = () => {
    setIsRepeat((prev) => !prev);
    // No need to turn off shuffle when repeat is toggled, as repeat is now single-song only.
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;

    const newPlaylist = [...playlist];
    const [draggedItem] = newPlaylist.splice(draggedIndex, 1);
    newPlaylist.splice(index, 0, draggedItem);

    setUserOrderedPlaylist(newPlaylist);
    setDraggedIndex(null);
  };

  const handleSongClick = (song: Song, index: number) => {
    const wasSearching = searchQuery !== '';
    let songIndex = index;
    if (wasSearching) {
      songIndex = playlist.findIndex(s => s.path === song.path);
    }

    setActiveSong(song);
    setCurrentSongIndex(songIndex);
    setIsPlaying(true);
    setSearchQuery(''); // Clear search query after selecting a song

    if (wasSearching && songIndex !== -1) {
      setTimeout(() => {
        if (playlistRef.current) {
          const songElement = playlistRef.current.children[songIndex];
          if (songElement) {
            songElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (searchResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex < searchResults.length - 1 ? prevIndex + 1 : prevIndex
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex((prevIndex) =>
          prevIndex > 0 ? prevIndex - 1 : 0
        );
      } else if (e.key === 'Enter' && highlightedIndex !== -1) {
        e.preventDefault();
        const songToPlay = searchResults[highlightedIndex];
        const originalIndex = playlist.findIndex(s => s.path === songToPlay.path);
        if (originalIndex !== -1) {
          handleSongClick(songToPlay, originalIndex);
        }
      }
    }
  };

  useEffect(() => {
    if (highlightedIndex !== -1 && playlistRef.current) {
      const highlightedElement = playlistRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform md:relative md:translate-x-0 md:w-64 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 md:flex md:flex-col`}
      >
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setIsOpen={setIsSidebarOpen}
        />
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main
        className={`flex-1 flex flex-col p-4 md:p-8 overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? 'blur-sm pointer-events-none' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-8 flex-shrink-0">
          <div className="relative flex-grow mr-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索音乐或艺术家..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <button
            className="md:hidden text-gray-900 dark:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="flex-shrink-0">
          <Player
            activeSong={activeSong}
            isPlaying={isPlaying}
            isShuffle={isShuffle}
            isRepeat={isRepeat}
            currentTime={currentTime}
            duration={duration}
            onPlayPause={playPause}
            onNext={handlePlayNext}
            onPrev={handlePlayPrev}
            onShuffle={handleShuffleToggle}
            onRepeat={handleRepeatToggle}
            onTimeUpdate={setCurrentTime}
            onLoadedMetadata={setDuration}
            onEnded={handleEnded}
            onSeek={setCurrentTime}
          />
        </div>

        <div className="mt-8 flex-grow overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            播放列表
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <ul ref={playlistRef}>
              {(searchQuery ? searchResults : playlist).map((song, index) => (
                <li
                  key={`${song.path}-${index}`}
                  draggable={true}
                  onDragStart={() => setDraggedIndex(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer ${
                    activeSong?.path === song.path
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : ''
                  } ${
                    searchQuery &&
                    searchResults.includes(song) &&
                    highlightedIndex === index
                      ? 'bg-yellow-200 dark:bg-yellow-700' // Highlight search results
                      : ''
                  }`}
                  onClick={() => handleSongClick(song, index)}
                >
                  {activeSong?.path === song.path && isPlaying ? (
                    <Pause className="mr-4 flex-shrink-0 text-blue-500" />
                  ) : (
                    <Play className="mr-4 flex-shrink-0 text-blue-500" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {song.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {song.artist}
                    </p>
                  </div>
                  <div className="flex items-center flex-shrink-0 ml-4">
                    {cachedSongs.has(song.path) && (
                      <CheckCircle2 className="text-green-500" size={16} />
                    )}
                    <a
                      href={song.path}
                      download
                      className="ml-4 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
