import {Chainy, chainy} from 'chainy';
import type {Chapter, Manga, MangaSearch} from '../type';
import type {Chains} from '../type/chains';
import type {CheerioAPI} from 'cheerio';
import type {MangaWithChapters} from '../type/manga_with_chapters';

export abstract class Scraper {
    public abstract readonly hostnames: Set<string>;

    protected abstract readonly chains: Chains;

    public get_chains(): Readonly<Chains> {
        return Object.freeze(this.chains);
    }

    public toObject(): object {
        function toObjectRecursive(object: object): object {
            return Object.fromEntries(Object.entries(object).map(([key, value]) => [
                key,
                value instanceof Chainy
                    ? value.toObject()
                    : typeof value === 'object'
                        ? toObjectRecursive(value)
                        : value,
            ]));
        }
        return {
            hostnames: Array.from(this.hostnames),
            chains: toObjectRecursive(this.chains),
        };
    }

    public accepts($: CheerioAPI): boolean {
        const base_uri = $._options.baseURI!.toString();
        const hostname = new URL(base_uri).hostname;
        if (this.hostnames.has(hostname)) {
            return true;
        }

        return !!chainy()
            .add(() => this.chains.accepts as any)
            .or_value(false)
            .run($);
    }

    public manga($: CheerioAPI): Manga {
        const manga_chain = this.chains.manga;
        const base_uri = $._options.baseURI!.toString();

        return {
            url: manga_chain.url?.run($) ?? base_uri,
            title: manga_chain.title.run($),
            description: manga_chain.description.run($),
            cover_url: manga_chain.cover_url?.run($),
            status: manga_chain.status?.run($),
            is_ongoing: manga_chain.is_ongoing?.run($) ?? true,
            authors: manga_chain.authors?.run($) ?? [],
            genres: manga_chain.genres?.run($) ?? [],
            alternative_titles: manga_chain.alternative_titles?.run($) ?? [],
        };
    }

    public async chapters($: CheerioAPI): Promise<Chapter[]> {
        const chapter_chain = this.chains.chapters;
        const chapters: Chapter[] = [];

        const elements = await chapter_chain.root.run($);

        for (const element of elements) {
            chapters.push({
                url: chapter_chain.url.run($, element),
                title: chapter_chain.title.run($, element),
                number: chapter_chain.number.run($, element),
                cover_url: chapter_chain.cover_url?.run($, element),
                date: chapter_chain.date?.run($, element),
            });
        }

        return chapters;
    }

    public async manga_with_chapters($: CheerioAPI): Promise<MangaWithChapters> {
        const manga = this.manga($) as MangaWithChapters;
        manga.chapters = await this.chapters($);
        return manga;
    }

    public async images($: CheerioAPI): Promise<string[]> {
        return this.chains.images.run($);
    }

    public search($: CheerioAPI): MangaSearch[] {
        const search_chain = this.chains.search;

        if (!search_chain) {
            throw new Error('No search chain found');
        }

        const search_results: MangaSearch[] = [];

        const elements = search_chain.root.run($);

        for (const element of elements) {
            search_results.push({
                url: search_chain.url.run($, element),
                title: search_chain.title.run($, element),
                description: search_chain.description?.run($, element),
                cover_url: search_chain.cover_url?.run($, element),
                status: search_chain.status?.run($, element),
                is_ongoing: search_chain.is_ongoing?.run($, element),
                authors: search_chain.authors?.run($, element),
                genres: search_chain.genres?.run($, element),
                alternative_titles: search_chain.alternative_titles?.run($, element),
            });
        }

        return search_results;
    }
}
