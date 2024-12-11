import {chainy} from 'chainy';
import {Scraper} from './scraper';
import type {Chains} from '../type/chains';

export class Mangakakalot extends Scraper {
    protected readonly hostnames = new Set<string>([
        'mangakakalot.com',
    ]);

    protected readonly chains: Chains = {
        accepts: chainy().select('a[title="Manga Online"]').toChainy(),
        manga: {
            title: chainy()
                .select('h1')
                .first()
                .text()
                .trim()
                .toChainy(),
            description: chainy()
                .select('meta[name="description"]')
                .first()
                .attribute('content')
                .trim()
                .toChainy(),
            cover_url: chainy()
                .select('meta[name="twitter:image"]')
                .first()
                .attribute('content')
                .toChainy(),
            status: chainy()
                .select('ul.manga-info-text li:contains(Status)')
                .or_select('table.variations-tableInfo tr td:has(i.info-status) ~ td')
                .first()
                .text()
                .trim()
                .regex(/^\w+\s*:\s*/i)
                .toChainy(),
            is_ongoing: chainy()
                .select('ul.manga-info-text li:contains(Status)')
                .or_select('table.variations-tableInfo tr td:has(i.info-status) ~ td')
                .first()
                .text()
                .trim()
                .regex(/^\w+\s*:\s*/i)
                .matches(/ongoing/i)
                .value(true)
                .or_value(false)
                .toChainy(),
            authors: chainy()
                .select('ul.manga-info-text li:contains(Author) a')
                .or_select('table.variations-tableInfo tr td:has(i.info-author) ~ td a')
                .text()
                .trim()
                .toChainy(),
            genres: chainy()
                .select('ul.manga-info-text li:contains(Genre) a')
                .or_select('table.variations-tableInfo tr td:has(i.info-genres) ~ td a')
                .text()
                .trim()
                .toChainy(),
            alternative_titles: chainy()
                .select('h2.story-alternative')
                .or_select('table.variations-tableInfo tr td:has(i.info-alternative) ~ td')
                .first()
                .text()
                .regex(/^\w+\s*:\s*/i)
                .split(' ; ')
                .trim()
                .toChainy(),
        },
        chapters: {
            root: chainy()
                .select('div.chapter-list div.row')
                .or_select('ul.row-content-chapter li')
                .toChainy(),
            url: chainy()
                .select('a').first()
                .attribute('href')
                .toChainy(),
            title: chainy()
                .select('a').first()
                .text()
                .toChainy(),
            number: chainy()
                .select('a').first()
                .text()
                .regex(/^[^\d]*([\d.]+).*/, '$1')
                .cast_float()
                .toChainy(),
            date: chainy()
                .select('span[title]').first()
                .add(chain => chain
                    .attribute('data-fn-time')
                    .cast_date('X'))
                .or(chain => chain
                    .attribute('title')
                    .cast_date('MMM-dd-yyyy HH:mm')
                    .or_cast_relative_date())
                .toChainy(),
        },
    };
}
