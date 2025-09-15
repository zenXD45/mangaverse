import { notFound } from 'next/navigation';
import { fetchKitsuMangaById } from '@/lib/kitsu-api';
import { fetchMangaChapterContent } from '@/lib/manga-content-api';
import { MangaReader } from '@/components/manga/manga-reader';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { DownloadPanelsButton } from '@/components/manga/DownloadPanelsButton';

export default async function MangaReaderPage({ params }: { params: { mangaId: string, chapterId: string } }) {
  // Validate params early to avoid Next.js warning
  if (!params?.mangaId || !params?.chapterId) {
    notFound();
  }

  let panels: ImagePlaceholder[] = [];
  let chapterTitle = `Chapter ${params.chapterId}`;
  let mangaId = params.mangaId;

  try {
    // Fetch manga details to get the title
    const manga = await fetchKitsuMangaById(params.mangaId);
    if (!manga) {
      console.error('Manga not found:', params.mangaId);
      notFound();
    }

    // Fetch chapter content from the manga provider
    console.log('Fetching content for manga:', manga.id, 'chapter:', params.chapterId);
    const chapterContent = await fetchMangaChapterContent(manga.id, params.chapterId);
    
    if (!chapterContent || !chapterContent.pages || chapterContent.pages.length === 0) {
      console.warn('No panels found for chapter:', params.chapterId);
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">No panels available for this chapter.</h2>
          <p className="text-muted-foreground">This chapter may not have any images, or there was an error fetching them.</p>
        </div>
      );
    }

    panels = chapterContent.pages.map((imageUrl, index) => ({
      id: `${params.chapterId}-panel-${index}`,
      imageUrl: imageUrl,
      description: `Page ${index + 1}`,
      imageHint: 'manga panel'
    }));
    chapterTitle = chapterContent.title;

    return (
      <div>
        <div className="flex justify-end mb-4">
          <DownloadPanelsButton panels={panels} chapterTitle={chapterTitle} />
        </div>
        <MangaReader 
          panels={panels} 
          mangaId={mangaId} 
          chapterTitle={chapterTitle} 
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading chapter:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Error loading chapter</h2>
        <p className="text-muted-foreground">There was an error loading the manga content. Please try again later.</p>
      </div>
    );
  }
}
