interface MangaDexCover {
  id: string;
  type: 'cover_art';
  attributes: {
    description: string;
    fileName: string;
    volume: string | null;
  };
}

interface MangaDexChapter {
  id: string;
  type: 'chapter';
  attributes: {
    volume: string | null;
    chapter: string | null;
    title: string | null;
    translatedLanguage: string;
    externalUrl: string | null;
    publishAt: string;
    createdAt: string;
    pages: number;
  };
  relationships: {
    id: string;
    type: string;
  }[];
}

interface MangaDexManga {
  id: string;
  type: 'manga';
  attributes: {
    title: {
      en: string;
      [key: string]: string;
    };
    description: {
      en: string;
      [key: string]: string;
    };
    lastChapter: string | null;
    status: string;
    year: number | null;
    contentRating: string;
    originalLanguage: string;
    createdAt: string;
  };
  relationships: {
    id: string;
    type: string;
  }[];
}

interface MangaDexResponse<T> {
  result: 'ok' | 'error';
  response: 'collection' | 'entity';
  data: T[];
  limit: number;
  offset: number;
  total: number;
}

export async function getMangaDexManga(mangaId: string) {
  try {
    const cleanId = mangaId.replace('mangadex-', '');
    const response = await fetch(`https://api.mangadex.org/manga/${cleanId}?includes[]=cover_art&includes[]=author`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch manga: ${response.status}`);
    }

    const data = await response.json();
    if (data.result !== 'ok') {
      throw new Error('Invalid manga data');
    }

    const manga = data.data as MangaDexManga;
    const cover = data.data.relationships.find(rel => rel.type === 'cover_art') as MangaDexCover;
    const coverFileName = cover?.attributes.fileName;

    const coverUrl = coverFileName
      ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`
      : null;

    return {
      id: `mangadex-${manga.id}`,
      title: manga.attributes.title.en || Object.values(manga.attributes.title)[0],
      description: manga.attributes.description?.en || Object.values(manga.attributes.description || {})[0] || '',
      coverArt: {
        id: cover?.id || '',
        imageUrl: coverUrl || '',
        description: cover?.attributes.description || '',
      },
      attributes: {
        ...manga.attributes,
        status: manga.attributes.status || 'unknown',
        createdAt: manga.attributes.createdAt || new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Failed to fetch MangaDex manga:', error);
    return null;
  }
}

export async function getMangaDexChapters(mangaId: string) {
  try {
    const cleanId = mangaId.replace('mangadex-', '');
    const response = await fetch(
      `https://api.mangadex.org/manga/${cleanId}/feed?translatedLanguage[]=en&order[volume]=desc&order[chapter]=desc&includes[]=scanlation_group`, {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch chapters: ${response.status}`);
    }

    const data = await response.json();
    if (data.result !== 'ok') {
      throw new Error('Invalid chapter data');
    }

    return data.data as MangaDexChapter[];
  } catch (error) {
    console.error('Failed to fetch MangaDex chapters:', error);
    return [];
  }
}

export async function getMangaDexPages(chapterId: string) {
  try {
    // Get chapter pages from MangaDex at-home server
    const response = await fetch(`https://api.mangadex.org/at-home/server/${chapterId}`);
    if (!response.ok) {
      throw new Error(`Failed to get chapter server: ${response.status}`);
    }

    const data = await response.json();
    const { baseUrl, chapter } = data;
    
    // Build image URLs
    const pageUrls = chapter.data.map((filename: string) => 
      `${baseUrl}/data/${chapter.hash}/${filename}`
    );

    // Test that we can access the first image
    try {
      const testResponse = await fetch(pageUrls[0], { method: 'HEAD' });
      if (!testResponse.ok) {
        throw new Error(`Failed to access image: ${testResponse.status}`);
      }
    } catch (error) {
      console.error('Failed to access chapter images:', error);
      return [];
    }

    return pageUrls;
  } catch (error) {
    console.error('Failed to fetch MangaDex pages:', error);
    return [];
  }
}

export async function searchMangaDex(query?: string) {
  try {
    const params = new URLSearchParams({
      limit: '30',
      offset: '0',
      contentRating: 'safe',
      'includes[]': 'cover_art',
      'order[relevance]': 'desc',
    });

    if (query) {
      params.append('title', query);
    }

    const response = await fetch(`https://api.mangadex.org/manga?${params}`, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json() as MangaDexResponse<MangaDexManga>;
    
    // Map the response to our format
    const mangas = await Promise.all(data.data.map(async (manga) => {
      const cover = manga.relationships.find(rel => rel.type === 'cover_art') as MangaDexCover;
      const coverFileName = cover?.attributes.fileName;
      
      return {
        id: `mangadex-${manga.id}`,
        type: 'manga',
        title: manga.attributes.title.en,
        synopsis: manga.attributes.description.en,
        posterImage: {
          tiny: `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.256.jpg`,
          small: `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.512.jpg`,
          medium: `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`,
          large: `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`,
          original: `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}`,
        },
        status: manga.attributes.status,
        startDate: manga.attributes.createdAt,
        chapterCount: manga.attributes.lastChapter ? parseInt(manga.attributes.lastChapter) : undefined,
      };
    }));

    return {
      mangas,
      total: data.total,
      hasNextPage: data.offset + data.limit < data.total,
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      mangas: [],
      total: 0,
      hasNextPage: false,
    };
  }
}