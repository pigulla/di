import dayjs, {Dayjs} from 'dayjs'

import {Channel} from '@server/service/di'

export class ChannelBuilder {
    private director: string = 'D. Rector'
    private created_at: Dayjs = dayjs('2019-10-06T16:34:59.157Z')
    private description: string = 'A helpful channel description'
    private id: number = 42
    private key: string = 'channel_key'
    private name: string = 'funky'
    private updated_at: Dayjs|null = null
    private image_default: string = 'http://images.di.fm.local/default.jpg'
    private image_compact: string = 'http://images.di.fm.local/compact.jpg'
    private image_banner: string|null = 'http://images.di.fm.local/banner.jpg'

    public with_images (images: {default: string, compact: string, banner: string|null}): this {
        return this
            .with_image_default(images.default)
            .with_image_banner(images.banner)
            .with_image_compact(images.compact)
    }

    public with_image_default (image: string): this {
        this.image_default = image
        return this
    }

    public with_image_banner (image: string|null): this {
        this.image_banner = image
        return this
    }

    public with_image_compact (image: string): this {
        this.image_compact = image
        return this
    }

    public with_updated_at (updated_at: dayjs.ConfigType|null): this {
        this.updated_at = updated_at ? dayjs(updated_at) : null
        return this
    }

    public with_created_at (created_at: dayjs.ConfigType): this {
        this.created_at = dayjs(created_at)
        return this
    }

    public with_director (director: string): this {
        this.director = director
        return this
    }

    public with_description (description: string): this {
        this.description = description
        return this
    }

    public with_key (key: string): this {
        this.key = key
        return this
    }

    public with_name (name: string): this {
        this.name = name
        return this
    }

    public with_id (id: number): this {
        this.id = id
        return this
    }

    public build (): Channel {
        return new Channel(
            this.director,
            this.created_at,
            this.description,
            this.id,
            this.key,
            this.name,
            this.updated_at,
            {
                default: this.image_default,
                compact: this.image_compact,
                banner: this.image_banner,
            }
        )
    }

    public static build_progressive (): Channel {
        return new ChannelBuilder()
            .with_director('Johan N. Lecander')
            .with_description('Always moving forward, progressive continues to reinvent itself into new sounds and styles made for the floor.')
            .with_id(7)
            .with_key('progressive')
            .with_name('progressive')
            .with_images({
                default: 'https://cdn-images.audioaddict.com/3/3/5/5/3/1/3355314492d633a5330c659cfe98fc1b.png',
                compact: 'https://cdn-images.audioaddict.com/3/f/c/e/3/7/3fce37012f1339a3db0a6dea553ad89a.jpg',
                banner: 'https://cdn-images.audioaddict.com/3/1/e/8/f/2/31e8f2aa779c711cd776c79a6cdd2617.png',
            })
            .with_created_at('2010-03-16T22:02:42.000Z')
            .with_updated_at('2019-02-12T17:53:24.000Z')
            .build()
    }
}

export const progressive = new ChannelBuilder()
    .with_director('Johan N. Lecander')
    .with_description('Always moving forward, progressive continues to reinvent itself into new sounds and styles made for the floor.')
    .with_id(7)
    .with_key('progressive')
    .with_name('Progressive')
    .with_images({
        default: 'https://cdn-images.audioaddict.com/3/3/5/5/3/1/3355314492d633a5330c659cfe98fc1b.png',
        compact: 'https://cdn-images.audioaddict.com/3/f/c/e/3/7/3fce37012f1339a3db0a6dea553ad89a.jpg',
        banner: 'https://cdn-images.audioaddict.com/3/1/e/8/f/2/31e8f2aa779c711cd776c79a6cdd2617.png',
    })
    .with_created_at('2010-03-16T22:02:42.000Z')
    .with_updated_at('2019-02-12T17:53:24.000Z')
    .build()

export const classictechno = new ChannelBuilder()
    .with_director('Johan N. Lecander')
    .with_description('Go back in time and hear the biggest and best tracks within techno and trance that defined a decade of dance culture.')
    .with_id(14)
    .with_key('classictechno')
    .with_name('Oldschool Techno & Trance ')
    .with_images({
        default: 'https://cdn-images.audioaddict.com/2/4/9/d/1/8/249d182058ac9e5631557eb309efe80f.png',
        compact: 'https://cdn-images.audioaddict.com/b/b/7/7/a/e/bb77aeafbca185bd594ab579d080e107.jpg',
        banner: null,
    })
    .with_created_at('2010-03-16T22:02:42.000Z')
    .with_updated_at('2019-02-12T17:53:53.000Z')
    .build()

export const vocaltrance = new ChannelBuilder()
    .with_director('db')
    .with_description('Lush vocals paired together with emotive dance music. Beautiful melodies and endless energy.')
    .with_id(2)
    .with_key('vocaltrance')
    .with_name('Vocal Trance')
    .with_images({
        default: 'https://cdn-images.audioaddict.com/3/0/9/f/2/4/309f243a8a181ad83e8c5e15cd4b24c3.png',
        compact: 'https://cdn-images.audioaddict.com/b/3/9/6/8/9/b39689739a2f40b451dff594e432729d.jpg',
        banner: 'https://cdn-images.audioaddict.com/2/3/b/b/2/1/23bb217dfa36f127c017444d08ba33e7.png',
    })
    .with_created_at('2010-03-16T22:02:42.000Z')
    .with_updated_at('2019-02-12T18:04:07.000Z')
    .build()
