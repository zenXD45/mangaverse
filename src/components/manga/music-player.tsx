'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const tracks = [
  { name: 'Peaceful Dreams', url: '/music/peaceful-dreams.mp3' },
  { name: 'Cyber Cityscape', url: '/music/cyber-cityscape.mp3' },
  { name: 'Forest Whispers', url: '/music/forest-whispers.mp3' },
];

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const player = useRef<Tone.Player | null>(null);
  const { toast } = useToast();

  // Initialize player and handle track change
  useEffect(() => {
    // Dispose old player if any
    player.current?.dispose();

    // Create new player instance for current track
    player.current = new Tone.Player(tracks[currentTrackIndex].url, () => {
      // Auto play if already playing!
      if (isPlaying) {
        player.current?.start();
      }
    }).toDestination();

    player.current.loop = true;

    player.current.onerror = () => {
      if (isPlaying) {
        toast({
          variant: 'destructive',
          title: 'Audio Error',
          description: `Could not load: ${tracks[currentTrackIndex].name}. Please add audio files to /public/music.`,
        });
        setIsPlaying(false);
      }
    };

    return () => {
      player.current?.dispose();
    };
  }, [currentTrackIndex, isPlaying, toast]);

  // Sync mute state
  useEffect(() => {
    if (player.current) {
      player.current.mute = isMuted;
    }
  }, [isMuted]);

  // Play/pause toggle handler with proper Tone context startup
  const togglePlay = useCallback(async () => {
    await Tone.start();
    if (isPlaying) {
      player.current?.stop();
    } else {
      player.current?.start();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // Skip to next track
  const skipTrack = useCallback(() => {
    setCurrentTrackIndex((prevIndex) => (prevIndex + 1) % tracks.length);
  }, []);

  // Select track from dropdown
  const selectTrack = useCallback(
    (index: number) => {
      if (index !== currentTrackIndex) {
        setCurrentTrackIndex(index);
        setIsPlaying(false); // Optionally pause when switching track
      }
    },
    [currentTrackIndex]
  );

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" onClick={togglePlay} className="text-primary-foreground hover:bg-white/20">
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      <Button variant="ghost" size="icon" onClick={skipTrack} className="text-primary-foreground hover:bg-white/20">
        <SkipForward className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" onClick={() => setIsMuted(!isMuted)} className="text-primary-foreground hover:bg-white/20">
        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20">
            <Music className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Ambient Tracks</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {tracks.map((track, index) => (
            <DropdownMenuItem
              key={track.name}
              onClick={() => selectTrack(index)}
              className={index === currentTrackIndex ? 'bg-accent/50' : ''}
            >
              {track.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
