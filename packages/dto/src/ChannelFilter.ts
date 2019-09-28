import {Transform, Exclude} from 'class-transformer';

export class ChannelFilterDTO {
    @Transform((channels: Set<number>) => Array.from(channels.values()))
    channels!: Set<number>;

    display!: boolean;
    id!: number;
    key!: string;
    meta!: boolean;
    name!: string;

    @Exclude()
    position!: number;

    constructor (partial: ChannelFilterDTO) {
        Object.assign(this, partial);
    }
}
