import dayjs, {Dayjs} from 'dayjs'
import utc from 'dayjs/plugin/utc'

import {ChannelDTO} from '@digitally-imported/dto'

dayjs.extend(utc)

export enum Quality {
    AAC_64 = 'AAC_64',
    AAC_128 = 'AAC_128',
    MP3_320 = 'MP3_320',
}

export interface RawChannel {
    channel_director: string
    created_at: string
    description: string
    description_long: string
    description_short: string
    favorite: boolean
    id: number
    images: {
        compact: string
        default: string
        horizontal_banner?: string
    }
    key: string
    name: string
    updated_at: string
}

export class Channel {
    private static quality_to_url_map: {[P in Quality]: string} = {
        [Quality.AAC_64]: 'premium_medium',
        [Quality.AAC_128]: 'premium',
        [Quality.MP3_320]: 'premium_high',
    }

    /* eslint-disable-next-line no-useless-constructor */
    public constructor (
        public readonly director: string,
        public readonly created_at: Dayjs,
        public readonly description: string,
        public readonly id: number,
        public readonly key: string,
        public readonly name: string,
        public readonly updated_at: Dayjs|null,
        public readonly images: {
            readonly default: string
            readonly compact: string
            readonly banner: string|null
        },
    ) {}

    public build_url (listen_key: string, quality: Quality): string {
        const quality_path = Channel.quality_to_url_map[quality]

        return `http://listen.di.fm/${quality_path}/${this.key}.pls?listen_key=${listen_key}`
    }

    private static process_image_url (value: string): string {
        const matches = /^(\/\/.+?)\{\?[a-z,]*\}$/.exec(value)

        return matches ? `https:${matches[1]}` : value
    }

    public to_dto (): ChannelDTO {
        return new ChannelDTO({
            director: this.director,
            description: this.description,
            id: this.id,
            key: this.key,
            name: this.name,
            updated_at: this.updated_at ? this.updated_at.toISOString() : null,
            created_at: this.created_at.toISOString(),
            images: {
                default: this.images.default,
                compact: this.images.compact,
                banner: this.images.banner,
            },
        })
    }

    public static from_raw (data: RawChannel): Channel {
        const description = data.description || data.description_short || data.description_long || ''
        const {compact, default: dflt, horizontal_banner: banner} = data.images

        return new Channel(
            data.channel_director,
            dayjs.utc(data.created_at),
            description.trim(),
            data.id,
            data.key,
            data.name,
            data.created_at === data.updated_at ? null : dayjs.utc(data.updated_at),
            {
                compact: Channel.process_image_url(compact),
                default: Channel.process_image_url(dflt),
                banner: banner ? Channel.process_image_url(banner) : null,
            },
        )
    }
}
