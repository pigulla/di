import {ClientError} from './ClientError'

export class ChannelNotFoundError extends ClientError {
    public constructor (channel_key: string) {
        super(`Channel with key "${channel_key} not found"`)
    }
}
