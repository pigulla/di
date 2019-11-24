import {JsonObject} from 'type-fest'

export interface RawFailedAuthenticationResponse {
    auth: false
    errors: string[]
}

export interface RawSuccessfulAuthenticationResponse {
    auth: true
    confirmed: boolean
    premium_subscriber: boolean
    listen_key: string
    first_name: string
    last_name: string
    email: string
    return_to_url: string|null
}

export type RawAuthenticationResponse = RawFailedAuthenticationResponse|RawSuccessfulAuthenticationResponse

export class FailedAuthentcationResponse {
    // eslint-disable-next-line no-useless-constructor
    public constructor (
        public readonly auth: boolean,
        public readonly errors: string[],
    ) {}
}

export class SuccessfulAuthenticationResponse {
    // eslint-disable-next-line no-useless-constructor
    public constructor (
        public readonly auth: true,
        public readonly confirmed: boolean,
        public readonly premium_subscriber: boolean,
        public readonly listen_key: string,
        public readonly first_name: string,
        public readonly last_name: string,
        public readonly email: string,
        public readonly return_to_url: string|null,
    ) {}
}

export type AuthenticationResponse = FailedAuthentcationResponse|SuccessfulAuthenticationResponse

export function parse_authentication_response (raw: JsonObject): AuthenticationResponse {
    if (raw.auth === false) {
        return new FailedAuthentcationResponse(
            false,
            raw.errors as string[],
        )
    } else {
        return new SuccessfulAuthenticationResponse(
            true,
            raw.confirmed as boolean,
            raw.premium_subscriber as boolean,
            raw.listen_key as string,
            raw.first_name as string,
            raw.last_name as string,
            raw.email as string,
            raw.return_to_url as string|null,
        )
    }
}

export class AuthenticationFailureError extends Error {
    public readonly errors: string[]

    public constructor (failed_authentication_response: FailedAuthentcationResponse) {
        super('Authentication failure')

        this.errors = failed_authentication_response.errors
    }
}
