
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getManga } from '@/lib/manga-api';
import { getMangaDexManga, getMangaDexChapters, type MangaDexChapter } from '@/lib/mangadex-api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

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

    if (params.mangaId.startsWith('mangadex-')) {
        const mangaPromise = getMangaDexManga(params.mangaId);
        const chaptersPromise = getMangaDexChapters(params.mangaId.replace('mangadex-', ''));

        const [manga, mangaDexChapters] = await Promise.all([mangaPromise, chaptersPromise]);

        if (!manga) {
            notFound();
        }
        mangaTitle = manga.title.en;
        author = manga.author;
        description = manga.attributes.description.en;
        coverImageUrl = manga.coverArt.imageUrl;
        coverImageHint = manga.coverArt.imageHint;
        chapters = mangaDexChapters.map(ch => ({
            id: ch.id,
            chapterNumber: ch.attributes.chapter,
            title: ch.attributes.title
        }));
    } else {
        const manga = await getManga(params.mangaId);
        if (!manga) {
            notFound();
        }
        mangaTitle = manga.title;
        author = manga.author;
        description = manga.description;
        coverImageUrl = manga.coverImage?.imageUrl;
        coverImageHint = manga.coverImage?.imageHint;
        chapters = manga.chapters.map(ch => ({
            id: ch.id,
            chapterNumber: String(ch.chapterNumber),
            title: ch.title
        }));
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
              <h2 className="text-2xl font-headline font-semibold mb-4 border-b border-border pb-2">Chapters</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-4">
                {chapters && chapters.length > 0 ? chapters.map(chapter => (
                  <Link href={`/manga/${params.mangaId}/${chapter.id}`} key={chapter.id}>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-card hover:bg-secondary transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium text-primary-foreground">Chapter {chapter.chapterNumber}</p>
                        {chapter.title && <p className="text-sm text-muted-foreground">{chapter.title}</p>}
                      </div>
                      <BookOpen className="h-5 w-5 text-accent" />
                    </div>
                  </Link>
                )) : (
                    <p className="text-muted-foreground">Chapters for this series are not yet available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
