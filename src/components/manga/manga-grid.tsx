'use client';

import { motion } from 'framer-motion';
import { KitsuManga } from '@/lib/kitsu-api';
import { MangaCard } from './manga-card';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface MangaGridProps {
  mangas: KitsuManga[];
}

export function MangaGrid({ mangas }: MangaGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
    >
      {mangas.map((manga) => {
        const coverUrl = manga.posterImage?.medium || 
                        manga.posterImage?.large || 
                        manga.posterImage?.original;
                        
        return (
          <motion.div key={manga.id} variants={item}>
            <MangaCard
              manga={{
                id: manga.id,
                title: manga.title,
                author: manga.type === 'manga' ? 'Manga' : '',
                description: manga.synopsis || '',
                coverImageId: manga.id,
                chapters: manga.chapters?.map((ch) => ({
                  id: ch.id,
                  title: ch.title || `Chapter ${ch.number}`,
                  chapterNumber: ch.number,
                  panelIds: []
                })) || [],
                chapterCount: manga.chapterCount || 0,
                volumeCount: manga.volumeCount,
                status: manga.status,
                startDate: manga.startDate,
                coverImage: coverUrl ? {
                  imageUrl: coverUrl,
                  imageHint: manga.title,
                  id: manga.id,
                  description: manga.title
                } : undefined
              }}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}