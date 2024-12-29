import type {CheerioAPI} from 'cheerio';
import type {Chapter, Manga} from '../type';
import type {Chains} from '../type/chains';
import {Mangakakalot} from './mangakakalot';
import {MGeko} from './mgeko';
import {Scraper} from './scraper';

const scrapers = [new Mangakakalot(), new MGeko()];

export class Changa extends Scraper {
    protected readonly hostnames = scrapers.reduce((acc, scraper) => acc.union(scraper.hostnames), new Set<string>());

    protected readonly chains: Chains = {} as any;

    public accepts(): boolean {
        return true;
    }

    public scrapers($: CheerioAPI): Scraper[] {
        return scrapers.filter(scraper => scraper.accepts($));
    }

    public scraper($: CheerioAPI): Scraper | undefined {
        return scrapers.find(scraper => scraper.accepts($));
    }

    public manga($: CheerioAPI): Manga {
        const scraper = this.scraper($);

        if (scraper) {
            return scraper.manga($);
        }

        throw new Error('No scraper found');
    }

    public chapters($: CheerioAPI): Promise<Chapter[]> {
        const scraper = this.scraper($);

        if (scraper) {
            return scraper.chapters($);
        }

        throw new Error('No scraper found');
    }

    public images($: CheerioAPI): Promise<string[]> {
        const scraper = this.scraper($);

        if (scraper) {
            return scraper.images($);
        }

        throw new Error('No scraper found');
    }
}
