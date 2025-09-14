import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Manga } from '@/lib/manga-api';

type MangaCardProps = {
  manga: Manga;
};

export function MangaCard({ manga }: MangaCardProps) {
  return (
    <Link href={`/manga/${manga.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:shadow-accent/20">
        <CardHeader className="p-0">
          <div className="aspect-[3/4] relative">
            {manga.coverImage && (
              <Image
                src={manga.coverImage.imageUrl}
                alt={`Cover for ${manga.title}`}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={manga.coverImage.imageHint}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
            {manga.title}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">{manga.author}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
