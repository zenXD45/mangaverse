import { notFound } from 'next/navigation';
import { getChapter } from '@/lib/manga-api';
import { getMangaDexChapterPages, getMangaDexChapters } from '@/lib/mangadex-api';
import { MangaReader } from '@/components/manga/manga-reader';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

export default async function MangaReaderPage({ params }: { params: { mangaId: string, chapterId: string } }) {
  let panels: ImagePlaceholder[] = [];
  let chapterTitle = 'Chapter';
  let mangaId = params.mangaId;

  if (params.mangaId.startsWith('mangadex-')) {
      const chapterPagesDataPromise = getMangaDexChapterPages(params.chapterId);
      const chaptersPromise = getMangaDexChapters(params.mangaId.replace('mangadex-', ''));

      const [chapterPagesData, allChapters] = await Promise.all([chapterPagesDataPromise, chaptersPromise]);
      
      const currentChapterDetails = allChapters.find(c => c.id === params.chapterId);

      if (currentChapterDetails) {
        const vol = currentChapterDetails.attributes.volume ? `Vol. ${currentChapterDetails.attributes.volume} ` : '';
        const chap = currentChapterDetails.attributes.chapter ? `Ch. ${currentChapterDetails.attributes.chapter}` : '';
        const title = currentChapterDetails.attributes.title ? `: ${currentChapterDetails.attributes.title}` : '';
        chapterTitle = `${vol}${chap}${title}`;
      } else {
        chapterTitle = 'Unknown Chapter';
      }
      
      if (chapterPagesData) {
        const { hash, data: pageFiles } = chapterPagesData;
        const baseUrl = 'https://s2.mangadex.org';
        panels = pageFiles.map((filename, index) => ({
            id: `${params.chapterId}-panel-${index}`,
            imageUrl: `${baseUrl}/data/${hash}/${filename}`,
            description: `Page ${index + 1}`,
            imageHint: 'manga panel'
        }));
      }

  } else {
    const chapter = await getChapter(params.mangaId, params.chapterId);

    if (chapter && chapter.panels) {
      panels = chapter.panels;
      const title = chapter.title ? `: ${chapter.title}` : '';
      chapterTitle = `Ch. ${chapter.chapterNumber}${title}`;
      mangaId = params.mangaId;
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
