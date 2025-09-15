'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { KitsuChapter } from '@/lib/kitsu-api';

interface ChapterListProps {
  chapters: KitsuChapter[];
  mangaId: string;
  isLoading?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

export function ChapterList({ chapters, mangaId, isLoading }: ChapterListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No chapters available yet.</p>
      </div>
    );
  }

  // Sort chapters in descending order (newest first)
  const sortedChapters = [...chapters].sort((a, b) => b.number - a.number);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      {sortedChapters.map((chapter) => (
        <motion.div key={chapter.id} variants={item}>
          <Link href={`/manga/${mangaId}/${chapter.id}`}>
            <Card className="group p-4 hover:bg-accent transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
                  <div>
                    <h3 className="font-semibold group-hover:text-accent-foreground">
                      Chapter {chapter.number}
                    </h3>
                    {chapter.title && (
                      <p className="text-sm text-muted-foreground group-hover:text-accent-foreground/80">
                        {chapter.title}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground transition-transform group-hover:translate-x-1" />
              </div>
              {chapter.published && (
                <p className="mt-2 text-xs text-muted-foreground group-hover:text-accent-foreground/60">
                  Published: {new Date(chapter.published).toLocaleDateString()}
                </p>
              )}
            </Card>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}