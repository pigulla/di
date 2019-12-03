import {ChannelDTO} from './Channel'

export class PlaybackStateDTO {
    channel!: ChannelDTO
    now_playing!: {
        artist: string
        title: string
    }
}
