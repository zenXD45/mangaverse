
'use client';

import { useState, useEffect, useTransition } from 'react';
import { getMangaDexCollection, type MangaDexManga } from '@/lib/mangadex-api';
import { getMangas, type Manga } from '@/lib/manga-api';
import { MangaCard } from '@/components/manga/manga-card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function LibraryPage() {
  const [mangas, setMangas] = useState<(Manga | MangaDexManga)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, startSearch] = useTransition();

  const allMangas = mangas;

  useEffect(() => {
    async function loadInitialMangas() {
      setLoading(true);
      const [localMangas, mangaDexMangas] = await Promise.all([
        getMangas(),
        getMangaDexCollection(),
      ]);
      const combinedMangas = [...localMangas, ...mangaDexMangas];
      setMangas(combinedMangas);
      setLoading(false);
    }
    loadInitialMangas();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      const term = e.target.value;
      setSearchTerm(term);
      if (term.length > 2) {
          startSearch(async () => {
              // When searching, only show results from MangaDex
              const mangaDexMangas = await getMangaDexCollection(term);
              setMangas(mangaDexMangas);
          });
      } else if (term.length === 0) {
          startSearch(async () => {
              // When search is cleared, show the initial combined list again
              const [localMangas, mangaDexMangas] = await Promise.all([
                  getMangas(),
                  getMangaDexCollection(),
              ]);
              const combinedMangas = [...localMangas, ...mangaDexMangas];
              setMangas(combinedMangas);
          });
      }
  };


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
      {loading || isSearching ? (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <div className="aspect-[3/4] bg-card rounded-lg animate-pulse"></div>
                    <div className="h-6 bg-card rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-card rounded w-1/2 animate-pulse"></div>
                </div>
            ))}
         </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {allMangas.length > 0 ? (
            allMangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">No manga found.</p>
          )}
        </div>
      )}
    </main>
  );
}
