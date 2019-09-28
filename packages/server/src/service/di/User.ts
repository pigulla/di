import dayjs, {Dayjs} from 'dayjs';
import utc from 'dayjs/plugin/utc';

import {Channel} from './Channel';

dayjs.extend(utc);

export enum UserType {
    GUEST= 'guest',
    PUBLIC = 'public',
    PREMIUM = 'premium'
}

export interface RawUserData {
    authenticated: boolean;
    hasPremium: boolean|null;
    audio_token: string;
    session_key: string;
    hasPassword: boolean|null;
}

export interface UserData {
    authenticated: boolean;
    has_premium: boolean|null;
    audio_token: string;
    session_key: string;
    has_password: boolean|null;
}

interface RawGuestUserData extends RawUserData {
    authenticated: false;
    hasPremium: false;
    hasPassword: null;
}

export interface GuestUserData extends UserData {
    authenticated: false;
    has_premium: false;
    has_password: null;
}

interface RawAuthenticatedUserData extends RawUserData {
    id: number;
    authenticated: true;
    created_at: string;
    hasPassword: boolean; // False if signed on via Google or Facebook
    api_key: string;
    favorites: Array<{
        channel_id: number;
        position: number;
    }>;
}

interface AuthenticatedUserData extends UserData {
    id: number;
    authenticated: true;
    created_at: Dayjs;
    has_password: boolean;
    api_key: string;
    favorites: number[];
}

interface RawPublicUserData extends RawAuthenticatedUserData {
    hasPremium: null; // Not sure why this isn't simply false? Maybe false is for users whose subscription has expired?

    // Technically, non-premium users also have a listen_key, but it can't be used to listen to streams so we pretend
    // it's not even there. Not sure what that is about.
}

export interface PublicUserData extends AuthenticatedUserData {
    has_premium: null;
}

interface RawPremiumUserData extends RawAuthenticatedUserData {
    hasPremium: true;
    listen_key: string;
}

export interface PremiumUserData extends AuthenticatedUserData {
    has_premium: true;
    listen_key: string;
}

export abstract class User {
    public readonly type: UserType;
    public readonly authenticated: boolean;
    public readonly has_premium: boolean|null;
    public readonly audio_token: string;
    public readonly session_key: string;
    public readonly has_password: boolean|null;

    protected constructor (data: UserData, type: UserType) {
        this.type = type;
        this.authenticated = data.authenticated;
        this.has_premium = data.has_premium;
        this.audio_token = data.audio_token;
        this.session_key = data.session_key;
        this.has_password = data.has_password;
    }

    public static from_raw (type: UserType, data: RawUserData): User {
        // The type could be deduced from the properties, but DI provides the type explicitly, so why not use that.

        /* eslint-disable @typescript-eslint/no-use-before-define */
        if (type === UserType.GUEST) {
            const raw = data as RawGuestUserData;
            const guest_data: GuestUserData = {
                authenticated: raw.authenticated,
                has_premium: raw.hasPremium,
                audio_token: raw.audio_token,
                session_key: raw.session_key,
                has_password: raw.hasPassword,
            };
            return new GuestUser(guest_data);
        } else if (type === UserType.PUBLIC) {
            const raw = data as RawPublicUserData;
            const public_data: PublicUserData = {
                id: raw.id,
                created_at: dayjs(raw.created_at),
                api_key: raw.api_key,
                favorites: raw.favorites
                    .sort((a, b) => a.position - b.position)
                    .map(({channel_id}) => channel_id),
                authenticated: raw.authenticated,
                has_premium: raw.hasPremium,
                audio_token: raw.audio_token,
                session_key: raw.session_key,
                has_password: raw.hasPassword,
            };
            return new PublicUser(public_data);
        } else if (type === UserType.PREMIUM) {
            const raw = data as RawPremiumUserData;
            const premium_data: PremiumUserData = {
                id: raw.id,
                created_at: dayjs(raw.created_at),
                api_key: raw.api_key,
                listen_key: raw.listen_key,
                favorites: raw.favorites
                    .sort((a, b) => a.position - b.position)
                    .map(({channel_id}) => channel_id),
                authenticated: raw.authenticated,
                has_premium: raw.hasPremium,
                audio_token: raw.audio_token,
                session_key: raw.session_key,
                has_password: raw.hasPassword,
            };
            return new PremiumUser(premium_data);
        }
        /* eslint-enable @typescript-eslint/no-use-before-define */

        throw new Error('Unexpected user type');
    }

    public is_guest (): boolean {
        return this.type === UserType.GUEST;
    }

    public is_public (): boolean {
        return this.type === UserType.PUBLIC;
    }

    public is_premium (): boolean {
        return this.type === UserType.PREMIUM;
    }

    public is_favorite (_channel: Channel): boolean {
        return false;
    }
}

export abstract class AuthenticatedUser extends User {
    public readonly id: number;
    public readonly created_at: Dayjs;
    public readonly has_password: boolean;
    public readonly api_key: string;
    public readonly favorites: number[];

    protected constructor (data: AuthenticatedUserData, type: UserType) {
        super(data, type);

        this.id = data.id;
        this.has_password = data.has_password;
        this.api_key = data.api_key;
        this.created_at = data.created_at;
        this.favorites = data.favorites;
    }

    public is_favorite (channel: Channel): boolean {
        return this.favorites.includes(channel.id);
    }
}

export class GuestUser extends User {
    public readonly authenticated: false;
    public readonly has_premium: false;
    public readonly has_password: null;

    public constructor (data: GuestUserData) {
        super(data, UserType.GUEST);

        this.authenticated = false;
        this.has_premium = false;
        this.has_password = null;
    }
}

export class PublicUser extends AuthenticatedUser {
    public readonly has_premium: null;

    public constructor (data: PublicUserData) {
        super(data, UserType.PUBLIC);

        this.has_premium = null;
    }
}

export class PremiumUser extends AuthenticatedUser {
    public readonly listen_key: string;

    public constructor (data: PremiumUserData) {
        super(data, UserType.PREMIUM);

        this.listen_key = data.listen_key;
    }
}
