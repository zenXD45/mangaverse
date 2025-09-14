import { getMangaDexCollection } from '@/lib/mangadex-api';
import { MangaCard } from '@/components/manga/manga-card';

export default async function Home() {
  const mangas = await getMangaDexCollection();

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-headline font-bold text-primary">
          MangaVerse
        </h1>
        <p className="text-muted-foreground mt-2">
          Your portal to captivating worlds.
        </p>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {mangas.map((manga) => (
          <MangaCard key={manga.id} manga={manga} />
        ))}
      </div>
    </main>
  );
}
