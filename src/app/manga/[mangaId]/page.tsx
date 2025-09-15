import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchKitsuMangaById } from '@/lib/kitsu-api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChapterList } from '@/components/manga/chapter-list';
import type { Chapter } from '@/lib/manga-api';
import type { KitsuChapter } from '@/lib/kitsu-api';

type MangaDetailPageProps = {
  params: { mangaId: string };
};

// Helper: map KitsuChapter[] to your local Chapter[] type (if you need local chapters)
// Omit if not needed in UI, here we only prepare for possible use.
function mapKitsuToLocalChapters(kitsuChapters?: KitsuChapter[]): Chapter[] {
  if (!kitsuChapters) return [];
  return kitsuChapters.map(ch => ({
    id: ch.id,
    title: ch.title,
    chapterNumber: ch.number,
    panelIds: [], // If you have panel IDs add here
  }));
}

export default async function MangaDetailPage({ params }: MangaDetailPageProps) {
  const { mangaId } = await params;

  if (!mangaId) {
    notFound();
  }

  const manga = await fetchKitsuMangaById(mangaId);
  if (!manga) {
    notFound();
  }

  const mangaTitle = manga.title;
  const description = manga.synopsis;
  const coverImageUrl = manga.posterImage.large || manga.posterImage.medium || manga.posterImage.original || '';
  const coverImageHint = manga.title;
  const author = (manga as any).author ?? 'Unknown Author';

  // Use KitsuChapter[] as received and sort ascending by number
  const chapters: KitsuChapter[] = (manga.chapters || [])
    .slice()
    .sort((a, b) => a.number - b.number);

  if (!mangaTitle) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/library">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-1">
            {coverImageUrl && (
              <Image
                src={coverImageUrl}
                alt={`Cover for ${mangaTitle}`}
                width={600}
                height={800}
                className="rounded-lg shadow-2xl shadow-black/30 w-full"
                data-ai-hint={coverImageHint}
              />
            )}
            <Button size="lg" className="w-full mt-6 bg-accent hover:bg-accent/80">
              Download for Offline
            </Button>
          </div>
          <div className="md:col-span-2">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">{mangaTitle}</h1>
            <p className="text-lg text-muted-foreground mt-1">by {author}</p>
            <p className="mt-6 text-foreground/80 leading-relaxed">{description}</p>

            <div className="mt-12">
              <h2 className="text-2xl font-headline font-semibold mb-6 border-b border-border pb-2">Chapters</h2>
              <div className="max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent scrollbar-track-background">
                <ChapterList chapters={chapters} mangaId={mangaId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
