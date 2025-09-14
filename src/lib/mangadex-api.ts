// In a real scenario, you would fetch this data from the MangaDex API
'use server';

const MANGADEX_API_URL = 'https://api.mangadex.org';

// Ensure the API key is only used on the server
const MANGADEX_API_KEY = process.env.MANGADEX_API_KEY;


export interface MangaDexManga {
    id: string;
    type: string;
    attributes: {
      title: {
        en: string;
      };
      altTitles: { [key: string]: string }[];
      description: {
        en: string;
      };
      originalLanguage: string;
      lastVolume?: string | null;
      lastChapter?: string | null;
      publicationDemographic?: string | null;
      status: string;
      year?: number | null;
      contentRating: string;
      tags: any[]; // Define a proper type for tags if needed
      state: string;
      chapterNumbersResetOnNewVolume: boolean;
      createdAt: string;
      updatedAt: string;
      version: number;
      availableTranslatedLanguages: string[];
      latestUploadedChapter: string;
    };
    relationships: any[]; // Define a proper type for relationships if needed
    // Simplified properties for easier access in components
    title: { en: string }; 
    author: string; 
    coverArt: {
      imageUrl: string;
      imageHint: string;
    };
  }
  
  // This function transforms the raw API response into a more usable format
  function transformMangaData(data: any[]): MangaDexManga[] {
    if (!Array.isArray(data)) {
      return [];
    }
    return data.map(manga => {
        const authorRel = manga.relationships.find((rel: any) => rel.type === 'author');
        const coverArtRel = manga.relationships.find((rel: any) => rel.type === 'cover_art');

        const author = authorRel ? authorRel.attributes.name : 'Unknown Author';
        const coverFileName = coverArtRel ? coverArtRel.attributes.fileName : null;
        const coverUrl = coverFileName 
            ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
            : 'https://picsum.photos/seed/mangadex-fallback/600/800';

        return {
            ...manga,
            id: `mangadex-${manga.id}`, // Prefix to distinguish from local data
            title: manga.attributes.title,
            author,
            coverArt: {
                imageUrl: coverUrl,
                imageHint: 'manga cover',
            }
        };
    });
  }
  
  export async function getMangaDexCollection(title?: string): Promise<MangaDexManga[]> {
    try {
        const params = new URLSearchParams({
            'includes[]': ['cover_art', 'author'],
            'contentRating[]': ['safe', 'suggestive'],
            'order[rating]': 'desc',
            'limit': '100'
        });

        if (title) {
            params.set('title', title);
        }

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (MANGADEX_API_KEY) {
            headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
        }


        const response = await fetch(`${MANGADEX_API_URL}/manga?${params.toString()}`, {
            headers: headers,
            next: { revalidate: 3600 } // Revalidate data every hour
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('MangaDex API Error:', response.status, response.statusText, errorBody);
            return [];
        }

        const result = await response.json();
        return transformMangaData(result.data);

    } catch (error) {
        console.error('Failed to fetch from MangaDex:', error);
        return [];
    }
  }
  
  export async function getMangaDexManga(id: string): Promise<MangaDexManga | null> {
      try {
        const mangaId = id.replace('mangadex-', '');
        const params = new URLSearchParams({
            'includes[]': ['cover_art', 'author'],
        });

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        if (MANGADEX_API_KEY) {
            headers['Authorization'] = `Bearer ${MANGADEX_API_KEY}`;
        }

        const response = await fetch(`${MANGADEX_API_URL}/manga/${mangaId}?${params.toString()}`, {
            headers: headers,
            next: { revalidate: 3600 }
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