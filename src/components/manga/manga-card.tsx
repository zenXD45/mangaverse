import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Manga } from '@/lib/manga-api';
import { type MangaDexManga } from '@/lib/mangadex-api';

type MangaCardProps = {
  manga: Manga | MangaDexManga;
};

function isMangaDex(manga: Manga | MangaDexManga): manga is MangaDexManga {
    return 'coverArt' in manga;
}

export function MangaCard({ manga }: MangaCardProps) {
    const mangaId = manga.id;
    let coverUrl: string | undefined;
    let coverHint: string | undefined;
    let title: string;
    let author: string | undefined;

    if (isMangaDex(manga)) {
        coverUrl = manga.coverArt.imageUrl;
        coverHint = manga.coverArt.imageHint;
        title = manga.title.en;
        author = manga.author;
    } else {
        coverUrl = manga.coverImage?.imageUrl;
        coverHint = manga.coverImage?.imageHint;
        title = manga.title;
        author = manga.author;
    }


  return (
    <Link href={`/manga/${mangaId}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:border-primary hover:shadow-lg hover:shadow-accent/20">
        <CardHeader className="p-0">
          <div className="aspect-[3/4] relative">
            {coverUrl && (
              <Image
                src={coverUrl}
                alt={`Cover for ${title}`}
                width={600}
                height={800}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={coverHint}
              />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          {author && <p className="text-sm text-muted-foreground mt-1">{author}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}
