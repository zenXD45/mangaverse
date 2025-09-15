import { searchMangaDex, getMangaDexChapters, getMangaDexManga } from './mangadex';


const KITSU_API_URL = 'https://kitsu.io/api/edge';

export interface KitsuChapter {
  id: string;
  number: number;
  title: string;
  published: string;
}

export interface KitsuPosterImage {
  tiny: string;
  small: string;
  medium: string;
  large: string;
  original: string;
}

export interface KitsuManga {
  id: string;
  type: string;
  title: string;
  synopsis: string;
  posterImage: KitsuPosterImage;
  chapters?: KitsuChapter[];
  chapterCount?: number;
  volumeCount?: number;
  status?: string;
  startDate?: string;
}

export async function fetchKitsuChapters(mangaId: string): Promise<KitsuChapter[]> {
  const url = `${KITSU_API_URL}/manga/${mangaId}/chapters?sort=number&page[limit]=100`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const response = await res.json();
  return response.data.map((item: any) => ({
    id: item.id,
    number: item.attributes.number || 0,
    title: item.attributes.title || `Chapter ${item.attributes.number}`,
    published: item.attributes.published || new Date().toISOString(),
  }));
}

export async function fetchKitsuMangaById(id: string): Promise<KitsuManga | null> {
  try {
    if (id.startsWith('mangadex-')) {
      // Fetch from MangaDex if mangadex ID
      const mangaDexData = await getMangaDexManga(id);
      if (!mangaDexData) return null;
      const chapters = await getMangaDexChapters(id);
      const validChapters = chapters
        .map(ch => {
          if (!ch.attributes.chapter || !ch.id) return null;
          return {
            id: ch.id,
            number: parseFloat(ch.attributes.chapter),
            title: ch.attributes.title || 'Chapter ' + ch.attributes.chapter,
            published: ch.attributes.publishAt || new Date().toISOString(),
          };
        })
        .filter((ch): ch is KitsuChapter => ch !== null);
      return {
        id: mangaDexData.id,
        type: 'manga',
        title: mangaDexData.title,
        synopsis: mangaDexData.description || '',
        posterImage: {
          tiny: mangaDexData.coverArt.imageUrl.replace('.jpg', '.256.jpg'),
          small: mangaDexData.coverArt.imageUrl.replace('.jpg', '.512.jpg'),
          medium: mangaDexData.coverArt.imageUrl,
          large: mangaDexData.coverArt.imageUrl,
          original: mangaDexData.coverArt.imageUrl,
        },
        chapters: validChapters,
        chapterCount: validChapters.length,
        status: mangaDexData.attributes.status,
        startDate: mangaDexData.attributes.createdAt,
      };
    }
    // Fallback to Kitsu API for non-MangaDex IDs
    const res = await fetch(`${KITSU_API_URL}/manga/${id}`, {
      headers: {
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const mangaData = data.data;
    const chapters = await fetchKitsuChapters(mangaData.id);
    return {
      id: mangaData.id,
      type: mangaData.type,
      title:
        mangaData.attributes.canonicalTitle ||
        mangaData.attributes.titles.en ||
        mangaData.attributes.titles.en_jp,
      synopsis: mangaData.attributes.synopsis,
      posterImage: mangaData.attributes.posterImage,
      chapters,
      chapterCount: mangaData.attributes.chapterCount,
      volumeCount: mangaData.attributes.volumeCount,
      status: mangaData.attributes.status,
      startDate: mangaData.attributes.startDate,
    };
  } catch (error) {
    console.error('Error fetching manga from Kitsu:', error);
    return null;
  }
}

export async function fetchKitsuMangaCollection(query?: string): Promise<KitsuManga[]> {
  try {
    const { mangas: mangaDexResults } = await searchMangaDex(query);
    const baseUrl = 'https://kitsu.io/api/edge/manga';
    const url = query
      ? `${baseUrl}?filter[text]=${encodeURIComponent(query)}&page[limit]=20`
      : `${baseUrl}?page[limit]=20`;
    let kitsuMangas: KitsuManga[] = [];
    try {
      const res = await fetch(url);
      if (res.ok) {
        const response = await res.json();
        kitsuMangas = response.data.map((item: any) => {
          const a = item.attributes;
          return {
            id: item.id,
            type: 'manga',
            title: a.titles.en || a.titles.en_jp || a.canonicalTitle,
            synopsis: a.synopsis,
            posterImage: {
              tiny: a.posterImage?.tiny || '',
              small: a.posterImage?.small || '',
              medium: a.posterImage?.medium || '',
              large: a.posterImage?.large || '',
              original: a.posterImage?.original || '',
            },
            chapterCount: a.chapterCount,
            volumeCount: a.volumeCount,
            status: a.status,
            startDate: a.startDate,
            chapters: [],
          };
        });
      }
    } catch (kitsuError) {
      console.error('Failed to fetch from Kitsu:', kitsuError);
    }
    const allMangas = [...mangaDexResults, ...kitsuMangas];
    const uniqueMangas = Array.from(new Map(allMangas.map(m => [m.id, m])).values());
    return uniqueMangas;
  } catch (error) {
    console.error('Error fetching manga collection:', error);
    return [];
  }
}
