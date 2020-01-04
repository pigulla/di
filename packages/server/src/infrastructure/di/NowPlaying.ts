import {OnAirDTO} from '@digitally-imported/dto'

import {IOnAir} from '../../domain/di'

export interface RawNowPlaying {
    channel_id: number
    channel_key: string
    track: null|{
        display_artist: string
        display_title: string
        id: number
    }
}

export class NowPlaying implements IOnAir {
    public readonly channel_id: number
    public readonly channel_key: string
    public readonly artist: string|null
    public readonly title: string|null

    public constructor (
        channel_id: number,
        channel_key: string,
        artist: string|null,
        title: string|null,
    ) {
        this.channel_id = channel_id
        this.channel_key = channel_key
        this.artist = artist
        this.title = title
    }

    public to_dto (): OnAirDTO {
        return OnAirDTO.create({
            channel_key: this.channel_key,
            channel_id: this.channel_id,
            artist: this.artist || 'unknown',
            title: this.title || 'unknown',
        })
    }

    public static from_raw (data: RawNowPlaying): NowPlaying {
        // "track" should not be null, but it sometimes is for some reason :(

        return new NowPlaying(
            data.channel_id,
            data.channel_key,
            data.track?.display_artist || null,
            data.track?.display_title || null,
        )
    }
}
