import {ChannelDTO} from './Channel';

export class StateDTO {
    channel!: ChannelDTO|null;
    volume!: number;
    now_playing!: false|string;
}
