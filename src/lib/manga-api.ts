import data from '@/data/mangas.json';
import { PlaceHolderImages, type ImagePlaceholder } from '@/lib/placeholder-images';

export interface Chapter {
  id: string;
  title: string;
  chapterNumber: number;
  panelIds: string[];
  panels?: ImagePlaceholder[];
}

export interface Manga {
  id: string;
  title: string;
  author: string;
  description: string;
  coverImageId: string;
  coverImage?: ImagePlaceholder;
  chapters: Chapter[];
  chapterCount?: number;
  volumeCount?: number;
  status?: string;
  startDate?: string;
}

const imageMap = new Map(PlaceHolderImages.map(img => [img.id, img]));
const DEFAULT_COVER_IMAGE = PlaceHolderImages.length ? PlaceHolderImages[0] : undefined;

export async function getMangas(): Promise<Manga[]> {
  return data.mangas.map(manga => ({
    ...manga,
    coverImage: imageMap.get(manga.coverImageId) ?? DEFAULT_COVER_IMAGE,
  })) as Manga[];
}

export async function getManga(id: string): Promise<Manga | null> {
  const mangaData = data.mangas.find(m => m.id === id);
  if (!mangaData) return null;
  return {
    ...mangaData,
    coverImage: imageMap.get(mangaData.coverImageId) ?? DEFAULT_COVER_IMAGE,
  } as Manga;
}

export async function getChapter(mangaId: string, chapterId: string): Promise<Chapter | null> {
  const mangaData = data.mangas.find(m => m.id === mangaId);
  if (!mangaData) return null;
  const chapterData = mangaData.chapters.find(c => c.id === chapterId);
  if (!chapterData) return null;

  const panels = chapterData.panelIds
    .map(id => imageMap.get(id))
    .filter((img): img is ImagePlaceholder => !!img);

  return {
    ...chapterData,
    panels,
  };
}
