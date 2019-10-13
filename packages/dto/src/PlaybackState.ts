import {ChannelDTO} from './Channel'

export class PlaybackStateDTO {
    channel!: ChannelDTO|null;
    volume!: number;
    now_playing!: false|string;
}
