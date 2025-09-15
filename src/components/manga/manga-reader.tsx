'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useIsMobile } from '@/hooks/use-mobile';

import { cn } from '@/lib/utils';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { MangaPanel } from '@/components/manga/manga-panel';
import { MusicPlayer } from '@/components/manga/music-player';

interface MangaReaderProps {
  panels: ImagePlaceholder[];
  mangaId: string;
  chapterTitle: string;
}

export function MangaReader({ panels, mangaId, chapterTitle }: MangaReaderProps) {
  const [currentPanel, setCurrentPanel] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set([0]));
 const isMobile = useIsMobile();
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Preload next few images to enhance performance
  useEffect(() => {
    const preloadImages = async () => {
      const imagesToPreload: number[] = [];
      for (let i = currentPanel + 1; i < Math.min(currentPanel + 3, panels.length); i++) {
        if (!preloadedImages.has(i)) {
          imagesToPreload.push(i);
        }
      }

      for (const index of imagesToPreload) {
        const img = new window.Image();
        img.src = panels[index].imageUrl;
        try {
          await img.decode();
          setPreloadedImages(prev => new Set(prev).add(index));
        } catch {
          // Ignore decode failure
        }
      }
    };

    if (panels.length > 1) preloadImages();
  }, [currentPanel, panels, preloadedImages]);

  const handleNext = useCallback(() => {
    if (currentPanel < panels.length - 1) {
      setCurrentPanel(prev => prev + 1);
      setIsLoading(true);
    }
  }, [currentPanel, panels.length]);

  const handlePrev = useCallback(() => {
    if (currentPanel > 0) {
      setCurrentPanel(prev => prev - 1);
      setIsLoading(true);
    }
  }, [currentPanel]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Controls visibility management
  const hideControls = () => setControlsVisible(false);
  const showControls = () => {
    setControlsVisible(true);
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(hideControls, 3000);
  };

  useEffect(() => {
    showControls();
    return () => {
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Reader controls */}
      <div className="flex items-center justify-between gap-4 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={currentPanel === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>

        <div className="flex-1 max-w-md">
          <Slider
            value={[currentPanel]}
            min={0}
            max={panels.length - 1}
            step={1}
            onValueChange={([value]) => setCurrentPanel(value)}
            className="w-full"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPanel === panels.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Manga page display */}
      <Card className="relative overflow-hidden bg-black/50 rounded-lg">
        <div
          className="relative aspect-[3/4] md:aspect-[4/3] lg:aspect-[16/9]"
          onClick={showControls}
          onMouseMove={showControls}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPanel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={panels[currentPanel].imageUrl}
                alt={`Page ${currentPanel + 1} of ${panels.length}`}
                fill
                className="object-contain"
                onLoad={() => setIsLoading(false)}
                quality={100}
                priority
                unoptimized
              />
            </motion.div>
          </AnimatePresence>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* Touch navigation overlay */}
          {isMobile && (
            <div className="absolute inset-0 grid grid-cols-2">
              <button
                onClick={handlePrev}
                disabled={currentPanel === 0}
                className="h-full w-full"
                aria-label="Previous"
              />
              <button
                onClick={handleNext}
                disabled={currentPanel === panels.length - 1}
                className="h-full w-full"
                aria-label="Next"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Page number */}
      <p className="text-center text-sm text-muted-foreground">
        Page {currentPanel + 1} of {panels.length}
      </p>

      {/* Header */}
      <header
        className={cn(
          'absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300',
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="container mx-auto flex items-center justify-between">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-white/20"
          >
            <Link href={`/manga/${mangaId}`}>
              <ArrowLeft />
            </Link>
          </Button>
          <div className="text-center">
            <h1 className="font-headline text-lg text-primary-foreground">{chapterTitle}</h1>
          </div>
          <MusicPlayer />
        </div>
      </header>

      {/* Footer */}
      <footer
        className={cn(
          'absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300',
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="container mx-auto flex items-center gap-4">
          <SlidersHorizontal className="text-primary-foreground" />
          <Slider
            value={[currentPanel]}
            max={panels.length > 0 ? panels.length - 1 : 0}
            step={1}
            onValueChange={([value]) => setCurrentPanel(value)}
            className="w-full"
          />
        </div>
      </footer>
    </div>
  );
}
