import { load } from 'cheerio';
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

async function searchManga(title: string) {
  try {
    // Using MangaDex API for better search results
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
      const chaptersUrl = `https://api.mangadex.org/manga/${mangaId}/feed?translatedLanguage[]=en&order[chapter]=asc`;
      console.log('Found manga, fetching chapters from:', chaptersUrl);
      return chaptersUrl;
    }
    
    console.error('No manga found for title:', title);
    return null;
  } catch (error) {
    console.error('Search error:', error);
    return null;
  }
}

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

    // Find the chapter that matches our target number
    const chapter = (data as MangaDexChapterResponse).data.find((ch: MangaDexChapter) => 
      ch.attributes.chapter === targetChapterNumber || 
      String(ch.attributes.chapter) === targetChapterNumber
    );

    if (chapter) {
      const chapterId = chapter.id;
      console.log('Found chapter:', chapterId);
      return chapterId;
    }

    console.error('Chapter not found:', targetChapterNumber);
    return null;
  } catch (error) {
    console.error('Chapter link error:', error);
    return null;
  }
}

export async function fetchMangaChapterContent(mangaTitle: string, chapterNumber: string): Promise<MangaChapterContent | null> {
  try {
    console.log('Fetching manga content for:', mangaTitle, 'chapter:', chapterNumber);
    
    // First try direct MangaDex API if we have a MangaDex ID
    if (mangaTitle.startsWith('mangadex-')) {
      console.log('Fetching MangaDex chapter pages for chapter:', chapterNumber);
      const pages = await getMangaDexPages(chapterNumber);
      
      if (pages && pages.length > 0) {
        return {
          id: chapterNumber,
          title: `Chapter ${chapterNumber}`,
          pages: pages
        };
      }

      const chapterData = await chapterSearchRes.json();
      if (!chapterData.data || !Array.isArray(chapterData.data)) {
        throw new Error('Invalid chapter data format');
      }

      const chapter = chapterData.data.find((ch: MangaDexChapter) => String(ch.attributes.chapter) === chapterNumber);
      if (!chapter) {
        throw new Error(`Chapter ${chapterNumber} not found`);
      }

      // Get chapter images
      const atHomeUrl = `https://api.mangadex.org/at-home/server/${chapter.id}`;
      console.log('Getting chapter pages from:', atHomeUrl);
      
      const atHomeRes = await fetch(atHomeUrl);
      if (!atHomeRes.ok) {
        throw new Error(`Failed to get chapter images: ${atHomeRes.status}`);
      }

      const atHomeData = await atHomeRes.json();
      const baseUrl = atHomeData.baseUrl;
      const hash = atHomeData.chapter.hash;
      const pages = atHomeData.chapter.data.map((filename: string) => 
        `${baseUrl}/data/${hash}/${filename}`
      );

      return {
        id: chapterNumber,
        title: chapter.attributes.title || `Chapter ${chapterNumber}`,
        pages
      };
    }
    
    // Fallback to search if no direct ID
    const chaptersUrl = await searchManga(mangaTitle);
    if (!chaptersUrl) {
      throw new Error('Could not find manga: ' + mangaTitle);
    }

    const chapterId = await getChapterLink(chaptersUrl, chapterNumber);
    if (!chapterId) {
      throw new Error('Could not find chapter: ' + chapterNumber);
    }

    const atHomeUrl = `https://api.mangadex.org/at-home/server/${chapterId}`;
    const atHomeRes = await fetch(atHomeUrl);
    
    if (!atHomeRes.ok) {
      throw new Error(`At-home server failed: ${atHomeRes.status}`);
    }

    const atHomeData = await atHomeRes.json();
    const baseUrl = atHomeData.baseUrl;
    const hash = atHomeData.chapter.hash;
    const pages = atHomeData.chapter.data.map((filename: string) => 
      `${baseUrl}/data/${hash}/${filename}`
    );

    if (pages.length === 0) {
      throw new Error('No images found in chapter');
    }

    console.log('Successfully fetched', pages.length, 'pages');
    return {
      id: chapterNumber,
      title: `Chapter ${chapterNumber}`,
      pages
    };

  } catch (error) {
    console.error('Error fetching manga content:', error);
    return null;
  }
}