import dayjs, {Dayjs} from 'dayjs'

import {GuestUser, PremiumUser, PublicUser} from '../../../src/service/di'

export class UserBuilder {
    private audio_token: string = 'audio.token'
    private session_key: string = 'session.key'
    private has_password: boolean = true
    private api_key: string = 'api.key'
    private listen_key: string = 'listen.key'
    private id: number = 42
    private created_at: Dayjs = dayjs('2017-01-01T00:00:00.000Z')
    private favorites: number[] = []

    public with_has_password (has_password: boolean): this {
        this.has_password = has_password
        return this
    }

    public with_created_at (created_at: dayjs.ConfigType): this {
        this.created_at = dayjs(created_at)
        return this
    }

    public with_audio_token (audio_token: string): this {
        this.audio_token = audio_token
        return this
    }

    public with_session_key (session_key: string): this {
        this.session_key = session_key
        return this
    }

    public with_listen_key (listen_key: string): this {
        this.listen_key = listen_key
        return this
    }

    public with_api_key (api_key: string): this {
        this.api_key = api_key
        return this
    }

    public with_id (id: number): this {
        this.id = id
        return this
    }

    public with_favorites (favorites: Iterable<number>): this {
        this.favorites = [...favorites]
        return this
    }

    public build_guest (): GuestUser {
        return new GuestUser({
            authenticated: false,
            has_password: null,
            has_premium: false,
            audio_token: this.audio_token,
            session_key: this.session_key,
        })
    }

    public build_public (): PublicUser {
        return new PublicUser({
            id: this.id,
            authenticated: true,
            created_at: this.created_at,
            has_password: this.has_password,
            api_key: this.api_key,
            favorites: this.favorites,
            has_premium: null,
            audio_token: this.audio_token,
            session_key: this.session_key,
        })
    }

    public build_premium (): PremiumUser {
        return new PremiumUser({
            id: this.id,
            authenticated: true,
            created_at: this.created_at,
            has_password: this.has_password,
            api_key: this.api_key,
            favorites: this.favorites,
            has_premium: true,
            listen_key: this.listen_key,
            audio_token: this.audio_token,
            session_key: this.session_key,
        })
    }
}
