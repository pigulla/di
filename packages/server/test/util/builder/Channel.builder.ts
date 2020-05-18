import dayjs, {Dayjs} from 'dayjs'

import {IChannel} from '~src/domain/di'
import {Channel} from '~src/infrastructure/di'

export class ChannelBuilder {
    private director: string = 'D. Rector'
    private created_at: Dayjs = dayjs('2019-10-06T16:34:59.157Z')
    private description: string = 'A helpful channel description'
    private id: number = 42
    private key: string = 'channel_key'
    private name: string = 'funky'
    private updated_at: Dayjs | null = null
    private image_default: string = 'http://images.di.fm.local/default.jpg'
    private image_compact: string = 'http://images.di.fm.local/compact.jpg'
    private image_banner: string | null = 'http://images.di.fm.local/banner.jpg'

    public with_images(images: {default: string; compact: string; banner: string | null}): this {
        return this.with_image_default(images.default)
            .with_image_banner(images.banner)
            .with_image_compact(images.compact)
    }

    public with_image_default(image: string): this {
        this.image_default = image
        return this
    }

    public with_image_banner(image: string | null): this {
        this.image_banner = image
        return this
    }

    public with_image_compact(image: string): this {
        this.image_compact = image
        return this
    }

    public with_updated_at(updated_at: dayjs.ConfigType | null): this {
        this.updated_at = updated_at ? dayjs(updated_at) : null
        return this
    }

    public with_created_at(created_at: dayjs.ConfigType): this {
        this.created_at = dayjs(created_at)
        return this
    }

    public with_director(director: string): this {
        this.director = director
        return this
    }

    public with_description(description: string): this {
        this.description = description
        return this
    }

    public with_key(key: string): this {
        this.key = key
        return this
    }

    public with_name(name: string): this {
        this.name = name
        return this
    }

    public with_id(id: number): this {
        this.id = id
        return this
    }

    public build(): IChannel {
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
}
