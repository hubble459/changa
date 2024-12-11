import {chainy} from 'chainy';
import {Scraper} from './scraper';
import type {Chains} from '../type/chains';

export class MGeko extends Scraper {
    protected readonly hostnames = new Set<string>([
        'mgeko.cc',
    ]);

    protected readonly chains: Chains = {
        accepts: chainy().select('a[title="mangageko"]').toChainy(),
        manga: {
            title: chainy()
                .select('h1.novel-title')
                .first()
                .text()
                .trim()
                .toChainy(),
            description: chainy()
                .select('p.description')
                .first()
                .text()
                .regex(/.+The Summary is/)
                .trim()
                .toChainy(),
            cover_url: chainy()
                .select('meta[name="image"]')
                .first()
                .attribute('content')
                .toChainy(),
            status: chainy()
                .select('div.header-stats span:contains(Status) strong')
                .first()
                .text()
                .toChainy(),
            is_ongoing: chainy()
                .select('div.header-stats span:contains(Status) strong')
                .first()
                .text()
                .matches(/ongoing/i)
                .value(true)
                .or_value(false)
                .toChainy(),
            authors: chainy()
                .select('span[itemprop="author"]')
                .text()
                .trim()
                .toChainy(),
            genres: chainy()
                .select('div.categories ul li a')
                .text()
                .trim()
                .toChainy(),
        },
        chapters: {
            root: chainy()
                .select('#chpagedlist #library-push').first()
                .attribute('href')
                .abs_url()
                .fetch()
                .select('ul.chapter-list li')
                .toChainy(),
            url: chainy()
                .select('a').first()
                .attribute('href')
                .toChainy(),
            title: chainy()
                .select('strong.chapter-title').first()
                .text()
                .trim()
                .toChainy(),
            number: chainy()
                .select('strong.chapter-title').first()
                .text()
                .trim()
                .regex(/([\d.]+).*/, '$1')
                .cast_float()
                .toChainy(),
            date: chainy()
                .select('time.chapter-update').first()
                .attribute('datetime')
                .cast_date('MMM. d, yyyy, h:mm aaaa')
                .toChainy(),
        },
    };
}
