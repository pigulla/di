import {ChannelDTO} from './Channel'

export class PlaybackStateDTO {
    channel!: ChannelDTO|null
    now_playing!: false|{
        artist: string
        title: string
    }
}
