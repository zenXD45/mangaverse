import { searchMangaDex, getMangaDexChapters, getMangaDexManga } from "./mangadex";

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

async function fetchKitsuChapters(mangaId: string): Promise<KitsuChapter[]> {
  const url = `${KITSU_API_URL}/manga/${mangaId}/chapters?sort=number&page[limit]=100`;
  const res = await fetch(url);
  if (!res.ok) return [];

  const response = await res.json();
  return response.data.map((item: any) => ({
    id: item.id,
    number: item.attributes.number || 0,
    title: item.attributes.title || `Chapter ${item.attributes.number}`,
    published: item.attributes.published || new Date().toISOString()
  }));
}

// Helper function to create fallback poster image object
function createPosterImage(url: string): KitsuPosterImage {
  return {
    tiny: url,
    small: url,
    medium: url,
    large: url,
    original: url
  };
}

export async function fetchKitsuMangaById(id: string): Promise<KitsuManga | null> {
  try {
    // First try MangaDex if it's a MangaDex ID
    if (id.startsWith('mangadex-')) {
      console.log('Fetching manga from MangaDex:', id);
      const mangaDexData = await getMangaDexManga(id);
      if (mangaDexData) {
        // Fetch chapters from MangaDex
        console.log('Fetching chapters for manga:', mangaDexData.id);
        const chapters = await getMangaDexChapters(id);
        console.log('Found chapters:', chapters.length);
        
        // Transform MangaDex data to Kitsu format
        // Convert chapters, filtering out any invalid entries
        const validChapters = chapters
          .map(ch => {
            // Skip any chapter without a valid number or ID
            if (!ch.attributes.chapter || !ch.id) {
              console.log('Skipping invalid chapter:', ch.id);
              return null;
            }
            return {
              id: ch.id,
              number: parseFloat(ch.attributes.chapter),
              title: ch.attributes.title || 'Chapter ' + ch.attributes.chapter,
              published: ch.attributes.publishAt || new Date().toISOString()
            };
          })
          .filter((ch): ch is KitsuChapter => ch !== null);

        console.log('Valid chapters:', validChapters.length);
        
        const result = {
          id: mangaDexData.id,
          type: 'manga',
          title: mangaDexData.title,
          synopsis: mangaDexData.description || '',
          posterImage: {
            tiny: mangaDexData.coverArt.imageUrl.replace('.jpg', '.256.jpg'),
            small: mangaDexData.coverArt.imageUrl.replace('.jpg', '.512.jpg'),
            medium: mangaDexData.coverArt.imageUrl,
            large: mangaDexData.coverArt.imageUrl,
            original: mangaDexData.coverArt.imageUrl
          },
          chapters: validChapters,
          chapterCount: validChapters.length,
          status: mangaDexData.attributes.status,
          startDate: mangaDexData.attributes.createdAt
        };
        
        console.log('Returning manga with', result.chapters.length, 'chapters');
        return result;
      }
    }

    // Fallback to Kitsu API for non-MangaDex IDs
    const response = await fetch(`${KITSU_API_URL}/manga/${id}`, {
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch manga from Kitsu:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const mangaData = data.data;
    
    // Fetch chapters for Kitsu manga
    const chapters = await fetchKitsuChapters(mangaData.id);
    
    // Convert Kitsu data to our format
    return {
      id: mangaData.id,
      type: mangaData.type,
      title: mangaData.attributes.canonicalTitle || mangaData.attributes.titles.en || mangaData.attributes.titles.en_jp,
      synopsis: mangaData.attributes.synopsis,
      posterImage: mangaData.attributes.posterImage,
      chapters: chapters,
      chapterCount: mangaData.attributes.chapterCount,
      volumeCount: mangaData.attributes.volumeCount,
      status: mangaData.attributes.status,
      startDate: mangaData.attributes.startDate
    };
  } catch (error) {
    console.error('Error fetching manga from Kitsu:', error);
    return null;
  }
}

// Fetch manga collection from Kitsu and MangaDex
export async function fetchKitsuMangaCollection(query?: string): Promise<KitsuManga[]> {
  try {
    // Use MangaDex as primary source
    const { mangas: mangaDexResults } = await searchMangaDex(query);

    // Fetch from Kitsu as backup/additional source
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
          const attributes = item.attributes;
          return {
            id: item.id,
            type: 'manga',
            title: attributes.titles.en || attributes.titles.en_jp || attributes.canonicalTitle,
            synopsis: attributes.synopsis,
            posterImage: {
              tiny: attributes.posterImage?.tiny || '',
              small: attributes.posterImage?.small || '',
              medium: attributes.posterImage?.medium || '',
              large: attributes.posterImage?.large || '',
              original: attributes.posterImage?.original || '',
            },
            chapterCount: attributes.chapterCount,
            volumeCount: attributes.volumeCount,
            status: attributes.status,
            startDate: attributes.startDate,
            chapters: [] // Chapters will be loaded on demand
          };
        });
      }
    } catch (kitsuError) {
      console.error('Failed to fetch from Kitsu:', kitsuError);
      // Continue with MangaDex results only
    }

    // Combine and deduplicate results, preferring MangaDex entries
    const allMangas = [...mangaDexResults, ...kitsuMangas];
    const uniqueMangas = Array.from(new Map(allMangas.map(manga => [manga.id, manga])).values());
    
    console.log(`Found ${mangaDexResults.length} manga from MangaDex and ${kitsuMangas.length} from Kitsu`);
    return uniqueMangas;
    
  } catch (error) {
    console.error('Error fetching manga collection:', error);
    return [];
  }
}
