'use client';
import { useState, useEffect, useRef } from 'react';
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

// NOTE: Audio files are not provided in this scaffold.
// To make this component functional, add your audio files to the /public/music directory
// and ensure the filenames match the 'url' properties below.
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

  useEffect(() => {
    // Initialize Tone.Player
    player.current = new Tone.Player(tracks[currentTrackIndex].url, () => {
      // Autoplay if isPlaying is true
      if (isPlaying) {
        player.current?.start();
      }
    }).toDestination();
    player.current.loop = true;
    
    player.current.onstop = () => {
        // This is called when stopped manually, not on loop end
    };
    
    // Handle loading errors
    player.current.onerror = () => {
        if(isPlaying) {
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
  }, [currentTrackIndex]);

  useEffect(() => {
    if (player.current) {
        player.current.mute = isMuted;
    }
  }, [isMuted]);

  const togglePlay = async () => {
    await Tone.start();
    if (isPlaying) {
      player.current?.stop();
    } else {
      player.current?.start();
    }
    setIsPlaying(!isPlaying);
  };

  const skipTrack = () => {
    const nextTrackIndex = (currentTrackIndex + 1) % tracks.length;
    setCurrentTrackIndex(nextTrackIndex);
  };
  
  const selectTrack = (index: number) => {
    if (index !== currentTrackIndex) {
        setCurrentTrackIndex(index);
    }
  };


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
            <DropdownMenuItem key={track.name} onClick={() => selectTrack(index)} className={index === currentTrackIndex ? 'bg-accent/50' : ''}>
              {track.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
