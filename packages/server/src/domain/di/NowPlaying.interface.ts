import {OnAirDTO} from '@digitally-imported/dto'

export interface IOnAir {
    readonly channel_id: number
    readonly channel_key: string
    readonly display_artist: string
    readonly display_title: string

    to_dto (): OnAirDTO
}
