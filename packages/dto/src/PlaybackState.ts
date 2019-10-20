import {ChannelDTO} from './Channel'

export class PlaybackStateDTO {
    channel!: ChannelDTO|null;
    now_playing!: false|string;
}
