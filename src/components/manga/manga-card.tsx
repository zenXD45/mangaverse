'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { type Manga } from '@/lib/manga-api';

type MangaCardProps = {
  manga: Manga;
};



export function MangaCard({ manga }: MangaCardProps) {
  const { id: mangaId, coverImage, title, author, chapterCount, status } = manga;
  const coverUrl = coverImage?.imageUrl;
  const coverHint = coverImage?.imageHint;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group h-full"
    >
      <Link href={`/manga/${mangaId}`}>
        <Card className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-2 border-transparent transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20 h-full">
          {/* Cover Image */}
          <div className="aspect-[3/4] relative overflow-hidden">
            {coverUrl ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Image
                  src={coverUrl}
                  alt={`Cover for ${title}`}
                  fill
                  className="object-cover transition-all duration-300 group-hover:brightness-110"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  data-ai-hint={coverHint}
                  priority
                />
              </motion.div>
            ) : (
              <div className="w-full h-full bg-card flex items-center justify-center text-card-foreground">
                No cover available
              </div>
            )}
            
            {/* Status Badge */}
            {status && (
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="bg-black/50 backdrop-blur-md text-xs sm:text-sm px-1.5 sm:px-2">
                  {status}
                </Badge>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>

          {/* Content */}
          <motion.div 
            className="p-2 sm:p-3 md:p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-bold truncate text-sm sm:text-base md:text-lg group-hover:text-primary transition-colors">
              {title}
            </h3>
            {author && (
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5 sm:mt-1">
                {author}
              </p>
            )}

            {/* Stats */}
            {chapterCount !== undefined && (
              <div className="mt-1 sm:mt-2 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-accent">
                <span>{chapterCount} Chapters Available</span>
              </div>
            )}
          </motion.div>
        </Card>
      </Link>
    </motion.div>
  );
}
