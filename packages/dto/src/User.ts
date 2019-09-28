import {Exclude, Transform} from 'class-transformer';
import {Dayjs} from 'dayjs';

export class UserDTO {
    type!: 'guest'|'public'|'premium';
    authenticated!: boolean;
    id?: number;
    has_premium!: boolean|null;
    has_password!: boolean|null;
    favorites?: number[];

    @Exclude()
    audio_token!: string;

    @Exclude()
    session_key!: string;

    @Transform((date: Dayjs) => date.toISOString())
    created_at?: Dayjs;

    @Exclude()
    api_key?: string;

    @Exclude()
    listen_key?: string;

    constructor (partial: Partial<UserDTO>) {
        Object.assign(this, partial);
    }
}
