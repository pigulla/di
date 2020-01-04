import {OnAirDTO} from '@digitally-imported/dto'

export interface IOnAir {
    readonly channel_id: number
    readonly channel_key: string
    readonly artist: string|null
    readonly title: string|null

    to_dto (): OnAirDTO
}
