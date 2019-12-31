import {ClientError} from './ClientError'

export class ChannelNotFoundError extends ClientError {
    public readonly channel_key: string

    public constructor (channel_key: string) {
        super(`Channel with key "${channel_key} not found"`)

        this.channel_key = channel_key
    }
}
