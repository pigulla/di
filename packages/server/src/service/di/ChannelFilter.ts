import {ChannelFilterDTO} from '@digitally-imported/dto'

export interface RawChannelFilter {
    channels: number[]
    id: number
    key: string
    meta: boolean
    name: string
    network_id: number
    position: number
}

export class ChannelFilter {
    // eslint-disable-next-line no-useless-constructor
    public constructor (
        public readonly channels: Set<number>,
        public readonly id: number,
        public readonly key: string,
        public readonly meta: boolean,
        public readonly name: string,
    ) {}

    public to_dto (): ChannelFilterDTO {
        return new ChannelFilterDTO({
            channels: Array.from(this.channels),
            id: this.id,
            key: this.key,
            name: this.name,
            meta: this.meta,
        })
    }

    public static from_raw (data: RawChannelFilter): ChannelFilter {
        return new ChannelFilter(
            new Set(data.channels),
            data.id,
            data.key,
            data.meta,
            data.name,
        )
    }
}
