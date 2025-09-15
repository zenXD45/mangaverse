
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchKitsuMangaById } from '@/lib/kitsu-api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ChapterList } from '@/components/manga/chapter-list';

type Chapter = {
    id: string;
    chapterNumber: string;
    title: string | null;
}

export default async function MangaDetailPage({ params }: { params: { mangaId: string } }) {
    let mangaTitle, author, description, coverImageUrl, coverImageHint;
    let chapters: Chapter[] = [];

    if (!params.mangaId) {
        notFound();
    }

    const manga = await fetchKitsuMangaById(params.mangaId);
    if (!manga) {
        notFound();
    }

    mangaTitle = manga.title;
    description = manga.synopsis;
    coverImageUrl = manga.posterImage.large || manga.posterImage.medium || manga.posterImage.original;
    coverImageHint = manga.title;
    
    // Use fetched chapters from the API and sort them by chapter number
    if (manga.chapters && manga.chapters.length > 0) {
        chapters = manga.chapters
            .sort((a, b) => a.number - b.number)
            .map(ch => ({
                id: ch.id,
                chapterNumber: String(ch.number),
                title: ch.title || `Chapter ${ch.number}`
            }));
        console.log(`Found ${chapters.length} chapters for ${mangaTitle}`);
    } else {
        console.log(`No chapters found for manga: ${mangaTitle}`);
    }


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
            <Button size="lg" className="w-full mt-6 bg-accent hover:bg-accent/80">Download for Offline</Button>
          </div>
          <div className="md:col-span-2">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">{mangaTitle}</h1>
            <p className="text-lg text-muted-foreground mt-1">by {author}</p>
            <p className="mt-6 text-foreground/80 leading-relaxed">{description}</p>
            
            <div className="mt-12">
              <h2 className="text-2xl font-headline font-semibold mb-6 border-b border-border pb-2">Chapters</h2>
              <div className="max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-accent scrollbar-track-background">
                {manga.chapters && (
                  <ChapterList
                    chapters={manga.chapters}
                    mangaId={params.mangaId}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
