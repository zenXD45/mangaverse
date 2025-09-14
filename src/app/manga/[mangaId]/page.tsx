import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getManga } from '@/lib/manga-api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default async function MangaDetailPage({ params }: { params: { mangaId: string } }) {
  const manga = await getManga(params.mangaId);

  if (!manga) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Link>
        </Button>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="md:col-span-1">
            {manga.coverImage && (
              <Image
                src={manga.coverImage.imageUrl}
                alt={`Cover for ${manga.title}`}
                width={600}
                height={800}
                className="rounded-lg shadow-2xl shadow-black/30 w-full"
                data-ai-hint={manga.coverImage.imageHint}
              />
            )}
            <Button size="lg" className="w-full mt-6 bg-accent hover:bg-accent/80">Download for Offline</Button>
          </div>
          <div className="md:col-span-2">
            <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary">{manga.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">by {manga.author}</p>
            <p className="mt-6 text-foreground/80 leading-relaxed">{manga.description}</p>
            
            <div className="mt-12">
              <h2 className="text-2xl font-headline font-semibold mb-4 border-b border-border pb-2">Chapters</h2>
              <div className="space-y-3">
                {manga.chapters.map(chapter => (
                  <Link href={`/manga/${manga.id}/${chapter.id}`} key={chapter.id}>
                    <div className="flex justify-between items-center p-4 rounded-lg bg-card hover:bg-secondary transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium text-primary-foreground">Chapter {chapter.chapterNumber}</p>
                        <p className="text-sm text-muted-foreground">{chapter.title}</p>
                      </div>
                      <BookOpen className="h-5 w-5 text-accent" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
