'use client';

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

export default function Player() {
  const {
    activeSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    isShuffle,
    toggleShuffle,
    isRepeat,
    toggleRepeat,
    currentTime,
    duration,
    seek,
    volume,
    isMuted,
    setVolume,
    toggleMute
  } = usePlayer();

  const [localProgress, setLocalProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error("Error attempting to enable fullscreen:", err);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  const handleSeek = (value: number[]) => {
    setLocalProgress(value[0]);
    setIsDragging(true);
  };

  const handleSeekCommit = (value: number[]) => {
    setIsDragging(false);
    seek(value[0]);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!activeSong) return null;

  const currentProgress = isDragging ? localProgress : currentTime;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50 h-[5.5rem] md:h-24 flex flex-col justify-center">
      {/* Progress Bar (Top) */}
      <div className="absolute top-0 left-0 right-0 h-1.5 w-full z-10">
        <Slider
          value={[currentProgress]}
          max={duration || 100}
          step={1}
          className="w-full h-full hover:cursor-grab active:cursor-grabbing [&_.slider-track]:h-1.5 [&_.slider-range]:h-1.5 [&_.slider-thumb]:h-3 [&_.slider-thumb]:w-3 [&_.slider-thumb]:top-[-3px]"
          onValueChange={handleSeek}
          onValueCommit={handleSeekCommit}
        />
      </div>

      <div className="flex items-center justify-between px-4 w-full h-full">
        {/* Song Info */}
        <div className="flex flex-1 min-w-0 md:w-1/3 items-center md:items-start flex-col gap-1 mr-4">
          <h4 className="text-sm font-semibold truncate hover:underline cursor-pointer w-full">
            {activeSong.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate hover:underline cursor-pointer w-full">
            {activeSong.artist}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 md:gap-4 md:w-1/3">
          {/* Desktop Controls (Shuffle/Repeat/Previous) */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              size="icon"
              variant="ghost"
              className={cn("h-8 w-8 text-muted-foreground hover:text-primary", isShuffle && "text-primary")}
              onClick={toggleShuffle}
            >
              <Shuffle className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={playPrev}
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>
          </div>

          {/* Mobile: Prev/Next/Play always visible */}
          <Button
            size="icon"
            variant="ghost"
            className="md:hidden h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={playPrev}
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </Button>

          <Button
            size="icon"
            className="h-10 w-10 rounded-full shadow-md flex-shrink-0"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={playNext}
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            className={cn("hidden md:inline-flex h-8 w-8 text-muted-foreground hover:text-primary", isRepeat && "text-primary")}
            onClick={toggleRepeat}
          >
            <Repeat className="h-4 w-4" />
          </Button>
        </div>

        {/* Volume / Extra Actions - Desktop */}
        <div className="hidden md:flex w-1/3 justify-end items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium font-mono mr-2">
            {formatTime(currentProgress)} / {formatTime(duration)}
          </span>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={toggleMute}
          >
            {isMuted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume * 100]}
            max={100}
            step={1}
            className="w-24 cursor-pointer"
            onValueChange={(value) => setVolume(value[0] / 100)}
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground hover:text-primary"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Fullscreen Toggle - integrated into right side */}
        <div className="flex md:hidden ml-2">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-muted-foreground"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
