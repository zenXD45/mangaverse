// Using a mock implementation for now
// In a real scenario, you would fetch this data from the MangaDex API

export interface MangaDexManga {
    id: string;
    type: string;
    attributes: {
      title: {
        en: string;
      };
      altTitles: { en: string }[];
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
    title: { en: string }; // Simplified for MangaCard
    author: string; // Simplified for MangaCard
    coverArt: {
      imageUrl: string;
      imageHint: string;
    };
  }
  
  const mockMangaDexData: MangaDexManga[] = [
    {
      id: "mangadex-1",
      type: "manga",
      attributes: {
        title: { en: "Solo Leveling" },
        altTitles: [{ en: "Only I Level Up" }],
        description: { en: "A weak hunter enters a dungeon that changes his life forever." },
        originalLanguage: "ko",
        status: "completed",
        contentRating: "safe",
        tags: [],
        state: "published",
        chapterNumbersResetOnNewVolume: false,
        createdAt: "2021-01-01T00:00:00Z",
        updatedAt: "2022-01-01T00:00:00Z",
        version: 1,
        availableTranslatedLanguages: ["en"],
        latestUploadedChapter: "179",
      },
      relationships: [],
      title: { en: "Solo Leveling" },
      author: "Chugong",
      coverArt: {
        imageUrl: "https://picsum.photos/seed/mangadex1/600/800",
        imageHint: "hunter anime style",
      },
    },
    {
        id: "mangadex-2",
        type: "manga",
        attributes: {
            title: { en: "Berserk" },
            altTitles: [],
            description: { en: "Guts, a former mercenary now known as the \"Black Swordsman\", is out for revenge." },
            originalLanguage: "ja",
            status: "ongoing",
            contentRating: "suggestive",
            tags: [],
            state: "published",
            chapterNumbersResetOnNewVolume: false,
            createdAt: "1989-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            version: 1,
            availableTranslatedLanguages: ["en"],
            latestUploadedChapter: "375",
        },
        relationships: [],
        title: { en: "Berserk" },
        author: "Kentaro Miura",
        coverArt: {
            imageUrl: "https://picsum.photos/seed/mangadex2/600/800",
            imageHint: "dark fantasy warrior",
        },
    },
    {
        id: "mangadex-3",
        type: "manga",
        attributes: {
            title: { en: "Vagabond" },
            altTitles: [],
            description: { en: "The story of the legendary swordsman Miyamoto Musashi." },
            originalLanguage: "ja",
            status: "ongoing",
            contentRating: "safe",
            tags: [],
            state: "published",
            chapterNumbersResetOnNewVolume: false,
            createdAt: "1998-01-01T00:00:00Z",
            updatedAt: "2024-01-01T00:00:00Z",
            version: 1,
            availableTranslatedLanguages: ["en"],
            latestUploadedChapter: "327",
        },
        relationships: [],
        title: { en: "Vagabond" },
        author: "Takehiko Inoue",
        coverArt: {
            imageUrl: "https://picsum.photos/seed/mangadex3/600/800",
            imageHint: "samurai ink wash",
        },
    }
  ];
  
  export async function getMangaDexCollection(): Promise<MangaDexManga[]> {
    // In a real scenario, you'd fetch from `process.env.MANGADEX_API_URL`
    // using `process.env.MANGADEX_API_KEY`.
    // For now, we return mock data.
    await new Promise(res => setTimeout(res, 500)); // Simulate network delay
    return mockMangaDexData;
  }
  
  export async function getMangaDexManga(id: string): Promise<MangaDexManga | null> {
    await new Promise(res => setTimeout(res, 500));
    const manga = mockMangaDexData.find(m => m.id === id);
    return manga || null;
  }
