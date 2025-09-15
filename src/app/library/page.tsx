'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { fetchKitsuMangaCollection, type KitsuManga } from '@/lib/kitsu-api';
import { MangaGrid } from '@/components/manga/manga-grid';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/ui/navbar';

export default function LibraryPage() {
  const [mangas, setMangas] = useState<KitsuManga[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const loadMangas = useCallback(async () => {
    setLoading(true);
    try {
      const apiMangas = await fetchKitsuMangaCollection(searchTerm);
      setMangas(apiMangas);
    } catch (err) {
      console.error('Error loading mangas:', err);
      setMangas([]);
    }
    setLoading(false);
  }, [searchTerm]);

  useEffect(() => {
    loadMangas();
  }, [loadMangas]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 10 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <div className="aspect-[3/4] bg-card rounded-lg animate-pulse"></div>
        <div className="h-6 bg-card rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-card rounded w-1/2 animate-pulse"></div>
      </div>
    ));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background/95 to-background overflow-hidden">
      {/* Cursor Gradient Effect */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-30 opacity-50"
        animate={{
          background: `radial-gradient(600px at ${cursorPosition.x}px ${cursorPosition.y}px, rgba(168, 85, 247, 0.15), transparent 80%)`
        }}
      />

      {/* Content Container */}
      <div className="relative z-10">
        {/* Animated Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative py-12 sm:py-16 md:py-20 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-red-500/20 animate-gradient-x" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 mb-4 px-4">
                Manga Library
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-6">
                Discover your next favorite series from our vast collection of manga.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 sm:mt-8 max-w-lg mx-auto px-4 sm:px-0"
            >
              <div className="relative group">
                <Input
                  type="search"
                  placeholder="Search for manga titles..."
                  className="w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-4 text-sm sm:text-base bg-background/80 backdrop-blur-sm border-2 focus:border-primary/50 transition-all duration-300 relative z-10"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground z-20" />
                {/* Glowing effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg opacity-0 group-hover:opacity-30 blur transition-all duration-300" />
                <div className="absolute inset-0 bg-background rounded-lg z-0" />
              </div>
            </motion.div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6 sm:py-8 md:py-12">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {renderSkeletons()}
            </motion.div>
          ) : (
            <>
              {mangas.length > 0 ? (
                <MangaGrid mangas={mangas} />
              ) : (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-muted-foreground text-lg"
                >
                  No manga found. Try a different search term.
                </motion.p>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
