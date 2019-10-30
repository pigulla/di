import {NowPlayingDTO} from '@digitally-imported/dto'

export interface RawNowPlaying {
    channel_id: number
    channel_key: string
    track: {
        display_artist: string
        display_title: string
        id: number
    }
}

export class NowPlaying {
    // eslint-disable-next-line no-useless-constructor
    public constructor (
        public readonly channel_id: number,
        public readonly channel_key: string,
        public readonly display_artist: string,
        public readonly display_title: string,
    ) {}

    public to_dto (): NowPlayingDTO {
        return new NowPlayingDTO(this)
    }

    public static from_raw (data: RawNowPlaying): NowPlaying {
        return new NowPlaying(
            data.channel_id,
            data.channel_key,
            data.track.display_artist,
            data.track.display_title,
        )
    }

    public toString (): string {
        return `${this.display_artist} - ${this.display_title}`
    }
}
