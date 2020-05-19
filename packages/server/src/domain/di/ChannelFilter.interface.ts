import {ChannelFilterDTO} from '@digitally-imported/dto'

export interface IChannelFilter {
    readonly channels: Set<number>
    readonly id: number
    readonly key: string
    readonly meta: boolean
    readonly name: string

    to_dto(): ChannelFilterDTO
}
