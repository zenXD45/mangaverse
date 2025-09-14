
'use server';

const MANGADEX_API_URL = 'https://api.mangadex.org';

const MANGADEX_API_KEY = process.env.MANGADEX_API_KEY;

export interface MangaDexManga {
  id: string;
  type: string;
  attributes: {
    title: { en: string };
    altTitles: { [key: string]: string }[];
    description: { en: string };
    originalLanguage: string;
    lastVolume?: string | null;
    lastChapter?: string | null;
    publicationDemographic?: string | null;
    status: string;
    year?: number | null;
    contentRating: string;
    tags: any[];
    state: string;
    chapterNumbersResetOnNewVolume: boolean;
    createdAt: string;
    updatedAt: string;
    version: number;
    availableTranslatedLanguages: string[];
    latestUploadedChapter: string;
  };
  relationships: any[];
  title: { en: string };
  author: string;
  coverArt: {
    imageUrl: string;
    imageHint: string;
  };
}

export interface MangaDexChapter {
    id: string;
    type: string;
    attributes: {
        volume?: string | null;
        chapter: string;
        title?: string | null;
        translatedLanguage: string;
        pages: number;
        publishAt: string;
    }
}

export interface MangaDexChapterPages {
    hash: string;
    data: string[];
    dataSaver: string[];
}


function transformMangaData(data: any[]): MangaDexManga[] {
  if (!Array.isArray(data)) return [];

  return data.map(manga => {
    const originalMangaId = manga.id;
    const authorRel = manga.relationships.find((rel: any) => rel.type === 'author');
    const coverArtRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');

    const author = authorRel ? authorRel.attributes.name : 'Unknown Author';
    const coverFileName = coverArtRel ? coverArtRel.attributes.fileName : null;
    const coverUrl = coverFileName
      ? `https://uploads.mangadex.org/covers/${originalMangaId}/${coverFileName}`
      : 'https://picsum.photos/seed/mangadex-fallback/600/800';

    return {
      ...manga,
      id: `mangadex-${originalMangaId}`,
      title: manga.attributes.title,
      author,
      coverArt: {
        imageUrl: coverUrl,
        imageHint: 'manga cover',
      },
    };
  });
}

export async function getMangaDexCollection(title?: string, limit = 20, offset = 0): Promise<{mangas: MangaDexManga[], hasMore: boolean}> {
  try {
    const params = new URLSearchParams();
    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');
    params.append('contentRating[]', 'safe');
    params.append('contentRating[]', 'suggestive');
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    params.append('order[relevance]', 'desc');
    if (title) params.append('title', title);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (MANGADEX_API_KEY) {
      headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
    }

    const response = await fetch(`${MANGADEX_API_URL}/manga?${params.toString()}`, {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('MangaDex API Error:', response.status, response.statusText, errorBody);
      return { mangas: [], hasMore: false };
    }

    const result = await response.json();
    const mangas = transformMangaData(result.data);
    const hasMore = result.total > offset + result.limit;

    return { mangas, hasMore };
  } catch (error) {
    console.error('Failed to fetch from MangaDex:', error);
    return { mangas: [], hasMore: false };
  }
}

export async function getMangaDexManga(id: string): Promise<MangaDexManga | null> {
  try {
    const mangaId = id.replace('mangadex-', '');
    const params = new URLSearchParams();

    params.append('includes[]', 'cover_art');
    params.append('includes[]', 'author');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (MANGADEX_API_KEY) {
      headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
    }

    const response = await fetch(`${MANGADEX_API_URL}/manga/${mangaId}?${params.toString()}`, {
      headers: headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('MangaDex API Error:', response.status, response.statusText, errorBody);
      return null;
    }

    const result = await response.json();
    const transformed = transformMangaData([result.data]);
    return transformed[0] || null;
  } catch (error) {
    console.error(`Failed to fetch manga ${id} from MangaDex:`, error);
    return null;
  }
}

export async function getMangaDexChapters(mangaId: string): Promise<MangaDexChapter[]> {
    try {
        const originalMangaId = mangaId.replace('mangadex-', '');
        const params = new URLSearchParams();
        params.append('translatedLanguage[]', 'en');
        params.append('order[chapter]', 'asc');
        params.append('limit', '500');
        params.append('includes[]', 'scanlation_group');
        params.append('contentRating[]', 'safe');
        params.append('contentRating[]', 'suggestive');
        params.append('contentRating[]', 'erotica');
        params.append('contentRating[]', 'pornographic');


        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (MANGADEX_API_KEY) {
            headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
        }

        const response = await fetch(`${MANGADEX_API_URL}/manga/${originalMangaId}/feed?${params.toString()}`, {
            headers,
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('MangaDex Chapters API Error:', response.status, response.statusText, errorBody);
            return [];
        }

        const result = await response.json();
        
        const chapterMap = new Map<string, any>();
        if (result.data) {
          result.data.forEach((chapter: any) => {
              const chapterNum = chapter.attributes.chapter;
              // Use chapter number and language to uniquely identify a chapter, favoring higher version numbers.
              const chapterKey = `${chapterNum}-${chapter.attributes.translatedLanguage}`;
              const existing = chapterMap.get(chapterKey);
              if (!existing || chapter.attributes.version > existing.attributes.version) {
                  chapterMap.set(chapterKey, chapter);
              }
          });
        }
        
        // Sort chapters by chapter number numerically.
        return Array.from(chapterMap.values()).sort((a,b) => parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter));

    } catch (error) {
        console.error(`Failed to fetch chapters for manga ${mangaId} from MangaDex:`, error);
        return [];
    }
}

export async function getMangaDexChapterPages(chapterId: string): Promise<MangaDexChapterPages | null> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (MANGADEX_API_KEY) {
            headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
        }

        const response = await fetch(`${MANGADEX_API_URL}/at-home/server/${chapterId}`, {
            headers,
            next: { revalidate: 3600 },
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('MangaDex Chapter Pages API Error:', response.status, response.statusText, errorBody);
            return null;
        }

        const result = await response.json();
        return result.chapter;

    } catch(error) {
        console.error(`Failed to fetch pages for chapter ${chapterId}:`, error);
        return null;
    }
}
