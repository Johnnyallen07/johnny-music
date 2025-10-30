'use client';
import { useState, useEffect, useMemo, MouseEvent } from 'react';
import {
  Play,
  Pause,
  Download,
  Menu,
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

  const playlist = useMemo(() => {
    const filtered = songs.filter(
      (song) =>
        selectedCategory === '所有音乐' || song.category === selectedCategory
    );
    return userOrderedPlaylist || filtered;
  }, [songs, selectedCategory, userOrderedPlaylist]);

  useEffect(() => {
    setUserOrderedPlaylist(null);
    // When category changes, find the index of the active song in the new playlist
    if (activeSong) {
      const newIndex = playlist.findIndex(song => song.path === activeSong.path);
      setCurrentSongIndex(newIndex);
    } else if (playlist.length > 0) {
        // If no song is active, default to the first song of the new list
        setCurrentSongIndex(0);
        setActiveSong(playlist[0]);
    } else {
        // If new playlist is empty, reset index and active song
        setCurrentSongIndex(-1);
        setActiveSong(null);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedCategory, userOrderedPlaylist]);


  const playPause = () => {
    if (activeSong) {
      setIsPlaying(!isPlaying);
    }
  };

  const handlePlayNext = () => {
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      const currentIndex = playlist.findIndex(song => song.path === activeSong?.path);
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    setActiveSong(playlist[nextIndex]);
    setCurrentSongIndex(nextIndex);
    setIsPlaying(true);
  };
  
  const handlePlayPrev = () => {
    let prevIndex;
    if (isShuffle) {
      prevIndex = Math.floor(Math.random() * playlist.length);
    } else {
      const currentIndex = playlist.findIndex(song => song.path === activeSong?.path);
      prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    }
    setActiveSong(playlist[prevIndex]);
    setCurrentSongIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleEnded = () => {
    if (isRepeat) {
      if (activeSong) {
        // Re-play the current song
        const newActiveSong = {...activeSong};
        setActiveSong(newActiveSong); // Trigger re-render and effect in Player
        setIsPlaying(true);
      }
    } else {
      handlePlayNext();
    }
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
    setActiveSong(song);
    setCurrentSongIndex(index);
    setIsPlaying(true);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setIsOpen={setIsSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Johnny的古典音乐库
          </h1>
          <button
            className="md:hidden text-gray-900 dark:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Music Player */}
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
          onShuffle={() => setIsShuffle(!isShuffle)}
          onRepeat={() => setIsRepeat(!isRepeat)}
          onTimeUpdate={setCurrentTime}
          onLoadedMetadata={setDuration}
          onEnded={handleEnded}
          onSeek={setCurrentTime}
        />

        {/* Playlist */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            播放列表
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <ul>
              {playlist.map((song, index) => (
                <li
                  key={`${song.path}-${index}`}
                  draggable={true}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer ${
                    activeSong?.path === song.path
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : ''
                  }`}
                  onClick={() => handleSongClick(song, index)}
                >
                  <div className="flex items-center">
                    {activeSong?.path === song.path && isPlaying ? (
                      <Pause className="mr-4 text-blue-500" />
                    ) : (
                      <Play className="mr-4 text-blue-500" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {song.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {song.artist}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <a
                      href={song.path}
                      download
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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
