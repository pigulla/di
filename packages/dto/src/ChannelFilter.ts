export class ChannelFilterDTO {
    channels!: number[];
    id!: number;
    key!: string;
    meta!: boolean;
    name!: string;

    constructor (channel_filter: ChannelFilterDTO) {
        Object.assign(this, channel_filter)
    }
}
