export class ChannelDTO {
    director!: string;
    description!: string;
    id!: number;
    key!: string;
    name!: string;
    updated_at!: string|null;
    created_at!: string;
    images!: {
        default: string
        compact: string
        banner: string|null
    };

    constructor (channel: ChannelDTO) {
        Object.assign(this, channel)
    }
}
