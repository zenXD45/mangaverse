

'use server';

const MANGADEX_API_URL = 'https://api.mangadex.org';

const MANGADEX_API_KEY = typeof (globalThis as any).process !== 'undefined' && (globalThis as any).process.env ? (globalThis as any).process.env.MANGADEX_API_KEY : '';

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
        version: number;
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
    // Always use the raw MangaDex ID for cover image URL
    const rawMangaId = manga.id;
    const authorRel = manga.relationships.find((rel: any) => rel.type === 'author');
    const coverArtRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');

    const author = authorRel ? authorRel.attributes.name : 'Unknown Author';
    let coverUrl = 'https://picsum.photos/seed/mangadex-fallback/600/800';
    if (coverArtRel && coverArtRel.attributes.fileName) {
      coverUrl = `https://uploads.mangadex.org/covers/${rawMangaId}/${coverArtRel.attributes.fileName}`;
    }

    return {
      ...manga,
      id: `mangadex-${rawMangaId}`,
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
      headers
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
  if (!id || !id.startsWith('mangadex-')) return null;
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
      headers: headers
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
        params.append('limit', '1000'); // Increased limit to get more chapters
        params.append('includes[]', 'scanlation_group');
        params.append('contentRating[]', 'safe');
        params.append('contentRating[]', 'suggestive');
        params.append('offset', '0');

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };
        if (MANGADEX_API_KEY) {
            headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
        }

        // Function to fetch a single page of chapters
        async function fetchChapterPage(offset: number): Promise<MangaDexChapter[]> {
            params.set('offset', offset.toString());
            const response = await fetch(`${MANGADEX_API_URL}/manga/${originalMangaId}/feed?${params.toString()}`, {
                headers
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('MangaDex Chapters API Error:', response.status, response.statusText, errorBody);
                return [];
            }

            const result = await response.json();
            return result.data || [];
        }

        // Fetch first page to get total
        const firstPage = await fetch(`${MANGADEX_API_URL}/manga/${originalMangaId}/feed?${params.toString()}`, {
            headers
        });

        if (!firstPage.ok) {
            console.error('Failed to fetch first page:', firstPage.status);
            return [];
        }

        const firstPageData = await firstPage.json();
        const total = firstPageData.total;
        const limit = 500;
        const pages = Math.ceil(total / limit);
        
        console.log(`Fetching ${total} chapters in ${pages} pages`);

        // Fetch all pages in parallel
        const fetchPromises = [];
        for (let i = 0; i < pages; i++) {
            fetchPromises.push(fetchChapterPage(i * limit));
        }

        const allChaptersArrays = await Promise.all(fetchPromises);
        const allChapters = allChaptersArrays.flat();

        // Deduplicate chapters
        const chapterMap = new Map<string, MangaDexChapter>();
        allChapters.forEach((chapter: MangaDexChapter) => {
            const chapterNum = chapter.attributes.chapter;
            if (!chapterNum) return; // Skip chapters without numbers

            const chapterKey = `${chapterNum}-${chapter.attributes.translatedLanguage}`;
            const existing = chapterMap.get(chapterKey);
            if (!existing || chapter.attributes.version > existing.attributes.version) {
                chapterMap.set(chapterKey, chapter);
            }
        });
        
        console.log(`Found ${chapterMap.size} unique chapters`);
        return Array.from(chapterMap.values())
            .sort((a, b) => parseFloat(a.attributes.chapter) - parseFloat(b.attributes.chapter));

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
      headers
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
