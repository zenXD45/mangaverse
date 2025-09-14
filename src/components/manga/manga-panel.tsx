'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { CarouselApi } from '@/components/ui/carousel';

type MangaPanelProps = {
  src: string;
  index: number;
  api: CarouselApi | undefined;
  priority: boolean;
};

export function MangaPanel({ src, index, api, priority }: MangaPanelProps) {
  const [parallaxValue, setParallaxValue] = useState(0);

  const onScroll = useCallback(() => {
    if (!api) return;

    const scrollProgress = api.scrollProgress();
    const slideCount = api.scrollSnapList().length;
    
    // This value represents the current position, e.g., 0.5 means halfway between slide 0 and 1
    const currentSlidePosition = scrollProgress * (slideCount > 1 ? slideCount - 1 : 0);
    
    // Difference between this panel's index and the current scroll position
    const diff = index - currentSlidePosition;

    // We want the parallax effect to be active only when the slide is near the viewport
    if (Math.abs(diff) > 1.5) {
        return;
    }
    
    // Clamp the difference to be between -1 and 1 to control the effect
    const clampedDiff = Math.max(-1, Math.min(1, diff));
    
    // The parallax effect: move image in the opposite direction of the swipe
    // When swiping to the next slide (e.g from 0 to 1), diff for slide 0 goes from 0 to -1.
    // We want to move the image right (positive translate). So, multiply by a negative factor.
    setParallaxValue(clampedDiff * -25); // max 25px shift

  }, [api, index]);

  useEffect(() => {
    if (!api) return;

    onScroll();
    api.on('scroll', onScroll);
    api.on('reInit', onScroll);

    return () => {
      api.off('scroll', onScroll);
      api.off('reInit', onScroll);
    };
  }, [api, onScroll]);

  return (
    <div className="h-[calc(100svh-4rem)] md:h-[calc(100svh-8rem)] w-full overflow-hidden flex items-center justify-center">
        <div className="relative w-full h-full max-w-[800px] aspect-[2/3] md:aspect-auto rounded-lg shadow-lg shadow-black/30 overflow-hidden">
            <Image
                src={src}
                alt={`Manga panel ${index + 1}`}
                fill
                priority={priority}
                sizes="(max-width: 768px) 90vw, 60vw"
                className="object-cover transition-transform duration-75 ease-out"
                style={{ transform: `scale(1.15) translateX(${parallaxValue}px)` }}
                data-ai-hint="manga panel"
            />
        </div>
    </div>
  );
}
