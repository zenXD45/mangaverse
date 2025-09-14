'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { MangaPanel } from '@/components/manga/manga-panel';
import { MusicPlayer } from '@/components/manga/music-player';
import { Button } from '@/components/ui/button';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

type MangaReaderProps = {
  panels: ImagePlaceholder[];
  mangaId: string;
  chapterTitle: string;
};

export function MangaReader({ panels, mangaId, chapterTitle }: MangaReaderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const hideControls = () => {
    setControlsVisible(false);
  };

  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(hideControls, 3000);
  };

  useEffect(() => {
    showControls(); // Show on initial load
    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
      showControls();
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  const handleSlideChange = (value: number[]) => {
    api?.scrollTo(value[0]);
  };

  return (
    <div
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden"
      onClick={showControls}
    >
      <header
        className={cn(
          'absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300',
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          <Button asChild variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/20">
            <Link href={`/manga/${mangaId}`}>
              <ArrowLeft />
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="font-headline text-lg text-primary-foreground">{chapterTitle}</h1>
            <p className="text-sm text-muted-foreground">{`Page ${current} of ${count}`}</p>
          </div>
          <MusicPlayer />
        </div>
      </header>

      <Carousel setApi={setApi} className="w-full max-w-2xl">
        <CarouselContent>
          {panels.map((panel, index) => (
            <CarouselItem key={panel.id}>
                <MangaPanel 
                    src={panel.imageUrl} 
                    index={index} 
                    api={api}
                    priority={index < 2}
                />
            </CarouselItem>
          ))}
        </CarouselContent>
        <div className={cn('transition-opacity duration-300', controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none')}>
            <CarouselPrevious className="left-2 bg-background/50 hover:bg-background/80 border-border" />
            <CarouselNext className="right-2 bg-background/50 hover:bg-background/80 border-border" />
        </div>
      </Carousel>

      <footer
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300',
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="container mx-auto flex items-center gap-4">
            <SlidersHorizontal className="text-primary-foreground"/>
            <Slider
                value={[current-1]}
                max={count - 1}
                step={1}
                onValueChange={handleSlideChange}
                className="w-full"
            />
        </div>
      </footer>
    </div>
  );
}
