import {Channel, ChannelFilter} from './di'

export interface IChannelProvider {
    channel_exists (identifier: ChannelIdentifier): boolean
    get_channel (value: ChannelIdentifier): Channel
    get_channel_by_id (id: number): Channel
    get_channel_by_key (key: string): Channel
    get_channels (): Channel[]
    get_filters (): ChannelFilter[]
}

export type ChannelIdentifier = string|number|Channel;
