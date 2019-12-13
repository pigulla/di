import {NowPlayingDTO} from '@digitally-imported/dto'

import {INowPlaying} from '../../domain/di'

export interface RawNowPlaying {
    channel_id: number
    channel_key: string
    track: {
        display_artist: string
        display_title: string
        id: number
    }
}

export class NowPlaying implements INowPlaying {
    public readonly channel_id: number
    public readonly channel_key: string
    public readonly display_artist: string
    public readonly display_title: string

    public constructor (
        channel_id: number,
        channel_key: string,
        display_artist: string,
        display_title: string,
    ) {
        this.channel_id = channel_id
        this.channel_key = channel_key
        this.display_artist = display_artist
        this.display_title = display_title
    }

    public to_dto (): NowPlayingDTO {
        return NowPlayingDTO.create(this)
    }

    public static from_raw (data: RawNowPlaying): NowPlaying {
        return new NowPlaying(
            data.channel_id,
            data.channel_key,
            data.track.display_artist,
            data.track.display_title,
        )
    }
}
