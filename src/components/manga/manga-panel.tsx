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
    const currentSlidePosition = scrollProgress * (slideCount > 1 ? slideCount - 1 : 0);
    const diff = index - currentSlidePosition;

    if (Math.abs(diff) > 1.5) return;

    const clampedDiff = Math.max(-1, Math.min(1, diff));
    setParallaxValue(clampedDiff * -25);
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

  // Fallback image URL for broken images
  const fallbackSrc = 'https://placehold.co/600x800?text=Image+Not+Available';

  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] w-full overflow-hidden flex items-center justify-center">
      <div className="relative w-full h-full max-w-[800px] aspect-[2/3] md:aspect-auto rounded-lg shadow-lg shadow-black/30 overflow-hidden">
        <Image
          src={src}
          alt={`Manga panel ${index + 1}`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 90vw, 60vw"
          className="object-contain transition-transform duration-75 ease-out"
          style={{ transform: `scale(1.15) translateX(${parallaxValue}px)` }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== fallbackSrc) {
              target.src = fallbackSrc;
            }
          }}
          data-ai-hint="manga panel"
        />
      </div>
    </div>
  );
}
