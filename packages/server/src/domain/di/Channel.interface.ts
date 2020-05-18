import {ChannelDTO} from '@digitally-imported/dto'
import {Dayjs} from 'dayjs'

import {Quality} from './Quality'

export interface IChannel {
    readonly director: string
    readonly created_at: Dayjs
    readonly description: string
    readonly id: number
    readonly key: string
    readonly name: string
    readonly updated_at: Dayjs | null
    readonly images: {
        readonly default: string
        readonly compact: string
        readonly banner: string | null
    }

    build_url(listen_key: string, quality: Quality): string
    to_dto(): ChannelDTO
}
