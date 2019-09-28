import {Transform} from 'class-transformer';
import {Dayjs} from 'dayjs';

export class ChannelDTO {
    director!: string;
    description!: string;
    is_favorite!: boolean;
    id!: number;
    key!: string;
    name!: string;

    @Transform((date: Dayjs|null) => date ? date.toISOString() : null)
    updated_at!: Dayjs|null;

    @Transform((date: Dayjs) => date.toISOString())
    created_at!: Dayjs;

    images!: {
        default: string;
        compact: string;
        banner: string|null;
    };

    constructor (partial: ChannelDTO) {
        Object.assign(this, partial);
    }
}
