import { notFound } from 'next/navigation';
import { getChapter, getManga } from '@/lib/manga-api';
import { getMangaDexChapterPages, getMangaDexChapters } from '@/lib/mangadex-api';
import { MangaReader } from '@/components/manga/manga-reader';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export default async function MangaReaderPage({ params }: { params: { mangaId: string, chapterId: string } }) {
  let panels: ImagePlaceholder[] = [];
  let chapterTitle = 'Chapter';
  let mangaId = params.mangaId;

  if (params.mangaId.startsWith('mangadex-')) {
      const chapterPagesData = await getMangaDexChapterPages(params.chapterId);
      
      // We also need the chapter details to show the title
      const allChapters = await getMangaDexChapters(params.mangaId);
      const currentChapterDetails = allChapters.find(c => c.id === params.chapterId);

      if (currentChapterDetails) {
        chapterTitle = `Ch. ${currentChapterDetails.attributes.chapter}: ${currentChapterDetails.attributes.title || ''}`;
      }
      
      if (chapterPagesData) {
        const { hash, data: pageFiles } = chapterPagesData;
        const baseUrl = 'https://uploads.mangadex.org';
        panels = pageFiles.map((filename, index) => ({
            id: `${params.chapterId}-panel-${index}`,
            imageUrl: `${baseUrl}/data/${hash}/${filename}`,
            description: `Page ${index + 1}`,
            imageHint: 'manga panel'
        }));
      }

  } else {
    const chapter = await getChapter(params.mangaId, params.chapterId);
    const manga = await getManga(params.mangaId);

    if (chapter && chapter.panels && manga) {
      panels = chapter.panels;
      chapterTitle = `Ch. ${chapter.chapterNumber}: ${chapter.title}`;
      mangaId = manga.id;
    }
  }

  if (panels.length === 0) {
    notFound();
  }
  
  return (
    <MangaReader 
      panels={panels} 
      mangaId={mangaId} 
      chapterTitle={chapterTitle} 
    />
  );
}
