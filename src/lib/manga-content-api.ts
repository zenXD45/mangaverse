import { getMangaDexPages } from './mangadex';

export interface MangaChapterContent {
  id: string;
  title: string;
  pages: string[];
}

interface MangaDexChapterAttributes {
  volume: string | null;
  chapter: string | null;
  title: string | null;
  translatedLanguage: string;
  pages: number;
}

interface MangaDexChapter {
  id: string;
  type: 'chapter';
  attributes: MangaDexChapterAttributes;
}

interface MangaDexChapterResponse {
  data: MangaDexChapter[];
}

interface MangaDexAtHomeData {
  baseUrl: string;
  chapter: {
    hash: string;
    data: string[];
  };
}

// Search for manga and get chapter feed URL
async function searchManga(title: string) {
  try {
    const searchUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(title)}&limit=1&contentRating[]=safe&contentRating[]=suggestive&includes[]=cover_art`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) {
      console.error('Search failed:', searchRes.status, searchRes.statusText);
      return null;
    }

    const data = await searchRes.json();
    if (data.data && data.data.length > 0) {
      const mangaId = data.data[0].id;
      // Get chapter list
      return `https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc`;
    }

    console.error('No manga found for title:', title);
    return null;
  } catch (error) {
    console.error('Search error:', error);
    return null;
  }
}

// Find chapter ID by number from a feed URL
async function getChapterLink(chaptersUrl: string, targetChapterNumber: string) {
  try {
    const chaptersRes = await fetch(chaptersUrl);
    if (!chaptersRes.ok) {
      console.error('Chapters fetch failed:', chaptersRes.status, chaptersRes.statusText);
      return null;
    }

    const data = await chaptersRes.json();
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid chapters response:', data);
      return null;
    }

    const chapter = (data as MangaDexChapterResponse).data.find((ch: MangaDexChapter) =>
      ch.attributes.chapter === targetChapterNumber || String(ch.attributes.chapter) === targetChapterNumber
    );

    if (chapter) {
      return chapter.id;
    }

    console.error('Chapter not found:', targetChapterNumber);
    return null;
  } catch (error) {
    console.error('Chapter link error:', error);
    return null;
  }
}

// Fetch MangaDex chapter images by chapter ID
async function getChapterPages(chapterId: string): Promise<string[] | null> {
  try {
    const atHomeUrl = `https://api.mangadex.org/at-home/server/${chapterId}`;
    const atHomeRes = await fetch(atHomeUrl);

    if (!atHomeRes.ok) {
      throw new Error(`Failed to get chapter images: ${atHomeRes.status}`);
    }

    const atHomeData: MangaDexAtHomeData = await atHomeRes.json();
    const baseUrl = atHomeData.baseUrl;
    const hash = atHomeData.chapter.hash;
    const pages = atHomeData.chapter.data.map((filename: string) =>
      `${baseUrl}/data/${hash}/${filename}`
    );

    return pages.length > 0 ? pages : null;
  } catch (error) {
    console.error('Error fetching chapter pages:', error);
    return null;
  }
}

// Main exported function
export async function fetchMangaChapterContent(mangaTitle: string, chapterNumber: string): Promise<MangaChapterContent | null> {
  try {
    console.log('Fetching manga content for:', mangaTitle, 'chapter:', chapterNumber);

    // If input is a direct MangaDex chapter ID (UUID format)
    if (/^[0-9a-f-]{36}$/.test(chapterNumber)) {
      const pages = await getChapterPages(chapterNumber);
      if (pages && pages.length > 0) {
        return {
          id: chapterNumber,
          title: `Chapter ${chapterNumber}`,
          pages
        };
      } else {
        throw new Error('No images found for this chapter');
      }
    }

    // If input is a title, search MangaDex for chapters
    const chaptersUrl = await searchManga(mangaTitle);
    if (!chaptersUrl) {
      throw new Error('Could not find manga: ' + mangaTitle);
    }

    const chapterId = await getChapterLink(chaptersUrl, chapterNumber);
    if (!chapterId) {
      throw new Error('Could not find chapter: ' + chapterNumber);
    }

    const pages = await getChapterPages(chapterId);
    if (!pages || pages.length === 0) {
      throw new Error('No images found for chapter');
    }

    return {
      id: chapterId,
      title: `Chapter ${chapterNumber}`,
      pages
    };
  } catch (error) {
    console.error('Error fetching manga content:', error);
    return null;
  }
}
