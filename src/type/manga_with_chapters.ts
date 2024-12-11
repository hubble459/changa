import type {Chapter} from '.';

export interface MangaWithChapters {
    url: string;
    title: string;
    description: string;
    cover_url?: string;
    status?: string;
    is_ongoing: boolean;
    authors: string[];
    genres: string[];
    alternative_titles: string[];
    chapters: Chapter[];
}
