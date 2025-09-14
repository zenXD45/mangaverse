import { notFound } from 'next/navigation';
import { getChapter, getManga } from '@/lib/manga-api';
import { MangaReader } from '@/components/manga/manga-reader';

export default async function MangaReaderPage({ params }: { params: { mangaId: string, chapterId: string } }) {
  const chapter = await getChapter(params.mangaId, params.chapterId);
  const manga = await getManga(params.mangaId);

  if (!chapter || !chapter.panels || !manga) {
    notFound();
  }
  
  return (
    <MangaReader 
      panels={chapter.panels} 
      mangaId={manga.id} 
      chapterTitle={`Ch. ${chapter.chapterNumber}: ${chapter.title}`} 
    />
  );
}
