import {ChannelDTO} from './Channel'

type PlaybackStateProperties = {
    channel: ChannelDTO
    now_playing: {
        artist: string
        title: string
    }
}

export class PlaybackStateDTO {
    public channel!: ChannelDTO
    public now_playing!: {
        artist: string
        title: string
    }

    public static create(properties: PlaybackStateProperties): PlaybackStateDTO {
        return Object.assign(new PlaybackStateDTO(), properties)
    }
}
