'use client';
import { useRef, useEffect, MouseEvent } from 'react';
import {
  Play,
  Pause,
  Shuffle,
  Repeat,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Song {
  title: string;
  artist: string;
  path: string;
  category: string;
}

interface PlayerProps {
  activeSong: Song | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  currentTime: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onShuffle: () => void;
  onRepeat: () => void;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onEnded: () => void;
  onSeek: (time: number) => void;
}

export default function Player({
  activeSong,
  isPlaying,
  isShuffle,
  isRepeat,
  currentTime,
  duration,
  onPlayPause,
  onNext,
  onPrev,
  onShuffle,
  onRepeat,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onSeek,
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.error('Play error:', e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current && activeSong) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.src = activeSong.path;
      if (wasPlaying) {
        audioRef.current.play().catch((e) => console.error('Play error:', e));
      }
    }
  }, [activeSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      onTimeUpdate(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      onLoadedMetadata(audioRef.current.duration);
    }
  };

  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current && duration) {
      const progressBar = progressBarRef.current;
      const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
      const newTime = (clickPosition / progressBar.offsetWidth) * duration;
      audioRef.current.currentTime = newTime;
      onSeek(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!activeSong) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div>
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {activeSong.title}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {activeSong.artist}
        </p>
      </div>

      <audio
        ref={audioRef}
        onEnded={onEnded}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />

      <div className="mt-6">
        <div
          ref={progressBarRef}
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 cursor-pointer"
          onClick={handleSeek}
        >
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex justify-center items-center mt-6 space-x-6">
        <button
          className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white ${
            isShuffle ? 'text-blue-500' : ''
          }`}
          onClick={onShuffle}
        >
          <Shuffle size={24} />
        </button>
        <button
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          onClick={onPrev}
        >
          <ChevronLeft size={32} />
        </button>
        <button
          className="bg-blue-500 text-white rounded-full p-4"
          onClick={onPlayPause}
        >
          {isPlaying ? <Pause size={32} /> : <Play size={32} />}
        </button>
        <button
          className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          onClick={onNext}
        >
          <ChevronRight size={32} />
        </button>
        <button
          className={`text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white ${
            isRepeat ? 'text-blue-500' : ''
          }`}
          onClick={onRepeat}
        >
          <Repeat size={24} />
        </button>
      </div>
    </div>
  );
}
