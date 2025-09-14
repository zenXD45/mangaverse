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
}

const imageMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

// Simulate API latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getMangas(): Promise<Manga[]> {
  await delay(100);
  const mangas = data.mangas.map(manga => ({
    ...manga,
    coverImage: imageMap.get(manga.coverImageId)
  }));
  return mangas as Manga[];
}

export async function getManga(id: string): Promise<Manga | null> {
  await delay(100);
  const mangaData = data.mangas.find(m => m.id === id);
  if (!mangaData) {
    return null;
  }
  return {
    ...mangaData,
    coverImage: imageMap.get(mangaData.coverImageId)
  } as Manga;
}

export async function getChapter(mangaId: string, chapterId: string): Promise<Chapter | null> {
  await delay(100);
  const mangaData = data.mangas.find(m => m.id === mangaId);
  if (!mangaData) {
    return null;
  }
  const chapterData = mangaData.chapters.find(c => c.id === chapterId);
  if (!chapterData) {
    return null;
  }

  const panels = chapterData.panelIds.map(id => imageMap.get(id)).filter(Boolean) as ImagePlaceholder[];
  
  return {
    ...chapterData,
    panels
  };
}
