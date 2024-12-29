import {describe, expect, test} from 'bun:test';
import {unlink} from 'node:fs/promises';
import {Changa} from '../src/scraper';
import {load} from 'cheerio';
import {html_axios} from 'chainy';

const urls = await load_urls();

describe('changa', () => {
    const changa = new Changa();

    for (const [url, html] of Object.entries(urls)) {
        const $ = load(html, {baseURI: url});

        describe(url, () => {
            const scraper = changa.scraper($);

            test('support', () => {
                expect(scraper).not.toBeUndefined();
            });

            describe.if(!!scraper)('manga', () => {
                const chains = scraper!.get_chains();

                test.if(!!chains.manga.url)('url', () => {
                    expect(chains.manga.url!.run($)).toBeString();
                });

                test('title', () => {
                    expect(chains.manga.title.run($)).toBeString();
                });

                test('description', () => {
                    expect(chains.manga.description.run($)).toBeString();
                });

                test.if(!!chains.manga.cover_url)('cover_url', () => {
                    expect(chains.manga.cover_url!.run($)).toBeString();
                });

                test.if(!!chains.manga.status)('status', () => {
                    expect(chains.manga.status!.run($)).toBeString();
                });

                test.if(!!chains.manga.is_ongoing)('is_ongoing', () => {
                    expect(chains.manga.is_ongoing!.run($)).toBeBoolean();
                });

                test.if(!!chains.manga.authors)('authors', () => {
                    expect(chains.manga.authors!.run($)).toBeArray();
                });

                test.if(!!chains.manga.genres)('genres', () => {
                    expect(chains.manga.genres!.run($)).toBeArray();
                });

                test.if(!!chains.manga.alternative_titles)('alternative_titles', () => {
                    expect(chains.manga.alternative_titles!.run($)).toBeArray();
                });
            });

            test.if(!!scraper)('chapters', async () => {
                const chapters = await scraper!.chapters($);
                expect(chapters).toBeArray();
                expect(chapters).not.toBeArrayOfSize(0);

                const chapter_one = chapters[0]!;
                const {data} = await html_axios.get(chapter_one.url);
                const images = await scraper!.images(data);
                expect(images).toBeArray();
                expect(images).not.toBeArrayOfSize(0);
            }, 60000);
        });
    }
});

async function load_urls() {
    const urls_file = Bun.file('test/urls.txt');
    const lines = await urls_file.text();
    const urls = lines.trim().split('\n').filter(url => !/^(#|\/\/)/.test(url));
    const result: Record<string, string> = {};
    for (const url of urls) {
        const url_hash = Bun.MD5.hash(url, 'hex');
        const file_path = `test/.cache/${url_hash}.html`;
        const cached = Bun.file(file_path);
        let html;
        if (await cached.exists()) {
            const time_diff = Date.now() - cached.lastModified;
            // older than a week
            if (time_diff >= (8.64e+7 * 7)) {
                await unlink(`.cache/${url_hash}.html`);
            }
        }

        if (await cached.exists()) {
            html = await cached.text();
        } else {
            const response = await Bun.fetch(url);
            if (response.ok) {
                html = await response.text();
                await Bun.write(cached, html);
            } else {
                console.warn(`${url} failed to fetch`);

                continue;
            }
        }

        result[url] = html;
    }

    return result;
}
