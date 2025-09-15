import { notFound } from 'next/navigation';
import { fetchKitsuMangaById } from '@/lib/kitsu-api';
import { fetchMangaChapterContent } from '@/lib/manga-content-api';
import { MangaReader } from '@/components/manga/manga-reader';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { DownloadPanelsButton } from '@/components/manga/DownloadPanelsButton';

type MangaReaderPageProps = {
  params: { mangaId: string; chapterId: string };
};

export default async function MangaReaderPage({ params }: MangaReaderPageProps) {
  // Await params for Next.js 15+
  const { mangaId, chapterId } = await params;

  if (!mangaId || !chapterId) {
    notFound();
  }

  try {
    // Fetch manga details
    const manga = await fetchKitsuMangaById(mangaId);
    if (!manga) {
      console.error('Manga not found:', mangaId);
      notFound();
    }

    // Fetch chapter content (pages)
    const chapterContent = await fetchMangaChapterContent(manga.id, chapterId);
    if (!chapterContent || !chapterContent.pages || chapterContent.pages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">No panels available for this chapter.</h2>
          <p className="text-muted-foreground">
            This chapter may not have any images, or there was an error fetching them.
          </p>
        </div>
      );
    }

    // Map pages into panels for MangaReader
    const panels: ImagePlaceholder[] = chapterContent.pages.map((imageUrl, index) => ({
      id: `${chapterId}-panel-${index}`,
      imageUrl,
      description: `Page ${index + 1}`,
      imageHint: 'manga panel',
    }));

    const chapterTitle = chapterContent.title || `Chapter ${chapterId}`;

    return (
      <div>
        <div className="flex justify-end mb-4">
          <DownloadPanelsButton panels={panels} chapterTitle={chapterTitle} />
        </div>
        <MangaReader panels={panels} mangaId={mangaId} chapterTitle={chapterTitle} />
      </div>
    );
  } catch (error) {
    console.error('Error loading chapter:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Error loading chapter</h2>
        <p className="text-muted-foreground">
          There was an error loading the manga content. Please try again later.
        </p>
      </div>
    );
  }
}
