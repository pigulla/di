import {NowPlayingDTO} from '@digitally-imported/dto'

export interface INowPlaying {
    readonly channel_id: number
    readonly channel_key: string
    readonly display_artist: string
    readonly display_title: string

    to_dto (): NowPlayingDTO
}
