// Type definitions for the wordsuz API

// User types
export interface User {
  id: string;
  email: string;
  username?: string;
  createdAt: string;
  updatedAt: string;
  bookmarksCount?: number;
}

export interface UserStats {
  total: number;
  lastWeek: number;
  lastMonth: number;
  lastYear: number;
}

// Word types
export interface WordDefinitionExample {
  phrase: string;
  translation: string;
}

export interface WordDefinitionOther {
  meaning: string;
  examples: WordDefinitionExample[];
}

export interface WordDefinition {
  id?: string;
  typeEn: string;
  typeUz: string;
  meaning: string;
  plural?: string;
  others: WordDefinitionOther[];
}

export interface VerbFormContent {
  title: string;
  forms: {
    singular: string;
    plural: string;
  }[];
}

export interface VerbForm {
  id?: string;
  tense: string;
  content: VerbFormContent[];
}

export interface Example {
  id?: string;
  phrase: string;
  translation: string;
}

export interface Word {
  id: string;
  titleEng: string;
  titleUz: string;
  transcription?: string;
  usageFrequency?: number;
  synonyms: string[];
  anagrams: string[];
  createdAt: string;
  updatedAt: string;
  definitionsCount?: number;
  examplesCount?: number;
  verbFormsCount?: number;
  bookmarksCount?: number;
  commentsCount?: number;
  // Detailed data
  definitions?: WordDefinition[];
  examples?: Example[];
  verbForms?: VerbForm[];
}

// Bookmark types
export interface Bookmark {
  id: string;
  userId: string;
  wordId: string;
  createdAt: string;
  updatedAt: string;
  word?: Word;
}

// Comment types
export interface Comment {
  id: string;
  text: string;
  username?: string | null;
  wordId?: string;
  createdAt: string;
  updatedAt: string;
  Word?: {
    titleEng: string;
    titleUz: string;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  email: string;
  accessToken: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

// Games types
export interface Game {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameQuestion {
  id: string;
  text: string;
  gameId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
  questionId: string;
  createdAt: string;
  updatedAt: string;
}
