
'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { getMangaDexCollection, type MangaDexManga } from '@/lib/mangadex-api';
import { getMangas, type Manga } from '@/lib/manga-api';
import { MangaCard } from '@/components/manga/manga-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

const PAGE_SIZE = 20;

export default function LibraryPage() {
  const [mangas, setMangas] = useState<(Manga | MangaDexManga)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [isSearching, startSearch] = useTransition();

  const loadMangas = useCallback(async (currentOffset: number, isInitialLoad = false) => {
    if(isInitialLoad) setLoading(true);
    else setLoadingMore(true);

    if (searchTerm) {
        const { mangas: mangaDexMangas, hasMore: newHasMore } = await getMangaDexCollection(searchTerm, PAGE_SIZE, currentOffset);
        setMangas(prev => currentOffset === 0 ? mangaDexMangas : [...prev, ...mangaDexMangas]);
        setHasMore(newHasMore);
    } else {
        const { mangas: mangaDexMangas, hasMore: newHasMore } = await getMangaDexCollection(undefined, PAGE_SIZE, currentOffset);
        if (isInitialLoad) {
            const localMangas = await getMangas();
            setMangas([...localMangas, ...mangaDexMangas]);
        } else {
            setMangas(prev => [...prev, ...mangaDexMangas]);
        }
        setHasMore(newHasMore);
    }
    
    setOffset(currentOffset + PAGE_SIZE);
    if(isInitialLoad) setLoading(false);
    else setLoadingMore(false);
  }, [searchTerm]);

  useEffect(() => {
    loadMangas(0, true);
  }, [loadMangas]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      setOffset(0); // Reset offset for new search
      setMangas([]); // Clear existing mangas
      setHasMore(true); // Assume there are results
      
      startSearch(() => {
          loadMangas(0, true);
      });
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
        loadMangas(offset);
    }
  };

  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
            <div className="aspect-[3/4] bg-card rounded-lg animate-pulse"></div>
            <div className="h-6 bg-card rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-card rounded w-1/2 animate-pulse"></div>
        </div>
    ));
  }


  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold text-primary">
          Manga Library
        </h1>
        <p className="text-muted-foreground mt-2">
          Your portal to captivating worlds.
        </p>
        <div className="mt-8 max-w-lg mx-auto relative">
          <Input
            type="search"
            placeholder="Search for a manga..."
            className="pl-10 h-12 text-lg"
            value={searchTerm}
            onChange={handleSearch}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </header>
      {loading ? (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {renderSkeletons(10)}
         </div>
      ) : (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mangas.length > 0 ? (
                mangas.map((manga) => (
                <MangaCard key={manga.id} manga={manga} />
                ))
            ) : (
                <p className="col-span-full text-center text-muted-foreground">No manga found.</p>
            )}
            {loadingMore && renderSkeletons(5)}
            </div>
            {hasMore && !loadingMore && (
                <div className="text-center mt-12">
                    <Button onClick={handleLoadMore} size="lg">Load More</Button>
                </div>
            )}
        </>
      )}
    </main>
  );
}
